/**
 * 工作标识 tag类型
 * 每个虚拟DOM都会对应自己的tag类型
 */
export const FunctionComponent = 0 // 函数组件
export const ClassComponent = 1 // 类组件

/**
 * 函数式组件和类组件都是函数 刚开始没办法区分 所以是未决定的类型
 */
export const IndeterminateComponent = 2

export const HostRoot = 3; // root of host tree

export const HostComponent = 5;//原生组件
export const HostText = 6