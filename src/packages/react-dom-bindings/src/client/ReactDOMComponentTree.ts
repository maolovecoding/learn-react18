import { FiberNode } from "react-reconciler/src/ReactFiber"

/**
 * @Author: 毛毛 
 * @Date: 2023-04-16 10:57:42 
 * @Last Modified by: 毛毛
 * @Last Modified time: 2023-04-16 15:39:21
 * @description 组件树
 */
const randomKey = Math.random().toString(36).slice(2)
const internalInstanceKey = '__reactFiber$' + randomKey
/**
 * 从这个dom节点找到最近的fiber节点
 */
export const getClosestInstanceFormNode = (targetNode: Node) => {
  // 拿到fiber节点
  const targetInst = targetNode[internalInstanceKey]
  return targetInst as FiberNode
};
/**
 * 在dom上缓存fiber节点
 * @param hostInst fiber
 * @param node 真实dom 
 */
export const precacheFiberNode = (hostInst: FiberNode, node: Node) => {
  node[internalInstanceKey] = hostInst
}

const internalPropsKey = '__reactProps$' + randomKey
/**
 * dom节点缓存fiber对应的props（pendingProps）
 * @param node 
 * @param props 
 */
export const updateFiberProps = (node: Node, props) => {
  node[internalPropsKey] = props
};
/**
 * 从dom上取缓存的props
 * @param node 
 * @returns 
 */
export const getFiberCurrentPropsFormNode = (node: Node) => {
  return node[internalPropsKey]
}