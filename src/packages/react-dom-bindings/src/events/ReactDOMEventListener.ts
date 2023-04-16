/**
 * @Author: 毛毛 
 * @Date: 2023-04-16 10:10:37 
 * @Last Modified by: 毛毛
 * @Last Modified time: 2023-04-16 15:31:52
 * @description react dom 事件监听
 */

import { getClosestInstanceFormNode } from "../client/ReactDOMComponentTree";
import { dispatchEventForPluginEventSystem } from "./DOMPluginEventSystem";
import getEventTarget from "./getEventTarget";

/**
 * 创建事件监听函数包裹优先级
 */
export const createEventListenerWrapperWithProiority = (targetContainer: Node, domEventName: string, evnetSystemFlags: number): (nativeEvent: Event) => void => {
  // 事件监听包裹器
  const listenerWrapper = dispatchDiscreateEvent
  return listenerWrapper.bind(null, domEventName, evnetSystemFlags, targetContainer)
}
/**
 * 派发离散的事件的监听函数
 * 什么是离散的事件？ 不会连续触发的事件 如click：点击一下触发一下
 * 如滚动，缩放：就是连续触发的事件
 * @param domEventName dom事件名
 * @param evnetSystemFlags 事件阶段
 * @param targetContainer 容器
 * @param nativeEvent 原生的事件 
 */
const dispatchDiscreateEvent = (domEventName: string, evnetSystemFlags: number, container: Node, nativeEvent: Event) => { 
  dispatchEvent(domEventName, evnetSystemFlags, container, nativeEvent)
};
/**
 * 派发事件 委托
 * 此方法就是委托给容器的回调 
 * 当容器root在捕获或者冒泡阶段处理事件的时候会执行此函数
 * @param domEventName 
 * @param evnetSystemFlags 
 * @param container 
 * @param nativeEvent 原生事件的类型  Event对象
 */
export const dispatchEvent = (domEventName: string, evnetSystemFlags: number, container: Node, nativeEvent: Event) => {
  // 拿到原生事件的目标对象 触发事件的对象
  const nativeEventTarget = getEventTarget(nativeEvent)
  // 从这个dom节点找到最近的fiber节点
  const targetInst = getClosestInstanceFormNode(nativeEventTarget as Node)
  // 为插件事件系统派发event
  dispatchEventForPluginEventSystem(
    domEventName, // click 
    evnetSystemFlags, // 0 4
    nativeEvent, // 原生事件 event
    targetInst, // 触发事件的目标dom对象对应的fiber节点
    container
  )
}