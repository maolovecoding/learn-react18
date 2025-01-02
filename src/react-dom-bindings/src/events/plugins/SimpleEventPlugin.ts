import { FiberNode } from "react-reconciler/src/ReactFiber";
import {
  registerSimpleEvents,
  topLevelEventsToReactNames,
} from "../DOMEventProperties";
import { IS_CAPTURE_PHASE } from "../EventSystemFlags";
import { HostComponent } from "react-reconciler/src/ReactWorkTags";
import getListener from "../getListener";
import { SyntheticMouseEvent } from "../SyntheticEvent";

export { registerSimpleEvents as registerEvents };

/**
 * 提取事件
 * 把要执行的回调函数放到 dispatchQueue 中
 * @param dispatchQueue 派发队列 里面防止我们的监听函数
 * @param domEventName dom事件名
 * @param targetInst 目标fiber
 * @param nativeEvent 原生事件
 * @param nativeEventTarget 原生事件源
 * @param eventSystemFlags 事件系统标志 冒泡 捕获
 * @param targetContainer 目标容器
 */
export const extractEvents = (
  dispatchQueue,
  domEventName,
  targetInst,
  nativeEvent,
  nativeEventTarget,
  eventSystemFlags,
  targetContainer
) => {
  const isCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0; // 是否捕获阶段
  const reactName = topLevelEventsToReactNames.get(domEventName); // react事件名
  let SyntheticEventCtor; // 合成事件构造函数
  switch (domEventName) {
    case "click":
      SyntheticEventCtor = SyntheticMouseEvent; // 合成鼠标事件
      break;
    default:
      break;
  }
  const listeners = accumulateSinglePhaseListeners(
    targetInst,
    reactName,
    nativeEvent.type,
    isCapturePhase
  );
  // 有要执行的监听函数
  if (listeners.length) {
    // 创建合成事件
    const event = new SyntheticEventCtor(
      reactName,
      domEventName,
      null,
      nativeEvent,
      nativeEventTarget
    );
    dispatchQueue.push({
      event, // 合成事件实例
      listeners, // 监听函数
    });
  }
};

/**
 * 累加单阶段监听
 * @param targetInst
 * @param reactName
 * @param nativeEventType
 * @param isCapturePhase
 */
const accumulateSinglePhaseListeners = (
  targetFiber: FiberNode,
  reactName,
  nativeEventType,
  isCapturePhase
) => {
  const captureName = reactName + "Capture";
  const reactEventName = isCapturePhase ? captureName : reactName;
  const listeners = [];
  let instance = targetFiber;
  while (instance !== null) {
    const { tag, stateNode } = instance;
    if (tag === HostComponent && stateNode !== null) {
      if (reactEventName !== null) {
        const listener = getListener(instance, reactEventName);
        if (listener !== null) {
          listeners.push(createDispatchListener(instance, listener, stateNode));
        }
      }
    }
    instance = instance.return; // 从内向外
  }
  return listeners;
};
/**
 * 创建派发的事件监听执行的回调函数
 * @param instance fiber实例
 * @param listener 回调函数
 * @param currentTarget 当前的事件源
 */
const createDispatchListener = (instance, listener, currentTarget) => {
  return {
    instance,
    listener,
    currentTarget,
  };
};
