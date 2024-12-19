import { FiberNode } from "./ReactFiber";

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
