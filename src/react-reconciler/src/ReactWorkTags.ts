/**
 * 函数式组件
 */
export const FunctionComponent = 0;
/**
 * 类组件
 */
export const ClassComponent = 1;

/**
 * 不确定的组件 => class component or function component
 */
export const IndeterminateComponent = 2;

/**
 * 根节点
 * 根 fiber的tag
 */
export const HostRoot = 3;

/**
 * 原生节点
 */
export const HostComponent = 5;
/**
 * 纯文本
 */
export const HostText = 6;
