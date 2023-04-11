/**
 * @Author: 毛毛 
 * @Date: 2023-04-10 23:03:05 
 * @Last Modified by: 毛毛
 * @Last Modified time: 2023-04-10 23:11:20
 * @description 计划调度
 */
/**
 * 计划调度回调函数
 * TODO 此处后面我们会实现优先级队列
 */
export const scheduleCallback = (callback: IdleRequestCallback) => {
  requestIdleCallback(callback)
}