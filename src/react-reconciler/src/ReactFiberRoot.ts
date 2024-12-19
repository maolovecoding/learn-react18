import { createHostRootFiber } from "./ReactFiber";
import { initialUpdateQueue } from "./ReactFiberClassUpdate";
/**
 * 创建fiber root
 * @param containerInfo 容器信息
 */
export const createFiberRoot = (containerInfo) => {
  const root = new FiberRootNode(containerInfo);
  // HostRoot 指的就是根节点 比如 div#root
  // uninitializedFiber => 未初始化的 fiber
  // 根 fiber 是非常特殊的 不需要虚拟dom 传入的容器已经是真实dom了 但是也有fiber节点
  const uninitializedFiber = createHostRootFiber(); // 创建 root fiber
  root.current = uninitializedFiber;
  uninitializedFiber.stateNode = root; // stateNode 对应的根节点 也就是容器
  initialUpdateQueue(uninitializedFiber); // 初始化更新队列
  return root;
};

/**
 * 根 fiber root 本质就是持有真实的DOM节点  作为整个项目的根
 */

class FiberRootNode {
  /**
   * 当前的 fiber树
   */
  public current;
  constructor(public containerInfo) {}
}
