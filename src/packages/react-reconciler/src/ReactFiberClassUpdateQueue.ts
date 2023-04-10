import { IVNode } from 'react/src/jsx/ReactJSXElement';
import { FiberNode } from './ReactFiber';

/**
 * 初始化更新队列
 * @param fiberNode 
 */
export const initialUpdateQueue = (fiber: FiberNode) => {
  const queue: IUpdateQueue = {
    shared: {
      pending: null, // 双向循环链表 等待更新
    }
  }
  // 创建更新队列
  fiber.updateQueue = queue
}
/**
 * 
 * @returns 创建更新队列
 */
export const createUpdate = (): IUpdate => {
  const update: IUpdate = {}
  return update
}
/**
 * 更新对象入队
 * 双向循环队列
 * update1 => update2 => update3 => update1 循环了
 */
export const enqueueUpdate = (fiber: FiberNode, update:IUpdate) => {
  const { updateQueue } = fiber
  // pending 可以理解为一直指向最后一个更新对象update，也可以认为指向第一个
  const { pending } = updateQueue.shared
  if (pending === null) {
    // 初始化的队列 需要是循环队列 那么update自己指向自己
    update.nest = update
  } else {
    // 新入队的指向原来的更新队列的头update对象
    update.nest = pending.nest
    // pending是尾指针 更新尾指针指向新入队的update对象 尾指向头
    pending.nest = update
  }
  // 更新队列的pending属性就指向该当前入队的update对象 也就是变成“头”了
  updateQueue.shared.pending = update
}
export const processUpdateQueue = (fiber: FiberNode) =>{}


export interface IUpdateQueue{
  shared: IPending
}
interface IPending{
  pending: IUpdate // 循环链表
}
interface IUpdate{
  nest?: IUpdate
  payload?: IElement
}
interface IElement{
  element: IVNode
}
