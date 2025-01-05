import ReactSharedInternals from "shared/ReactSharedInternals";
import { FiberNode } from "./ReactFiber";
import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop";
import { enqueueConcurrentHookUpdate } from "./ReactFiberConcurrentUpdates";

/**
 * 当前正在渲染中的 fiber
 */
let currentlyRendingFiber: FiberNode = null;

/**
 * 构建中的hook 正在使用的hook
 */
let workInProgressHook = null;

const { ReactCurrentDispatcher } = ReactSharedInternals;

/**
 * 挂载时候执行的 useReducer
 * @param reducer
 * @param initialArg
 */
const mountReducer = (reducer, initialArg) => {
  // 挂载构建中的hook
  const hook = mountWorkInProgressHook();
  hook.memoizedState = initialArg;
  const queue = {
    pending: null,
    dispatch: null,
  };
  hook.queue = queue;
  const dispatch = dispatchReducerAction.bind(
    null,
    currentlyRendingFiber,
    queue
  );
  queue.dispatch = dispatch;
  return [hook.memoizedState, dispatch];
};
/**
 * 执行派发动作的方法，更新状态，让ui更新
 * @param fiber 函数组件对应的fiber
 * @param queue 更新队列
 * @param action 动作参数
 */
const dispatchReducerAction = (fiber: FiberNode, queue, action) => {
  // 在每个hook里会存放一个更新队列 更新队列是一个更新对象的循环链表 update1.next => update2.next => update1
  const update = {
    action,
    next: null,
  };
  // 把当前最新的更新添加到更新队列中 返回当前的根fiber
  const root = enqueueConcurrentHookUpdate(fiber, queue, update);
  scheduleUpdateOnFiber(root);
};

const mountWorkInProgressHook = () => {
  const hook = {
    memoizedState: null, // hook中的状态
    queue: null, // 存放本hook的更新队列 queue.pending = update 循环链表
    next: null, // 指向下一个hook 一个函数可以有多个hook 多个hook组成单向链表
  };
  if (workInProgressHook === null) {
    // 第一个hook
    workInProgressHook = hook;
    // 当前函数组件对应的fiber对应的状态等于第一个hook
    currentlyRendingFiber.memoizedState = hook;
  } else {
    workInProgressHook.next = hook;
    workInProgressHook = hook;
  }
  return hook;
};

const HooksDispatcherOnMount = {
  useReducer: mountReducer,
};

/**
 * 函数式组件执行 渲染函数式组件
 * @param current 老fiber
 * @param workInProgress 新fiber
 * @param Component 函数式组件
 * @param props 组件接受的属性
 * @returns 返回子节点 虚拟dom
 */
export const renderWithHooks = (
  current: FiberNode,
  workInProgress: FiberNode,
  Component,
  props
) => {
  currentlyRendingFiber = workInProgress; // function component 对应的fiber
  // 在函数组件执行前  给 ReactCurrentDispatcher.current 赋值
  ReactCurrentDispatcher.current = HooksDispatcherOnMount;
  const children = Component(props); // 得到虚拟dom
  return children;
};
