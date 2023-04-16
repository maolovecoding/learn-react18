/**
 * @Author: 毛毛 
 * @Date: 2023-04-16 16:10:23 
 * @Last Modified by: 毛毛
 * @Last Modified time: 2023-04-16 16:14:38
 * @description 获取绑定的事件监听函数
 */

import { FiberNode } from "react-reconciler/src/ReactFiber";
import { getFiberCurrentPropsFormNode } from "../client/ReactDOMComponentTree";
/**
 * 获取fiber上绑定的监听函数
 * @param instance 
 * @param registrationName 
 */
const getListener = (instance: FiberNode, registrationName: string): (event: Event) => void => {
  const stateNode = instance.stateNode as Node
  if (stateNode === null) return null
  const props = getFiberCurrentPropsFormNode(stateNode)
  if (props === null) return null
  const listener = props[registrationName]; // 对应的回调函数
  return listener
}
export default getListener
