import { FiberNode } from "react-reconciler/src/ReactFiber";
import {
  registerSimpleEvents,
  topLevelEventsToReactNames,
} from "../DOMEventProperties";
import { IS_CAPTURE_PHASE } from "../EventSystemFlags";
import { HostComponent } from "react-reconciler/src/ReactWorkTags";
import getListener from "../getListener";

export { registerSimpleEvents as registerEvents };

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
  domEventName,
  targetInst,
  nativeEvent,
  nativeEventTarget,
  eventSystemFlags,
  targetContainer
) => {
  const isCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0; // 是否捕获阶段
  const reactName = topLevelEventsToReactNames.get(domEventName); // react事件名
  const listeners = accumulateSinglePhaseListeners(
    targetInst,
    reactName,
    nativeEvent.type,
    isCapturePhase
  );
  console.log("listeners", listeners);
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
          listeners.push(listener);
        }
      }
    }
    instance = instance.return; // 从内向外
  }
  return listeners;
};
