import { Container } from "react-dom/client";
import getEventTarget from "./getEventTarget";
import { getClosestInstanceFromNode } from "../client/ReactDOMComponentTree";
import { dispatchEventForPluginEventSystem } from "./DOMPluginEventSystem";

/**
 * 创建事件监听函数 不处理优先级
 * @param targetContainer
 * @param domEventName
 * @param eventSystemFlags
 */
export const createEventListenerWrapperWithPriority = (
  targetContainer: Container,
  domEventName: string,
  eventSystemFlags: number
) => {
  // 绑死前三个参数
  const listenerWrapper = dispatchDiscreteEvent.bind(
    null,
    domEventName,
    eventSystemFlags,
    targetContainer
  );
  return listenerWrapper;
};

/**
 * 派发离散的事件的监听函数(不会连续触发的事件，比如click) 连续触发的事件(滚动)
 * @param domEventName 事件名
 * @param eventSystemFlags 阶段 冒泡 捕获
 * @param container 容器 root
 * @param nativeEvent 原生事件
 */
const dispatchDiscreteEvent = (
  domEventName: string,
  eventSystemFlags: number,
  container: Container,
  nativeEvent
) => {
  dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
};

export const dispatchEvent = (
  domEventName: string,
  eventSystemFlags: number,
  container: Container,
  nativeEvent
) => {
  // 获取事件源 真实DOM
  const nativeEventTarget = getEventTarget(nativeEvent);
  const targetInst = getClosestInstanceFromNode(nativeEventTarget);
  dispatchEventForPluginEventSystem(
    domEventName, // click
    eventSystemFlags, // 冒泡 捕获
    nativeEvent, // 原生事件
    targetInst, // 真实dom对应的fiber
    container // root
  );
};
