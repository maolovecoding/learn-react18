import logger from "shared/logger";
import { FiberNode } from "./ReactFiber";
import { HostComponent, HostRoot, HostText } from "./ReactWorkTags";

/**
 * 更新根节点
 * @param current
 * @param workInProgress
 * @returns 返回子节点
 */
const updateHostRoot = (current: FiberNode, workInProgress: FiberNode) => {
  // 需要知道子虚拟DOM信息(在更新队列中放着虚拟DOM的)
  // progressUpdateQueue(workInProgress); // 处理更新队列 workInProgress.memoizedState = payload = { element }
  // 新状态
  // const nextState = workInProgress.memoizedState;
  // 新子节点
  // const nextChildren = nextState.element;
  // reconcileChildren(current, workInProgress, nextChildren); // 协调子节点 dom diff
  return workInProgress.child;
};

/**
 * 更新原生节点
 * @param current
 * @param workInProgress
 */
const updateHostComponent = (current: FiberNode, workInProgress: FiberNode) => {
  return null;
};

/**
 * 根据虚拟DOM构建新的fiber链表
 * child.sibling
 * @param current 老fiber
 * @param workInProgress 新fiber
 */
export const beginWork = (current: FiberNode, workInProgress: FiberNode) => {
  logger("beginWork", workInProgress);
  switch (workInProgress.tag) {
    case HostRoot:
      return updateHostRoot(current, workInProgress);
    case HostComponent:
      return updateHostComponent(current, workInProgress);
    case HostText:
      // 文本节点么有子节点
      return null;
    default:
      return null;
  }
};
