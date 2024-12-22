import { scheduleCallback } from "scheduler/index";
import { FiberRootNode } from "./ReactFiberRoot";
import { createWorkInProgress, FiberNode } from "./ReactFiber";
import { beginWork } from "./ReactFiberBeginWork";

/**
 * 一个 fiber节点
 */
let workInProgress: FiberNode | null = null;

/**
 * 在fiber上调度更新
 * 源码中此处有一个任务功能
 * @param root
 */
export const scheduleUpdateOnFiber = (root: FiberRootNode) => {
  // 确保调度执行 root 上的更新
  ensureRootIsScheduled(root);
};

const ensureRootIsScheduled = (root: FiberRootNode) => {
  // 告诉浏览器 执行 root 上的 并发更新工作 performConcurrentWorkOnRoot
  scheduleCallback(performConcurrentWorkOnRoot.bind(null, root));
};

/**
 * 执行 root 上的 并发更新工作
 * 构建 fiber树  虚拟DOM => fiber树  创建真实DOM节点 还需要把真实DOM插入容器
 * @param root
 */
function performConcurrentWorkOnRoot(root: FiberRootNode) {
  // 同步渲染根节点 初次渲染的时候  都是同步
  renderRootSync(root);
}

const renderRootSync = (root: FiberRootNode) => {
  // 开始构建 fiber树
  // 基于老fiber节点构建新的
  prepareFreshStack(root);
  workLoopSync(); // 工作循环
};

/**
 * 准备更新栈
 * @param root
 */
const prepareFreshStack = (root: FiberRootNode) => {
  workInProgress = createWorkInProgress(root.current);
};
/**
 * 同步工作循环
 */
const workLoopSync = () => {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
};
/**
 * 执行工作循环
 */
const performUnitOfWork = (unitOfWork: FiberNode) => {
  // 获取 新 fiber 对于的老fiber (页面正在使用的fiber)
  const current = unitOfWork.alternate;
  // 完成当前 fiber 的子 fiber链表构建后
  const next = beginWork(current, unitOfWork);
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  if (next === null) {
    // 没有子节点 表示当前fiber已经构建完成
    // completeUnitOfWork(unitOfWork);
    workInProgress = null;
  } else {
    // 有子节点 让子节点成为下一个工作单元
    workInProgress = next;
  }
};
