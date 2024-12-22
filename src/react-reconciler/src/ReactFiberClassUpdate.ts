import { FiberNode, IUpdate } from "./ReactFiber";
import { markUpdateLaneFromFiberToRoot } from "./ReactFiberConcurrentUpdates";

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
  const update = {} as IUpdate;
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
