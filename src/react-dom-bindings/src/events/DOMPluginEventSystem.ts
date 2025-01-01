import { Container } from "react-dom/client";
import { allNativeEvents } from "./EventRegistry";
import * as SimpleEventPlugin from "./plugins/SimpleEventPlugin";
import { IS_CAPTURE_PHASE } from "./EventSystemFlags";
import { createEventListenerWrapperWithPriority } from "./ReactDOMEventListener";
import {
  addEventBubbleListener,
  addEventCaptureListener,
} from "./EventListener";
import { FiberNode } from "react-reconciler/src/ReactFiber";
import getEventTarget from "./getEventTarget";

/**
 * 注册事件
 */
SimpleEventPlugin.registerEvents();

const listeningMarker = "_reactListening" + Math.random().toString(36).slice(2);
/**
 * 监听所有支持的事件
 * @param rootContainerElement
 */
export const listenToAllSupportedEvents = (rootContainerElement: Container) => {
  if (rootContainerElement[listeningMarker] === true) {
    return;
  }
  rootContainerElement[listeningMarker] = true;
  // 遍历所有原生事件 进行监听
  allNativeEvents.forEach((domEventName) => {
    listenToNativeEvent(domEventName, true, rootContainerElement);
    listenToNativeEvent(domEventName, false, rootContainerElement);
  });
};

/**
 * 注册原生事件
 * @param domEventName 事件名
 * @param isCapturePhaseListener 是否是捕获阶段
 * @param target 目标容器
 */
export const listenToNativeEvent = (
  domEventName: string,
  isCapturePhaseListener: boolean,
  target: Container
) => {
  let eventSystemFlags = 0; // 0 指的是冒泡  4 指的是捕获
  if (isCapturePhaseListener) {
    eventSystemFlags |= IS_CAPTURE_PHASE;
  }
  addTrappedEventListener(
    target,
    domEventName,
    eventSystemFlags,
    isCapturePhaseListener
  );
};
/**
 * 添加事件监听
 * @param targetContainer
 * @param domEventName
 * @param eventSystemFlags
 * @param isCapturePhaseListener
 */
const addTrappedEventListener = (
  targetContainer: Container,
  domEventName: string,
  eventSystemFlags: number,
  isCapturePhaseListener: boolean
) => {
  // 创建事件监听函数 dispatch
  const listener = createEventListenerWrapperWithPriority(
    targetContainer,
    domEventName,
    eventSystemFlags
  );
  // 捕获 or 冒泡监听
  if (isCapturePhaseListener) {
    addEventCaptureListener(targetContainer, domEventName, listener);
  } else {
    addEventBubbleListener(targetContainer, domEventName, listener);
  }
};
/**
 * 派发事件
 * @param domEventName
 * @param eventSystemFlags
 * @param nativeEvent
 * @param targetInst
 * @param targetContainer
 */
export const dispatchEventForPluginEventSystem = (
  domEventName, // click
  eventSystemFlags, // 冒泡 捕获
  nativeEvent, // 原生事件
  targetInst, // 真实dom对应的fiber
  targetContainer // root
) => {
  dispatchEventForPlugins(
    domEventName,
    eventSystemFlags,
    nativeEvent,
    targetInst,
    targetContainer
  );
};

const dispatchEventForPlugins = (
  domEventName, // click
  eventSystemFlags, // 冒泡 捕获
  nativeEvent, // 原生事件
  targetInst: FiberNode, // 真实dom对应的fiber
  targetContainer // root
) => {
  // 事件源
  const nativeEventTarget = getEventTarget(nativeEvent);
  // 派发事件的数组
  const dispatchQueue = [];
  extractEvents(
    dispatchQueue,
    domEventName,
    targetInst,
    nativeEvent,
    nativeEventTarget,
    eventSystemFlags,
    targetContainer
  );
  console.log("dispatchQueue", dispatchQueue);
};

/**
 * 提取事件
 */
const extractEvents = (
  dispatchQueue,
  domEventName,
  targetInst,
  nativeEvent,
  nativeEventTarget,
  eventSystemFlags,
  targetContainer
) => {
  SimpleEventPlugin.extractEvents(
    dispatchQueue,
    domEventName,
    targetInst,
    nativeEvent,
    nativeEventTarget,
    eventSystemFlags,
    targetContainer
  );
};
