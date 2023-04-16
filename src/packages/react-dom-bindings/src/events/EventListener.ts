/**
 * @Author: 毛毛 
 * @Date: 2023-04-16 10:34:16 
 * @Last Modified by: 毛毛
 * @Last Modified time: 2023-04-16 10:38:23
 * @description 事件监听
 */


const addEventCaptureListener = (target: Node, eventType: string, listener) => {
  target.addEventListener(eventType, listener, { capture: true })
  return listener
};
const addEventBubbleListener = (target: Node, eventType: string, listener) => {
  target.addEventListener(eventType, listener, { capture: false })
  return listener
};


export {
  addEventCaptureListener,
  addEventBubbleListener,
}