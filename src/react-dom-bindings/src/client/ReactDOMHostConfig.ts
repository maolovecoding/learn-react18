import { FiberNode } from "react-reconciler/src/ReactFiber";
import { setInitialProperties } from "./ReactDOMComponent";
import { preCacheFiberNode, updateFiberProps } from "./ReactDOMComponentTree";

/**
 * 判断当前虚拟DOM是否是直接的单个子节点 文本节点
 * @param type
 * @param content
 * @returns
 */
export const shouldSetTextContent = (type, props) => {
  const children = props.children;
  return typeof children === "string" || typeof children === "number";
};

/**
 * 创建真实的文本节点
 * @param content
 */
export const createTextInstance = (content: string) => {
  return document.createTextNode(content);
};

/**
 * 创建一个原生节点
 * @param type 类型 div span
 * @param props 节点上的属性
 * @param internalInstanceHandle 原生节点对应的fiber
 */
export const createInstance = (
  type: string,
  props,
  internalInstanceHandle: FiberNode
) => {
  const domElement = document.createElement(type);
  preCacheFiberNode(internalInstanceHandle, domElement); // 在dom上缓存对应的fiber节点
  updateFiberProps(domElement, props); // 在dom上缓存props
  return domElement;
};

/**
 * 将子节点添加到父节点上
 */
export const appendInitialChild = (parent: HTMLElement, child: HTMLElement) => {
  parent.appendChild(child);
};

export const finalizeInitialChildren = (
  domElement: HTMLElement,
  type,
  props
) => {
  setInitialProperties(domElement, type, props);
};
/**
 * 父节点追加只节点
 * @param parentInstance
 * @param child
 */
export const appendChild = (parentInstance, child) => {
  parentInstance.appendChild(child);
};
/**
 * 再 beforeChild 子节点之前插入 child节点
 * @param parentInstance
 * @param child
 * @param beforeChild
 */
export const insertBefore = (parentInstance, child, beforeChild) => {
  parentInstance.insertBefore(child, beforeChild);
};
