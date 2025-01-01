import assign from "shared/assign";
import { FiberNode, IUpdate } from "./ReactFiber";
import { markUpdateLaneFromFiberToRoot } from "./ReactFiberConcurrentUpdates";

/**
 * 更新状态
 */
export const UpdateState = 0;

/**
 * 初始化更新队列
 * @param fiber
 */
export const initialUpdateQueue = (fiber: FiberNode) => {
  // 创建一个新的更新队列
  const queue = {
    shared: {
      // 一个循环链表
      pending: null,
    },
  };
  fiber.updateQueue = queue;
};

/**
 * 创建更新对象
 * @returns
 */
export const createUpdate = () => {
  const update = {
    tag: UpdateState, // 更新(update)状态
  } as IUpdate;
  return update;
};

/**
 * 更新入队到fiber的更新队列
 * @param fiber
 * @param update 更新
 */
export const enqueueUpdate = (fiber: FiberNode, update: IUpdate) => {
  const updateQueue = fiber.updateQueue;
  const pending = updateQueue.shared.pending;
  if (pending === null) {
    // 首次 没有更新
    update.next = update;
  } else {
    // 有更新链表
    // 当前更新指向之前的pending 也就是 pending一直指向最后一个更新 第一个更新指向当前更新
    update.next = pending;
    pending.next = update;
  }
  updateQueue.shared.pending = update;
  // 返回根节点 从当前的fiber冒泡一直找到根节点 有更新赛道优先级 32个
  return markUpdateLaneFromFiberToRoot(fiber);
};

/**
 * 根据老状态和更新队列中的更新 计算最新的状态
 * @param workInProgress 要计算的fiber节点
 */
export const progressUpdateQueue = (workInProgress: FiberNode) => {
  const queue = workInProgress.updateQueue;
  const pendingQueue = queue.shared.pending;
  // 如果有更新 或者说更新队列里面有内容
  if (pendingQueue !== null) {
    // 清除等待生效的更新
    queue.shared.pending = null;
    // 获取更新队列中的最后一个更新  update = { payload: element }
    const lastPendingUpdate = pendingQueue;
    const firstPendingUpdate = lastPendingUpdate.next; // 第一个等待生效的更新
    pendingQueue.next = null; // 断开环形链表 变成单链表
    let newState = workInProgress.memoizedState; // 获取老状态(lastState => computed => newState)
    let update = firstPendingUpdate; // 第一个更新
    while (update !== null) {
      // 根据老状态 和更新update计算新状态
      newState = getStateFromUpdate(update, newState);
      update = update.next;
    }
    workInProgress.memoizedState = newState; // 赋值更新后的状态
  }
};
/**
 * 根据老状态和更新 计算新状态 进行状态合并
 * @param update 更新的对象其实有很多种类型
 * @param prevState
 * @returns 计算后的state
 */
const getStateFromUpdate = (update: IUpdate, prevState) => {
  switch (update.tag) {
    case UpdateState: {
      const { payload } = update;
      return assign({}, prevState, payload);
    }
  }
};
