import { FiberNode } from "./ReactFiber";
import { IFunctionComponent } from "./ReactFiberBeginWork";

/**
 * 渲染函数式组件
 * @param current 
 * @param workInProgress 
 * @param Component 组件
 * @param props 属性
 * @returns react元素/虚拟DOM
 */
export const renderWithHooks = (current: FiberNode, workInProgress: FiberNode, Component: IFunctionComponent, props: any) => {
  const children = Component(props)
  return children
}