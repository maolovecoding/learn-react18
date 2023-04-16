/**
 * @Author: 毛毛 
 * @Date: 2023-04-11 22:23:44 
 * @Last Modified by: 毛毛
 * @Last Modified time: 2023-04-16 15:38:27
 * @description dom操作
 */

import { FiberNode } from "react-reconciler/src/ReactFiber";
import { setInitialProperties } from "./ReactDOMComponent";
import { precacheFiberNode, updateFiberProps } from "./ReactDOMComponentTree";


/**
 * 是否直接设置文本内容 只有一个孩子 也就是 children = 'xx'
 * @param type 
 * @param props 
 */
export const shouldSetTextContent = (type, props) => {
  return typeof props.children === 'string' || typeof props.children === 'number'
}
/**
 * 创建真实文本节点
 * @param content 
 */
export const createTextInstance = (content: string) => {
  return document.createTextNode(content)
}
/**
 * 创建真实DOM
 * @param type 
 * @param props 
 * @param internalInstanceHandle 真实dom对应的fiber
 * @returns 
 */
export const createInstance = (type: string, props, internalInstanceHandle: FiberNode) => {
  const domElement = document.createElement(type)
  precacheFiberNode(internalInstanceHandle, domElement); // 设置原生dom和fiber的关联 方便查找
  updateFiberProps(domElement, props) // dom节点记录props
  return domElement
}

/**
 * 子dom添加到父dom上
 * @param parent 
 * @param child 
 */
export const appendInitialChild = (parent: Node, child: Node) => {
  parent.appendChild(child)
};
/**
 * 
 * @param domElement 
 * @param type span div
 */
export const finalizeInitialChildren = (domElement: Node, type, props) => {
  setInitialProperties(domElement, type, props)
}
/**
 * 插入子dom 
 * @param parentInstance 
 * @param child 
 */
export const appendChild = (parentInstance: Node, child: Node) => {
  parentInstance.appendChild(child)
}
/**
 * 在指定的beforeChild前面插入子dom
 * @param parentInstance 
 * @param child 
 * @param beforeChild 
 */
export const insertBefore = (parentInstance: Node, child: Node, beforeChild: Node) => {
  parentInstance.insertBefore(child, beforeChild)
}