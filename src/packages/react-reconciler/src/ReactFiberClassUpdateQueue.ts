import { IVNode } from 'react/src/jsx/ReactJSXElement';
import { FiberNode } from './ReactFiber';
import { markUpdateLaneFromFiberToRoot } from './ReactFiberConcurrentUpdates';
import { assign } from 'shared/assign';
/**
 * 更新类型
 */
export const UpdateState = 0
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
  const update: IUpdate = { tag: UpdateState }
  return update
}
/**
 * 更新对象入队
 * 双向循环队列
 * update1 => update2 => update3 => update1 循环了
 * @returns 返回的是根fiber
 */
export const enqueueUpdate = (fiber: FiberNode, update:IUpdate) => {
  const { updateQueue } = fiber
  // pending 可以理解为一直指向最后一个更新对象update，也可以认为指向第一个
  const { shared: sharedQueue } = updateQueue
  const { pending } = sharedQueue
  if (pending === null) {
    // 初始化的队列 需要是循环队列 那么update自己指向自己
    update.next = update
  } else {
    // 新入队的指向原来的更新队列的头update对象
    update.next = pending.next
    // pending是尾指针 更新尾指针指向新入队的update对象 尾指向头
    pending.next = update
  }
  // 更新队列的pending属性就指向该当前入队的update对象 也就是变成“头”了
  updateQueue.shared.pending = update
  // 返回根节点 从当前的fiber一下到根节点
  // 标记更新的赛道 直接从当前fiber回到根节点
  // TODO 更新优先级 通过赛道来做的 32个赛道 0-31 越小优先级越高
  const root = markUpdateLaneFromFiberToRoot(fiber)
  return root
}
/**
 * 根据老状态和更新队列中的更新 计算最新的状态
 * @param fiber 
 */
export const processUpdateQueue = (workInProgress: FiberNode) => {
  const queue = workInProgress.updateQueue
  const pendingQueue = queue.shared.pending
  // 如果有更新 或者说更新队列有内容
  if (pendingQueue !== null) {
    // 清除等待生效的更新
    queue.shared.pending = null 
    // 获取更新队列中最后一个更新
    const lastPendingQueue = pendingQueue
    // 第一个更新
    const firstPendingUpdate = lastPendingQueue.next
    // 更新链表断开  变成单链表
    lastPendingQueue.next = null
    // 获取老状态
    let newState = workInProgress.memoizedState;
    let update = firstPendingUpdate
    while(update) {
      // 基于 老状态和 update更新 计算新状态
      newState = getStateFormUpdate(update, newState)
      update = update.next
    }
    // 更新计算后的新状态 作为生效state
    workInProgress.memoizedState = newState
  }
}
/**
 * 老状态和 update更新 计算新状态
 * tag => 0 => 1 => 2
 * @param update 更新对象其实也是有很多类型
 * @param prevState 
 */
const getStateFormUpdate = (update: IUpdate, prevState: any) => {
  switch (update.tag) {
    case UpdateState:
      const { payload } = update
      return assign({}, prevState, payload)
  }
}


export interface IUpdateQueue{
  shared: IPending
}
interface IPending{
  pending: IUpdate // 循环链表
}
interface IUpdate{
  next?: IUpdate
  payload?: IElement
  tag: number // 更新类型
}
interface IElement{
  element: IVNode
}
