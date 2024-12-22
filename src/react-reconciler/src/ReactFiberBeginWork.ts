import logger from "shared/logger";
import { FiberNode } from "./ReactFiber";
import { HostComponent, HostRoot, HostText } from "./ReactWorkTags";
import { progressUpdateQueue } from "./ReactFiberClassUpdate";
import { mountChildFibers, reconcileChildFibers } from "./ReactChildFiber";
import { ReactElementType } from "react/type";

/**
 * 更新根节点
 * @param current
 * @param workInProgress
 * @returns 返回子节点
 */
const updateHostRoot = (current: FiberNode, workInProgress: FiberNode) => {
  // 需要知道子虚拟DOM信息(在更新队列中放着虚拟DOM的)
  progressUpdateQueue(workInProgress); // 处理更新队列 workInProgress.memoizedState = payload = { element }
  // 新状态
  const nextState = workInProgress.memoizedState;
  // 新子节点
  const nextChildren: ReactElementType = nextState.element;
  // 根据新的虚拟DOM生成子fiber链表
  reconcileChildren(current, workInProgress, nextChildren); // 协调子节点 dom diff
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
 * child sibling
 * 先找下一个节点，先大孩子，没有则找自己的兄弟节点 再没有返回父亲节点找对应父亲的兄弟节点
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

/**
 * 根据 新的虚拟DOM生成新的fiber链表
 * @param current 老fiber
 * @param workInProgress 新fiber
 * @param nextChildren 新子虚拟DOM
 */
const reconcileChildren = (
  current: FiberNode,
  workInProgress: FiberNode,
  nextChildren: ReactElementType
) => {
  if (current === null) {
    // 新fiber没对应的老fiber 说明此fiber是新创建的
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren); // 挂载子fiber链表
  } else {
    // 有 老fiber 做 dom-diff 老的fiber链表和新的虚拟DOM进行比较 进行最小化更新
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren
    );
  }
};
