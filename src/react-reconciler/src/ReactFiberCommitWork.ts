import {
  appendChild,
  insertBefore,
  commitUpdate,
  removeChild,
} from "react-dom-bindings/src/client/ReactDOMHostConfig";
import { FiberNode } from "./ReactFiber";
import {
  MutationMask,
  NoFlags,
  Passive,
  Placement,
  Update,
} from "./ReactFiberFlags";
import {
  HasEffect as HookHasEffect,
  Passive as HookPassive,
} from "./ReactHookEffectTags";
import { FiberRootNode } from "./ReactFiberRoot";
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
} from "./ReactWorkTags";
import { Container } from "react-dom/client";

/**
 * 真实DOM的父节点
 */
let hostParent: Container = null;

/**
 * 遍历fiber 执行fiber上的副作用
 * @param finishedWork fiber节点
 * @param root 根节点
 */
export const commitMutationEffectsOnFiber = (
  finishedWork: FiberNode,
  root: FiberRootNode
) => {
  // 老fiber
  const current = finishedWork.alternate;
  const flags = finishedWork.flags; // 副作用
  switch (finishedWork.tag) {
    case FunctionComponent:
    case HostRoot:
    case HostText: {
      // 先遍历它们的子节点，处理子节点上的副作用
      recursivelyTraverseMutationEffects(root, finishedWork);
      // 再处理自己身上的副作用
      commitReconciliationEffects(finishedWork);
      break;
    }
    case HostComponent: {
      // 先遍历它们的子节点，处理子节点上的副作用
      recursivelyTraverseMutationEffects(root, finishedWork);
      // 再处理自己身上的副作用
      commitReconciliationEffects(finishedWork);
      // 处理dom更新
      if (flags & Update) {
        const instance = finishedWork.stateNode; // dom元素
        if (instance !== null) {
          // 更新真实 DOM
          const newProps = finishedWork.memoizedProps;
          const oldProps = current !== null ? current.memoizedProps : newProps;
          const type = finishedWork.type;
          const updatePayload = finishedWork.updateQueue as unknown as string[];
          finishedWork.updateQueue = null;
          if (updatePayload !== null) {
            // 提交更新
            commitUpdate(
              instance,
              updatePayload,
              type,
              oldProps,
              newProps,
              finishedWork
            );
          }
        }
      }
      break;
    }
    default:
      break;
  }
};
/**
 * 先遍历它们的子节点，递归的处理子节点上的副作用
 * @param root
 * @param parentFiber
 */
const recursivelyTraverseMutationEffects = (
  root: FiberRootNode,
  parentFiber: FiberNode
) => {
  // 先处理要删除的fiber节点
  const deletions = parentFiber.deletions;
  if (deletions !== null) {
    for (const childToDelete of deletions) {
      commitDeletionEffects(root, parentFiber, childToDelete);
    }
  }
  if (parentFiber.subtreeFlags & MutationMask) {
    let { child } = parentFiber;
    while (child !== null) {
      commitMutationEffectsOnFiber(child, root);
      child = child.sibling;
    }
  }
};
/**
 * 提交删除的副作用
 * @param root 根
 * @param returnFiber 父fiber
 * @param deletedFiber 要删除的fiber
 */
const commitDeletionEffects = (
  root: FiberRootNode,
  returnFiber: FiberNode,
  deletedFiber: FiberNode
) => {
  // 一直向上找 直到发现一个是真实DOM的fiber为止
  let parent = returnFiber;
  findParent: while (parent !== null) {
    // 找到有真实dom的父fiber
    switch (parent.tag) {
      case HostComponent:
        hostParent = parent.stateNode;
        break findParent;
      case HostRoot:
        hostParent = (parent.stateNode as FiberRootNode).containerInfo;
        break findParent;
    }
    parent = parent.return;
  }
  commitDeletionEffectsOnFiber(root, returnFiber, deletedFiber);
  hostParent = null;
};
/**
 * 在fiber上提交删除的副作用
 * @param finishedRoot
 * @param nearestMountedAncestor
 * @param deletedFiber
 */
const commitDeletionEffectsOnFiber = (
  finishedRoot: FiberRootNode,
  nearestMountedAncestor: FiberNode,
  deletedFiber: FiberNode
) => {
  switch (deletedFiber.tag) {
    case HostComponent:
    case HostText:
      // TODO 为什么递归？ 考虑到 类组件的存在 div的子节点可能是类组件，需要处理生命周期这种
      // 递归处理子节点的删除 先删除子节点
      recursivelyTraverseDeletionEffects(
        finishedRoot,
        nearestMountedAncestor,
        deletedFiber
      );
      // 再删除节点自己
      if (hostParent !== null) {
        removeChild(hostParent, deletedFiber.stateNode);
      }
      break;
    default:
      break;
  }
};
/**
 * 递归删除子节点
 * @param finishedRoot
 * @param nearestMountedAncestor
 * @param parentFiber
 */
const recursivelyTraverseDeletionEffects = (
  finishedRoot: FiberRootNode,
  nearestMountedAncestor: FiberNode,
  parentFiber: FiberNode
) => {
  let child = parentFiber.child;
  while (child !== null) {
    commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, child);
    child = child.sibling;
  }
};
/**
 * 处理自己身上的副作用
 * @param finishedWork
 */
const commitReconciliationEffects = (finishedWork: FiberNode) => {
  const { flags } = finishedWork;
  if (flags & Placement) {
    // 插入操作 把此fiber对应的真实DOM添加到父真实dom上
    commitPlacement(finishedWork);
    finishedWork.flags &= ~Placement; // 清除插入操作标识
  }
};
/**
 * 获取最近的弟弟真实DOM节点
 * 找到要插入的锚点，找到可以插在它前面的那个fiber对应的真实DOM
 * @param fiber
 */
const getHostSibling = (fiber: FiberNode) => {
  let node = fiber;
  siblings: while (true) {
    // 一直找弟弟 没有找父亲 再找父亲的弟弟
    while (node.sibling === null) {
      if (node.return === null || isHostParent(node.return)) {
        return null;
      }
      node = node.return;
    }
    node = node.sibling;
    while (node.tag !== HostComponent && node.tag !== HostText) {
      // 不是原生节点
      if (node.flags & Placement) {
        // 是将要插入的节点 这个节点还不存在 不可用
        // 找弟弟节点
        continue siblings;
      } else {
        // 是已经有的节点 找孩子
        node = node.child;
      }
    }
    // 真实dom不是插入的fiber节点 说明页面已经有这个元素 可以使用作为锚点
    if (!(node.flags & Placement)) {
      return node.stateNode;
    }
  }
};

/**
 * 把此fiber的真实DOM插入到父fiber里
 * @example 思路
 * ```ts
 * const parentFiber = finishedWork.return
 * parentFiber.stateNode.appendChild(finishedWork.stateNode)
 * ```
 * @param finishedWork
 */
const commitPlacement = (finishedWork: FiberNode) => {
  // 获取父fiber 找到具有真实DOM节点的fiber
  const parentFiber = getHostParentFiber(finishedWork);
  switch (parentFiber.tag) {
    case HostRoot: {
      const parent = parentFiber.stateNode.containerInfo; // 真实dom容器
      const before = getHostSibling(finishedWork); // 获取最近的兄弟dom节点(弟弟)
      insertOrAppendPlacementNode(finishedWork, before, parent);
      break;
    }
    case HostComponent: {
      const parent = parentFiber.stateNode; // 真实dom节点
      const before = getHostSibling(finishedWork);
      insertOrAppendPlacementNode(finishedWork, before, parent);
      break;
    }
    default:
      break;
  }
};
/**
 * 把子节点对应的真实DOM插入到父节点中
 * @param node 将要插入的fiber节点
 * @param parent 父真实dom节点
 */
const insertOrAppendPlacementNode = (node: FiberNode, before, parent) => {
  const { tag } = node;
  // 是否是原生节点
  const isHost = tag === HostComponent || tag === HostText;
  if (isHost) {
    // 是原生真实dom 直接插入
    const { stateNode } = node;
    if (before !== null) {
      insertBefore(parent, stateNode, before);
    } else {
      appendChild(parent, stateNode);
    }
  } else {
    // 不是真实DOM节点
    const child = node.child;
    if (child !== null) {
      // 有孩子 递归找到真实DOM的子节点
      insertOrAppendPlacementNode(child, before, parent);
      let sibling = child.sibling;
      while (sibling !== null) {
        insertOrAppendPlacementNode(sibling, before, parent);
        sibling = sibling.sibling;
      }
    }
  }
};

/**
 * 找到具有真实DOM节点的父fiber
 * @param fiber
 * @returns
 */
const getHostParentFiber = (fiber: FiberNode) => {
  let parent = fiber.return;
  while (parent !== null) {
    if (isHostParent(parent)) {
      return parent;
    }
    parent = parent.return;
  }
  return null;
};
/**
 * 是原生节点
 * @param fiber
 * @returns
 */
const isHostParent = (fiber: FiberNode) => {
  const parentTag = fiber.tag;
  return parentTag === HostComponent || parentTag === HostRoot;
};

/**
 * 销毁 destroy effect的执行
 * @param finishedWork
 */
export const commitPassiveUnmountEffects = (finishedWork: FiberNode) => {
  commitPassiveUnmountOnFiber(finishedWork);
};

const commitPassiveUnmountOnFiber = (finishedWork: FiberNode) => {
  const flags = finishedWork.flags;
  switch (finishedWork.tag) {
    case HostRoot:
      recursivelyTraversePassiveUnmountEffects(finishedWork);
      break;
    case FunctionComponent:
      recursivelyTraversePassiveUnmountEffects(finishedWork);
      if (flags & Passive) {
        // 1024
        commitHookPassiveUnmountEffects(
          finishedWork,
          HookPassive | HookHasEffect
        );
      }
      break;
  }
};

const recursivelyTraversePassiveUnmountEffects = (parentFiber: FiberNode) => {
  if ((parentFiber.subtreeFlags & Passive) !== NoFlags) {
    let child = parentFiber.child;
    while (child !== null) {
      commitPassiveUnmountOnFiber(child);
      child = child.sibling;
    }
  }
};
/**
 * create effect 副作用的执行
 * @param root
 * @param finishedWork
 */
export const commitPassiveMountEffects = (
  root: FiberRootNode,
  finishedWork: FiberNode
) => {
  commitPassiveMountOnFiber(root, finishedWork);
};

const commitHookPassiveUnmountEffects = (
  finishedWork: FiberNode,
  hookFlags: number
) => {
  commitHookEffectListUnmount(hookFlags, finishedWork);
};
/**
 * 提交副作用链表 updateQueue => effect1 => effect2
 * 执行hook的链表（updateQueue）
 * @param finishedWork
 * @param flags
 */
const commitHookEffectListUnmount = (
  flags: number,
  finishedWork: FiberNode
) => {
  const updateQueue = finishedWork.updateQueue;
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
  if (lastEffect !== null) {
    const firstEffect = lastEffect.next;
    let effect = firstEffect;
    do {
      if ((effect.tag & flags) === flags) {
        const destroy = effect.destroy;
        if (destroy !== undefined) {
          destroy();
        }
      }
      effect = effect.next;
    } while (effect !== firstEffect);
  }
};

export const commitPassiveMountOnFiber = (
  finishedRoot: FiberRootNode,
  finishedWork: FiberNode
) => {
  const flags = finishedWork.flags;
  switch (finishedWork.tag) {
    case HostRoot:
      recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork);
      break;
    case FunctionComponent:
      recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork);
      if (flags & Passive) {
        // 1024
        commitHookPassiveMountEffects(
          finishedWork,
          HookPassive | HookHasEffect
        );
      }
      break;
  }
};
/**
 * 深度优先遍历子fiber
 * @param root
 * @param parentFiber
 */
const recursivelyTraversePassiveMountEffects = (
  root: FiberRootNode,
  parentFiber: FiberNode
) => {
  if ((parentFiber.subtreeFlags & Passive) !== NoFlags) {
    let child = parentFiber.child;
    while (child !== null) {
      commitPassiveMountOnFiber(root, child);
      child = child.sibling;
    }
  }
};
/**
 *
 * @param finishedWork
 * @param hookFlags
 */
const commitHookPassiveMountEffects = (
  finishedWork: FiberNode,
  hookFlags: number
) => {
  commitHookEffectListMount(hookFlags, finishedWork);
};
/**
 * 执行hook的链表（updateQueue）
 * @param hookFlags
 * @param finishedWork
 */
const commitHookEffectListMount = (flags: number, finishedWork: FiberNode) => {
  const updateQueue = finishedWork.updateQueue;
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
  if (lastEffect !== null) {
    const firstEffect = lastEffect.next;
    let effect = firstEffect;
    do {
      if ((effect.tag & flags) === flags) {
        const create = effect.create;
        effect.destroy = create();
      }
      effect = effect.next;
    } while (effect !== firstEffect);
  }
};
