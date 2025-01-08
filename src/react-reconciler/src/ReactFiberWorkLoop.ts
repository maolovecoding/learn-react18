import { scheduleCallback } from "scheduler/index";
import { FiberRootNode } from "./ReactFiberRoot";
import { createWorkInProgress, FiberNode } from "./ReactFiber";
import { beginWork } from "./ReactFiberBeginWork";
import { completeWork } from "./ReactFiberCompleteWork";
import {
  ChildDeletion,
  MutationMask,
  NoFlags,
  Placement,
  Update,
} from "./ReactFiberFlags";
import { commitMutationEffectsOnFiber } from "./ReactFiberCommitWork";
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
} from "./ReactWorkTags";
import { finishQueueingConcurrentUpdates } from "./ReactFiberConcurrentUpdates";

/**
 * 一个 fiber节点
 */
let workInProgress: FiberNode | null = null;

/**
 * 当前正在调度的根节点
 * 实现批量更新
 */
let workInProgressRoot: FiberRootNode = null;

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
  if (workInProgressRoot !== null) return;
  workInProgressRoot = root; // 实现批量更新
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
  // 提交阶段，执行副作用，修改真实DOM
  const finishedWork = root.current.alternate;
  root.finishedWork = finishedWork;
  commitRoot(root);
  workInProgressRoot = null;
}
/**
 * 提交 更新dom
 * @param root
 */
const commitRoot = (root: FiberRootNode) => {
  const { finishedWork } = root;
  printFinishedWork(finishedWork);
  // 子节点的副作用
  const subtreeHasEffects =
    (finishedWork.subtreeFlags & MutationMask) !== NoFlags;
  const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;
  // 看子树有没有副作用 根节点有没有副作用
  if (subtreeHasEffects || rootHasEffect) {
    commitMutationEffectsOnFiber(finishedWork, root);
  }
  // 更新当前的fiber树
  root.current = finishedWork;
};

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
  workInProgress = createWorkInProgress(root.current, null);
  // 完成队列的并发更新
  finishQueueingConcurrentUpdates();
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
    completeUnitOfWork(unitOfWork); // 自己的子节点构建完毕 则自己构建完毕
  } else {
    // 有子节点 让子节点成为下一个工作单元
    workInProgress = next;
  }
};

/**
 * 完成fiber构建
 * @param unitOfWork
 */
const completeUnitOfWork = (unitOfWork: FiberNode) => {
  let completedWork = unitOfWork;
  do {
    const current = completedWork.alternate; // 拿到替身fiber 老fiber
    const returnFiber = completedWork.return; // 返回的父fiber
    completeWork(current, completedWork); // 执行此fiber的完成工作 如果是原生组件 则是创建真实DOM节点
    // 处理自己的弟弟 兄弟节点
    const siblingFiber = completedWork.sibling;
    // 如果有弟弟 构建对应的fiber链表
    if (siblingFiber !== null) {
      workInProgress = siblingFiber;
      return;
    }
    // 没有弟弟 则是父fiber的最后一个子节点 父fiber的所有子fiber都构建完成
    completedWork = returnFiber; // 回到父 fiber
    workInProgress = completedWork;
  } while (completedWork !== null);
};

/**
 * 打印完成的工作fiber
 * @param fiber
 */
const printFinishedWork = (fiber: FiberNode) => {
  let child = fiber.child;
  const { flags, deletions } = fiber;
  if (flags === ChildDeletion) {
    fiber.flags &= ~ChildDeletion;
    console.log(
      "子节点有删除" +
        deletions
          .map((fiber) => `${fiber.type}#${fiber.memoizedProps.id}`)
          .join(",")
    );
  }
  while (child !== null) {
    printFinishedWork(child);
    child = child.sibling;
  }
  if (fiber.flags !== 0) {
    console.log(
      getFlags(fiber),
      getTag(fiber.tag),
      typeof fiber.type === "function" ? fiber.type.name : fiber.type,
      fiber.memoizedProps
    );
  }
};

const getFlags = (fiber: FiberNode) => {
  const { flags } = fiber;
  if (flags === Placement) {
    return "插入";
  }
  if (flags === Update) {
    return "更新";
  }
  return flags;
};

const getTag = (tag) => {
  switch (tag) {
    case FunctionComponent:
      return "FunctionComponent";
    case HostRoot:
      return "HostRoot";
    case HostComponent:
      return "HostComponent";
    case HostText:
      return "HostText";
    default:
      return tag;
  }
};
