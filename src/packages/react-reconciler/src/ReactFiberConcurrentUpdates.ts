/**
 * @Author: 毛毛 
 * @Date: 2023-04-10 20:51:21 
 * @Last Modified by: 毛毛
 * @Last Modified time: 2023-04-10 20:56:17
 * @description 并发更新
 */
import { FiberNode } from "./ReactFiber";
/**
 * 
 * @param fiber 从当前fiber回到根fiber
 */
export const markUpdateLaneFromFiberToRoot = (sourceFiber: FiberNode) => {
  let node = sourceFiber // 当前fiber
  let parent = sourceFiber.return // 父fiber
  while(parent !== null){
    node = parent
    parent = node.return
  }
  // parent === null 也就是stateNode指向hostFiber 根fiber了
  return node.stateNode
}