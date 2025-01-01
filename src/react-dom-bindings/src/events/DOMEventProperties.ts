import { registerTwoPhaseEvent } from "./EventRegistry";
/**
 * 简单事件插件名
 */
const simpleEventPluginEvents = ["click"];

/**
 * 事件名映射  click => onClick
 */
export const topLevelEventsToReactNames = new Map<string, string>();
/**
 * 注册简单事件
 * @param event
 */
export const registerSimpleEvents = () => {
  for (let i = 0; i < simpleEventPluginEvents.length; i++) {
    const eventName = simpleEventPluginEvents[i];
    const domEventName = eventName.toLowerCase(); // 转小写
    const capitalizeEvent = eventName[0].toUpperCase() + eventName.slice(1); // 首字母大写
    registerSimpleEvent(domEventName, `on${capitalizeEvent}`);
  }
};
/**
 * 注册简单事件
 * @param domEventName dom事件名
 * @param reactName react事件名
 */
export const registerSimpleEvent = (
  domEventName: string,
  reactName: string
) => {
  topLevelEventsToReactNames.set(domEventName, reactName);
  registerTwoPhaseEvent(reactName, [domEventName]);
};
