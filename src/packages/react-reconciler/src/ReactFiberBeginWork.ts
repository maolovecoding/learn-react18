import logger, { indent } from "shared/logger";
import { FiberNode } from "./ReactFiber";
import { HostComponent, HostRoot, HostText } from "./ReactWorkTags";
import { processUpdateQueue } from "./ReactFiberClassUpdateQueue";
import { IVNode, IVNodeProps } from "react/src/jsx/ReactJSXElement";
import { mountChildFibers, reconcileChildFibers } from "./ReactChildFiber";
import { shouldSetTextContent } from "react-dom-bindings/src/ReactDOMHostConfig";
/**
 * 
 * @param current 老fiber
 * @param workInProgress 构建中的fiber
 * @param nextChildren 新的子虚拟DOM
 */
const reconcileChildren = (current: FiberNode, workInProgress: FiberNode, nextChildren: IVNode | string | IVNode[]) => {
  if (current === null) {
    // 无老fiber 新fiber是新创建的 没有对应的老fiber节点
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren)
  } else {
    // 有老fiber 需要做协调 dom diff 老的子fiber链表和新的子虚拟dom进行比较 最小化更新
    workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren)
  }
}

/**
 * 开始工作 构建fiber 根据虚拟dom构建新的fiber子链表
 * @param current 老fiber 页面渲染的fiber
 * @param workInProgress 新fiber 正构建中
 * @returns 
 */
export const beginWork = (current: FiberNode, workInProgress: FiberNode) : FiberNode => {
  logger(' '.repeat(indent.number) + 'beginWork', workInProgress);
  indent.number += 2
  switch (workInProgress.tag) {
    case HostRoot:
      return updateHostRoot(current, workInProgress);
    case HostComponent:
      return updateHostComponent(current, workInProgress);
    case HostText:
      return null;
    default:
      return null;
  }
};
/**
 * 更新根fiber的子fiber树
 * @param current 
 * @param workInProgress 
 */
const updateHostRoot = (current: FiberNode, workInProgress: FiberNode) : FiberNode => {
  // 需要指定子虚拟DOM信息 更新队列中拿
  processUpdateQueue(workInProgress) // workInProgress.memoizedState = { element }
  const nextState = workInProgress.memoizedState
  const nextChildren = nextState.element as IVNode
  //  TODO dom diff 协调子节点
  // 根据新的虚拟DOM生成子fiber链表
  reconcileChildren(current, workInProgress, nextChildren)
  return workInProgress.child
}
/**
 * 更新原生fiber 原生组件的子fiber链表
 * @param current 页面展示的fiber
 * @param workInProgress 构建的fiber
 */
const updateHostComponent = (current: FiberNode, workInProgress: FiberNode) : FiberNode => {
  const { type, pendingProps: nextProps } = workInProgress
  // 虚拟DOM在pendingProps上的
  let nextChildren = (nextProps as IVNodeProps).children
  // 判断当前虚拟DOM它的儿子是不是一个文本独生子
  const isDirectTextChild = shouldSetTextContent(type, nextChildren)
  if (isDirectTextChild) {
    nextChildren = null // 子元素是独生子 不会构建子fiber了 
  }
  reconcileChildren(current, workInProgress, nextChildren)
  return workInProgress.child
}
