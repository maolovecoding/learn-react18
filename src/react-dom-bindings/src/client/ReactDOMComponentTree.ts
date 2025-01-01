import { Container } from "react-dom/client";
import { FiberNode } from "react-reconciler/src/ReactFiber";

const randomKey = Math.random().toString(36).slice(2);
const internalInstanceKey = "__reactFiber$" + randomKey;
const internalPropsKey = "__reactProps$" + randomKey;
/**
 * 从真实dom上获取它对应的fiber节点
 * @param targetNode 真实DOM
 */

export const getClosestInstanceFromNode = (targetNode: Container) => {
  const targetInst = targetNode[internalInstanceKey] || null; // 取出对应的fiber
  return targetInst as FiberNode;
};
/**
 * 缓存 fiber 节点 到 真实DOM上
 * @param hostInst fiber节点
 * @param node 真实dom
 */
export const preCacheFiberNode = (hostInst: FiberNode, node: Container) => {
  node[internalInstanceKey] = hostInst;
};

/**
 * 真实dom缓存props
 * @param node
 * @param props
 */
export const updateFiberProps = (node: Container, props) => {
  node[internalPropsKey] = props;
};
/**
 * 获取真实dom上缓存的的props
 * @param node 
 * @returns 
 */
export const getFiberCurrentPropsFromNode = (node: Container) => {
  return node[internalPropsKey] || null;
};
