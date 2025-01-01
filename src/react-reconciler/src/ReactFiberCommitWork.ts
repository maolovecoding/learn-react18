import {
  appendChild,
  insertBefore,
} from "react-dom-bindings/src/client/ReactDOMHostConfig";
import { FiberNode } from "./ReactFiber";
import { MutationMask, Placement } from "./ReactFiberFlags";
import { FiberRootNode } from "./ReactFiberRoot";
import { HostComponent, HostRoot, HostText } from "./ReactWorkTags";

/**
 * 遍历fiber 执行fiber上的副作用
 * @param finishedWork fiber节点
 * @param root 根节点
 */
export const commitMutationEffectsOnFiber = (
  finishedWork: FiberNode,
  root: FiberRootNode
) => {
  switch (finishedWork.tag) {
    case HostRoot:
    case HostComponent:
    case HostText: {
      // 先遍历它们的子节点，处理子节点上的副作用
      recursivelyTraverseMutationEffects(root, finishedWork);
      // 再处理自己身上的副作用
      commitReconciliationEffects(finishedWork);
    }
  }
};
/**
 * 先遍历它们的子节点，处理子节点上的副作用
 * @param root
 * @param parentFiber
 */
const recursivelyTraverseMutationEffects = (
  root: FiberRootNode,
  parentFiber: FiberNode
) => {
  if (parentFiber.subtreeFlags & MutationMask) {
    let { child } = parentFiber;
    while (child !== null) {
      commitMutationEffectsOnFiber(child, root);
      child = child.sibling;
    }
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
