import { MutationMask, NoFlags } from './ReactFiberTags';
/**
 * @Author: 毛毛 
 * @Date: 2023-04-10 22:56:50 
 * @Last Modified by: 毛毛
 * @Last Modified time: 2023-04-11 00:05:28
 * @description 工作循环
 */

import { scheduleCallback } from "scheduler/index";
import { FiberRootNode } from "./createFiberRoot";
import { FiberNode, createWorkInProgress } from "./ReactFiber";
import { beginWork } from "./ReactFiberBeginWork";
import { completeWork } from "./ReactFiberCompleteWork";
import { commitMutaionEffectsOnFiber } from './ReactFiberCommitWork';

/**
 * 正在进行中的工作
 */
let workInProgress: FiberNode = null; 
/**
 * 计划更新root
 * 源码中此处有一个调度任务的功能
 * @param root 
 */
export const scheduleUpdateOnFiber = (root: FiberRootNode) => { 
  // 确保调度指向root上的更新
  ensureRootIsScheduled(root)
}
/**
 * 确保调度指向root上的更新
 * @param root 
 */
const ensureRootIsScheduled = (root: FiberRootNode) => {
  // 告诉 浏览器 要执行 performConcurrentWorkOnRoot
  scheduleCallback(performConcurrentWorkOnRoot.bind(null, root))
}
/**
 * 执行root上的并发工作 工作循环 根据虚拟DOM => 构建fiber树结构 => 创建真实dom节点 => 插入容器
 */
function performConcurrentWorkOnRoot(root: FiberRootNode){
  // 同步渲染根节点 初次渲染的时候 都是同步
  renderRootSync(root)
  // 开始提交 commit 执行副作用 修改真实DOM
  const finishedWork = root.current.alternate; // 最新构建出的fiber树
  root.finishedWork = finishedWork
  commitRoot(root)
}
/**
 * 同步渲染
 * 两个fiber树 一个对应页面真实展示的dom元素，已经渲染完的fiber
 * 一个是正在构建的新的fiber树，或者说是复用fiber树 基于树构建的新的
 * @param root 
 */
const renderRootSync = (root: FiberRootNode) => {
  // 开始构建fiber树 第一次构建的时候 构建的fiber树是新树 后续渲染的时候 老的fiber是页面正在展示的 
  prepareFreshStack(root)
  workLoopSync(); // 工作循环
}
/**
 * 创建一个新鲜的栈
 * @param root 
 */
const prepareFreshStack = (root: FiberRootNode) => {
  // root.current 老的根fiber
  workInProgress = createWorkInProgress(root.current, null)
}
/**
 * 同步的工作循环
 */
const workLoopSync = () => {
  while (workInProgress !== null) {
    // 执行工作单元
    performUnitOfWork(workInProgress)
  }
}
/**
 * 执行工作单元
 * @param unitOfWork 新fiber 正构建的哪一个
 */
const performUnitOfWork = (unitOfWork: FiberNode) => {
  // 获取 新fiber 对应的老fiber（页面展示的那个fiber）
  const current = unitOfWork.alternate
  const next = beginWork(current, unitOfWork)
  unitOfWork.memoizedProps = unitOfWork.pendingProps // 等待生效的属性 变成已经生效的属性
  if (next === null) {
    // 已经完成当前节点 没有子fiber了
    completeUnitOfWork(unitOfWork)
  } else {
    workInProgress = next // 还有子fiber 兄弟fiber
  }
}

/**
 * 完成工作单元
 * @param unitOfWork 
 */
const completeUnitOfWork = (unitOfWork: FiberNode) => {
  let completedWork = unitOfWork
  do {
    const current = completedWork.alternate // 老fiber 页面展示的
    const returnFiber = completedWork.return
    // 执行此fiber的完成工作 如果是原生组件 就是创建对应的真实DOM
    completeWork(current, completedWork)
    const siblingFiber = completedWork.sibling
    if ( siblingFiber !== null) {
      workInProgress = siblingFiber // 工作单元转向下一个兄弟fiber 弟弟
      return
    }
    // 没有兄弟节点了 没有弟弟 是父节点的最后一个孩子节点 也就是父fiber所有子fiber都完成工作，父fiber也完成工作了
    workInProgress = completedWork = returnFiber
  } while(completedWork !== null)
};
/**
 * 提交
 * @param root 根fiber
 */
const commitRoot = (root: FiberRootNode) => {
  const { finishedWork } = root
  // 判断子树有无副作用
  const subtreeHasEffects = (finishedWork.subtreeFlags & MutationMask) !== NoFlags
  const rootHasEffect = (finishedWork.subtreeFlags & MutationMask) !== NoFlags
  if (subtreeHasEffects || rootHasEffect) {
    // 提交dom操作
    commitMutaionEffectsOnFiber(finishedWork, root)
  }
  root.current = finishedWork // dom渲染完成 root指向最新的fiber树
}