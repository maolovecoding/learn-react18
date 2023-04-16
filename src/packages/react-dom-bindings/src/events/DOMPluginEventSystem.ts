/**
 * @Author: 毛毛 
 * @Date: 2023-04-14 15:57:02 
 * @Last Modified by: 毛毛
 * @Last Modified time: 2023-04-16 16:29:37
 * @description 事件系统dom插件 
 */
import { FiberNode } from "react-reconciler/src/ReactFiber";
import { addEventBubbleListener, addEventCaptureListener } from "./EventListener";
import { allNativeEvents } from "./EventRegistry"
import { IS_CAPTURE_PHASE } from "./EventSystemFlags";
import { createEventListenerWrapperWithProiority } from "./ReactDOMEventListener";
import * as SimpleEventPlugin from './plugins/SimpleEventPlugin'
import getEventTarget from "./getEventTarget";
import { HostComponent } from "react-reconciler/src/ReactWorkTags";
import getListener from "./getListener";

// 开局注册简单事件
SimpleEventPlugin.registerEvents()

// listen唯一标识
const listeningMarker = '_reactlistening' + Math.random().toString(36).slice(2)

/**
 * 绑定事件 事件委托
 */
export const listenToAllSupportedEvents = (rootContainerElement: Node) => {
  // 遍历所有原生事件 如 click 监听
  if (!rootContainerElement[listeningMarker]) {
    // 简单div#root 只有一次
    rootContainerElement[listeningMarker] = true
    allNativeEvents.forEach(domEventName => {
      // 事件的冒泡和捕获
      listenToNativeEvent(domEventName, false, rootContainerElement)
      listenToNativeEvent(domEventName, true, rootContainerElement)
    })
  }
}
/**
 * 监听注册原生事件
 * @param domEventName 事件
 * @param isCapturePhaseListener 是否是捕获阶段 true捕获
 * @param target 
 */
export const listenToNativeEvent = (domEventName: string, isCapturePhaseListener: boolean, target: Node) => {
  let eventSystemFlags = 0; // 事件标识 默认是冒泡
  if (isCapturePhaseListener) eventSystemFlags |= IS_CAPTURE_PHASE
  addTrappedEventListener(target, domEventName, eventSystemFlags, isCapturePhaseListener)
}

const addTrappedEventListener = (targetContainer: Node, domEventName: string, eventSystemFlags: number, isCapturePhaseListener: boolean) => {
  // 创建事件监听包裹优先级
  // TODO 优先级目前实际并没有做区分
  const listener = createEventListenerWrapperWithProiority(targetContainer, domEventName, eventSystemFlags);
  if (isCapturePhaseListener) {
    addEventCaptureListener(targetContainer, domEventName, listener) // 增加事件捕获监听
  } else {
    addEventBubbleListener(targetContainer, domEventName, listener) // 增加事件冒泡监听
  }
}

/**
 * 为插件事件系统派发event
 * @param domEventName 
 * @param eventSystemFlags 
 * @param nativeEvent 原生事件 event
 * @param targetInst 触发事件的目标dom对象对应的fiber节点
 * @param targetContainer 
 */
export const dispatchEventForPluginEventSystem = (
    domEventName: string, // click 
    eventSystemFlags: number, // 0 4
    nativeEvent: Event, 
    targetInst: FiberNode, 
    targetContainer: Node
) => {
  dispatchEventForPlugins(
    domEventName,
    eventSystemFlags,
    nativeEvent,
    targetInst,
    targetContainer
  )
};

const dispatchEventForPlugins = (
    domEventName: string,
    eventSystemFlags: number,
    nativeEvent: Event, 
    targetInst: FiberNode, 
    targetContainer: Node
) => {
  // 事件触发源dom
  const nativeEventTarget = getEventTarget(nativeEvent)
  // 派发事件数组 向上冒泡 向下捕获
  const dispatchQueue = [] as any[]
  extractEvents(
    dispatchQueue,
    domEventName,
    targetInst,
    nativeEvent,
    nativeEventTarget,
    eventSystemFlags,
    targetContainer
  )
  // console.log(dispatchQueue)
};
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
export const extractEvents = (
    dispatchQueue,
    domEventName: string,
    targetInst: FiberNode,
    nativeEvent: Event,
    nativeEventTarget: Node,
    eventSystemFlags: number,
    targetContainer: Node
) => {
  SimpleEventPlugin.extractEvents(
    dispatchQueue,
    domEventName,
    targetInst,
    nativeEvent,
    nativeEventTarget,
    eventSystemFlags,
    targetContainer
  )
};

/**
 * 累加单阶段 监听的回调函数
 * @param targetFiber 
 * @param reactName 
 * @param nativeEventType 
 * @param isCapturePhase 
 */
export const accumulateSinglePhaseListeners = (
  targetFiber: FiberNode,
  reactName: string, // onClick
  nativeEventType: string,
  isCapturePhase: boolean
) => {
  const captureName = reactName + 'Capture'; // onClickCapture
  const reactEventName = isCapturePhase ? captureName : reactName
  const listeners = [] as ((event: Event) => void)[]
  let instance = targetFiber
  while (instance !== null) {
    const stateNode = instance.stateNode as Node
    const tag = instance.tag
    if (tag === HostComponent && stateNode !== null) {
      // 原生节点
      if (reactEventName !== null) {
        const listener = getListener(instance, reactEventName)
        if (listener !== null) {
          listeners.push(listener)
        }
      }
    }
    instance = instance.return
  }
  return listeners
}