/**
 * @Author: 毛毛 
 * @Date: 2023-04-16 10:53:04 
 * @Last Modified by: 毛毛
 * @Last Modified time: 2023-04-16 15:24:56
 * @description 从原生事件上拿到触发事件的目标对象
 */
export default function getEventTarget(nativeEvent: Event) {
  // 事件源 真实触发的dom
  const nativeEventTarget = nativeEvent.target || nativeEvent.srcElement || window
  return nativeEventTarget as Node
}