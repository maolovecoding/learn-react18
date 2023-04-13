import { appendChild, insertBefore } from "react-dom-bindings/src/client/ReactDOMHostConfig";
import { FiberNode } from "./ReactFiber";
import { MutationMask, Placement } from "./ReactFiberTags";
import { HostComponent, HostRoot, HostText } from "./ReactWorkTags";
import { FiberRootNode } from "./createFiberRoot";

/**
 * 遍历fiber树 执行fiber上的副作用
 * @param finishedWork 
 * @param root 
 */
export const commitMutaionEffectsOnFiber = (finishedWork: FiberNode, root: FiberRootNode) => {
  switch (finishedWork.tag) {
  case HostRoot:
  case HostComponent:
  case HostText:
    // 递归的遍历子节点 处理子节点副作用
    recursivelyTraverseMutaionEffects(root, finishedWork)
    // 然后处理自己身上的副作用
    commitReconciliationEffects(finishedWork)
    break
  }
};
/**
 * 递归的遍历子节点 处理子节点副作用
 * @param root 
 * @param parentFiber 
 */
export const recursivelyTraverseMutaionEffects = (root: FiberRootNode, parentFiber: FiberNode) => {
  if (parentFiber.subtreeFlags & MutationMask) {
    let { child } = parentFiber
    while (child !== null) {
      commitMutaionEffectsOnFiber(child, root)
      child = child.sibling
    }
  }
};
/**
 * 处理fiber自己的副作用
 * @param finishedWork 
 */
export const commitReconciliationEffects = (finishedWork: FiberNode) => {
  const { flags } = finishedWork
  if (flags & Placement) {
    // 把此fiber对应的真实dom节点添加到父节点的真实dom上
    commitPlacement(finishedWork)
    finishedWork.flags &= ~Placement // 去除插入副作用
  }
};
/**
 * 提交插入  fiber对应的真实dom插入到父fiber真实dom
 * @param finishedWork 
 */
const commitPlacement = (finishedWork: FiberNode) => {
  // let parentFiber = finishedWork.return;
  // (parentFiber.stateNode as Node).appendChild(finishedWork.stateNode as Node)
  const parentFiber = getHostParentFiber(finishedWork)
  switch (parentFiber.tag) {
    case HostRoot: // 根fiber
      const parent = (parentFiber.stateNode as FiberRootNode).containerInfo
      // 获取最近的真实dom节点
      const before = getHostSibling(finishedWork)
      insertOrAppendPlacementNode(finishedWork, before, parent)
      break
    case HostComponent: { // 原生dom fiber 括号解决块级作用域
      const parent = parentFiber.stateNode as Node
      const before = getHostSibling(finishedWork)
      insertOrAppendPlacementNode(finishedWork, before, parent)
      break
    }
    default:
      break
  }
};
/**
 * 找到此fiber有真实dom的父fiber
 * 函数式组件等对应的fiber是没有真实dom的
 * @param fiber 
 */
const getHostParentFiber = (fiber: FiberNode) => { 
  let parent = fiber.return
  while (parent !== null) {
    if (isHostParent(parent)) {
      return parent
    }
    parent = parent.return
  }
  return parent // null
};
/**
 * 是否是真实dom节点对应的父fiber
 * @param fiber 
 */
const isHostParent = (fiber: FiberNode) => {
  return fiber.tag === HostComponent || fiber.tag === HostRoot;
};
/**
 * 子fiber对应的真实dom插入到父fiber的真实dom中 追加
 * 插入节点并不是无脑追加到父节点的最后，而是需要插入到真实dom最近的弟弟fiber最近的真实dom前面
 * 也就是需要找到一个锚点，然后才插入dom到这个锚点前面 如果锚点是null 就是追加了
 * @param fiber 
 * @param parent 
 */
const insertOrAppendPlacementNode = (fiber: FiberNode, before: Node, parent: Node) => {
  const { tag } = fiber
  // 是原生节点
  const isHost = tag === HostComponent || tag === HostText
  if (isHost) {
    if (before !== null) {
      insertBefore(parent, fiber.stateNode as Node, before)
    } else {
      appendChild(parent, fiber.stateNode as Node)
    }
  } else {
    // 函数式组件 类组件 dom在儿子上
    const { child } = fiber
    if (child !== null) {
      // 插入儿子fiber对应的dom到父节点上，且儿子的兄弟都需要插入
      insertOrAppendPlacementNode(child, before, parent)
      let sibling = child.sibling
      while (sibling !== null) {
        insertOrAppendPlacementNode(sibling, before, parent)
        sibling = sibling.sibling
      }
    }
  }
};
/**
 * TODO 很难的方法
 * 找到fiber对应真实dom最近的弟弟dom 也就是要插入该dom节点前面的锚点（真实dom）
 * @param fiber 
 */
const getHostSibling = (fiber: FiberNode): Node => {
  let node = fiber
  siblings: while (true) {
    while (node.sibling === null) { // 没有弟弟 找父亲 
      // 没有父fiber 父fiber对应的有真实dom
      if (node.return === null || isHostParent(node.return)) return null
      node = node.return
    }
    node = node.sibling; // 找弟弟
    // 弟弟不是原生节点 不可用
    while (node.tag !== HostComponent && node.tag !== HostText) {
      // 如果节点是要插入的新节点 找它的弟弟
      if (node.flags & Placement) continue siblings // 是新增节点 不可用 继续找弟弟
      else node = node.child // 继续找孩子
    }
    // 不是插入的节点 也就是页面已经有该dom
    if (!(node.flags & Placement)) {
      return node.stateNode as Node
    }
  }
}