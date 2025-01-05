import { FiberNode } from "./ReactFiber";
import { HostRoot } from "./ReactWorkTags";

/**
 * 更新队列
 */
const concurrentQueue = [];
/**
 * 索引
 */
let concurrentQueuesIndex = 0;

/**
 * 本来此文件要处理更新优先级的问题
 * 但是目前只处理实现向上找到根节点
 * @param fiber
 */
export const markUpdateLaneFromFiberToRoot = (sourceFiber: FiberNode) => {
  let node = sourceFiber; // 当前 fiber
  let parent = sourceFiber.return; // 当前fiber的父fiber
  while (parent !== null) {
    node = parent;
    parent = parent.return;
  }
  // HostRootFiber
  if (node.tag === HostRoot) {
    return node.stateNode; // FiberRootNode
  }
  return null;
};

/**
 * 入队并发更新hooks更新队列
 * @param fiber 函数组件对应的fiber
 * @param queue 要更新的hook对应的更新队列
 * @param update 更新对象
 */
export const enqueueConcurrentHookUpdate = (fiber, queue, update) => {
  enqueueUpdate(fiber, queue, update);
  return getRootForUpdatedFiber(fiber);
};
/**
 * 把更新缓存到数组concurrentQueue中
 * @param fiber
 * @param queue
 * @param update
 */
const enqueueUpdate = (fiber, queue, update) => {
  // 缓存
  concurrentQueue[concurrentQueuesIndex++] = fiber;
  concurrentQueue[concurrentQueuesIndex++] = queue;
  concurrentQueue[concurrentQueuesIndex++] = update;
};

const getRootForUpdatedFiber = (sourceFiber: FiberNode) => {
  let node = sourceFiber;
  let parent = node.return;
  while (parent !== null) {
    node = parent;
    parent = node.return;
  }
  // 是根fiber => stateNode => FiberRootNode
  return node.tag === HostRoot ? node.stateNode : null;
};
/**
 * 完成队列的并发更新
 */
export const finishQueueingConcurrentUpdates = () => {
  const endIndex = concurrentQueuesIndex;
  concurrentQueuesIndex = 0;
  let i = 0;
  while (i < endIndex) {
    const fiber = concurrentQueue[i++];
    const queue = concurrentQueue[i++];
    const update = concurrentQueue[i++];
    if (queue !== null && update !== null) {
      const pending = queue.pending; // 空队列
      if (pending === null) {
        update.next = update;
      } else {
        update.next = pending.next;
        pending.next = update
      }
      queue.pending = update;
    }
  }
};
