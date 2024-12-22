import { FiberNode } from "./ReactFiber";
import { HostRoot } from "./ReactWorkTags";

/**
 * 本来此文件要处理更新优先级的问题
 * 但是目前只处理实现向上找到根节点
 * @param fiber
 */
export const markUpdateLaneFromFiberToRoot = (sourceFiber: FiberNode) => {
  let node = sourceFiber; // 当前 fiber
  let parent = sourceFiber.return; // 当前fiber的父fiber
  while (parent !== null) {
    node = parent;
    parent = parent.return;
  }
  // HostRootFiber
  if (node.tag === HostRoot) {
    return node.stateNode; // FiberRootNode
  }
  return null;
};
