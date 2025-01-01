import { FiberNode } from "./ReactFiber";

/**
 * 函数式组件执行 渲染函数式组件
 * @param current 老fiber
 * @param workInProgress 新fiber
 * @param Component 函数式组件
 * @param props 组件接受的属性
 * @returns 返回子节点 虚拟dom
 */
export const renderWithHooks = (
  current: FiberNode,
  workInProgress: FiberNode,
  Component,
  props
) => {
  const children = Component(props); // 得到虚拟dom
  return children;
};
