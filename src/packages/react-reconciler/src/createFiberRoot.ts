import { FiberNode, createHostRootFiber } from "./ReactFiber";
import { initialUpdateQueue } from  './ReactFiberClassUpdateQueue'
/**
 * 创建根节点 
 * @param containerInfo 
 * @returns 
 */
export const createFiberRoot = (containerInfo:HTMLElement)=>{
  const root = new FiberRootNode(containerInfo);// 创建应用程序的根
  // HostRoot 就是根节点 div#root 这里创建的才是根fiber
  // TODO 正常来说 先有虚拟DOM 然后创建对应fiber 然后是真实dom  但是根fiber没有虚拟DOM，因为根节点的真实dom是我们提供的
  const uninitializedFiber = createHostRootFiber() // 未初始化的fiber
  root.current = uninitializedFiber
  uninitializedFiber.stateNode = root; // 这里是fiber树对应的根节点（内部有真实dom）
  initialUpdateQueue(uninitializedFiber); // 初始化更新队列 创建fiber树
  return root
}
/**
 * 内部其实就是真实dom，只是稍微包装一下 还没有fiber的产生
 */
export class FiberRootNode{
  containerInfo: HTMLElement
  current: FiberNode // 指的是当前页面的fiber树的根节点
  constructor(containerInfo: HTMLElement){
    this.containerInfo = containerInfo
  }
}
