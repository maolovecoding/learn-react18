/**
 * 调度更新
 * 后面会实现优先队列
 * @param callback
 */
export const scheduleCallback = (callback: () => void) => {
  requestIdleCallback(callback);
};
