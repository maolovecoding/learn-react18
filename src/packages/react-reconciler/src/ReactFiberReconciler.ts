import { IVNode } from "react/src/jsx/ReactJSXElement";
import { FiberRootNode } from "./createFiberRoot";
import { createFiberRoot } from './createFiberRoot'
import { createUpdate, enqueueUpdate } from "./ReactFiberClassUpdateQueue";
/**
 * 创建 fiberRoot
 * @param containerInfo 
 */
export const createContainer = (containerInfo:HTMLElement)=>{
  return createFiberRoot(containerInfo)
}
/**
 * 更新容器 虚拟dom变成真实DOM插入到container内
 * @param element 虚拟dom  
 * @param container 容器的根 内部有真实DOM
 */
export const updateContainer = (element: IVNode, container: FiberRootNode)=>{
  // 获取当前的根fiber
  const { current } = container
  // 创建一个更新
  const update = createUpdate()
  // 要更新的虚拟dom
  update.payload = { element }
  // 入队 更新对象添加到current这个根fiber的更新队列上
  enqueueUpdate(current, update)
}