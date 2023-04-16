import { FiberNode } from "react-reconciler/src/ReactFiber";
import { registerSimpleEvents, topLevelEventsToReactNames } from "../DOMEventProperties";
import { IS_CAPTURE_PHASE } from "../EventSystemFlags";
import { accumulateSinglePhaseListeners } from "../DOMPluginEventSystem";
/**
 * @Author: 毛毛 
 * @Date: 2023-04-16 09:11:54 
 * @Last Modified by: 毛毛
 * @Last Modified time: 2023-04-16 16:22:10
 * @description 简单事件插件
 */

/**
 * 提取事件
 * @param dispatchQueue 
 * @param domEventName 
 * @param targetInst 
 * @param nativeEvent 
 * @param nativeEventTarget 
 * @param eventSystemFlags 
 * @param targetContainer 
 */
const extractEvents = (
    dispatchQueue: ((event: Event) => void)[],
    domEventName: string, // click => reactName => onClick
    targetInst: FiberNode,
    nativeEvent: Event,
    nativeEventTarget: Node,
    eventSystemFlags: number,
    targetContainer: Node
) => {
  debugger
  const reactName = topLevelEventsToReactNames.get(domEventName)
  const isCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0; // 捕获阶段
  // 从fiber树中找到回调函数 放到队列
  const listeners = accumulateSinglePhaseListeners(
    targetInst,
    reactName,
    nativeEvent.type,
    isCapturePhase
  )
  console.log(listeners)
}


export {
  registerSimpleEvents as registerEvents, // 事件注册
  extractEvents, // 事件提取
};
