/**
 * @Author: 毛毛 
 * @Date: 2023-04-16 09:12:45 
 * @Last Modified by: 毛毛
 * @Last Modified time: 2023-04-16 09:58:46
 * @description 注册简单事件
 */

import { registerTwoPhaseEvent } from "./EventRegistry";

const simpleEventPluginEvents = [
  'click',
  // 源码还有很多的简单事件
  // 'submit',
  // 'reset',
  // 'resize',
  // 'scroll'
]
/**
 * 原生事件对应的react事件名 通过click触发找到dom元素上绑定的onClick等属性
 * 但是onClick理论上并不是真的从真实dom上取的 而是从其对应的fiber属性上拿到的
 * pendingProps.onClick
 * pedningProps的来源就是虚拟dom上的props
 * 在源码中，为了方便，让真实dom上有了fiber中props的值 node[internalPropsKey] = props
 * 主要是为了取值更方便
 */
export const topLevelEventsToReactNames = new Map<string, string>()
/**
 * 注册简单事件
 */
export const registerSimpleEvents = () => {
  for (let i = 0; i < simpleEventPluginEvents.length; i++) {
    const eventName = simpleEventPluginEvents[i]
    const domEventName = eventName.toLowerCase()
    // 首字母大写事件名
    const capitalizeEnvet = eventName[0].toUpperCase() + domEventName.slice(1); // Click
    registerSimpleEvent(domEventName, `on${capitalizeEnvet}`) // click onClick
  }
}
/**
 * 注册单个简单事件
 * @param domEventName 
 * @param reactName 
 */
export const registerSimpleEvent = (domEventName: string, reactName: string) => {
  // 原生事件名和处理函数的名字进行映射
  topLevelEventsToReactNames.set(domEventName, reactName)
  registerTwoPhaseEvent(reactName, [domEventName]); // onClick [click]
}