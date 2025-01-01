import { Container } from "react-dom/client";

/**
 * 捕获监听
 * @param targetContainer
 * @param domEventName
 * @param listener
 */
export const addEventCaptureListener = (
  target: Container,
  eventType: string,
  listener
) => {
  target.addEventListener(eventType, listener, true);
  return listener;
};
/**
 * 冒泡监听
 * @param targetContainer
 * @param domEventName
 * @param listener
 */
export const addEventBubbleListener = (
  target: Container,
  eventType: string,
  listener
) => {
  target.addEventListener(eventType, listener, false);
  return listener;
};
