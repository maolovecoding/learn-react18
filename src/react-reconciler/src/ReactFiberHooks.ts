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

/**
 * 老hook
 */
let currentHook = null;

const { ReactCurrentDispatcher } = ReactSharedInternals;

/**
 * useState 内置 使用 updateReducer 的 reducer
 * @param state
 * @param action
 */
const baseStateReducer = (state, action) =>
  typeof action === "function" ? action(state) : action;

/**
 * 更新阶段的useState
 * @param initialState
 */
const updateState = (initialState) => {
  return updateReducer(baseStateReducer, initialState);
};

/**
 * 更新的时候执行的hook
 * @param reducer
 * @param initialArg
 */
const updateReducer = (reducer, initialArg) => {
  // 获取新hook
  const hook = updateWorkInProgressHook();
  const queue = hook.queue; // 新hook的更新队列
  const current = currentHook; // 老hook
  const pendingQueue = queue.pending; // 将要生效的更新队列
  let newState = current.memoizedState; // 默认新状态就是老hook对应的状态
  if (pendingQueue !== null) {
    queue.pending = null;
    const firstUpdate = pendingQueue.next; // 第一个更新
    // pendingQueue.next = null; // 断开循环链表 收尾不相连
    let update = firstUpdate;
    do {
      const action = update.action; // 获取动作
      newState = reducer(newState, action); // 获取计算后的新状态
      update = update.next;
    } while (update !== null && update !== firstUpdate);
  }
  hook.memoizedState = newState;
  return [hook.memoizedState, queue.dispatch];
};
/**
 * 更新的时候 构建新的hooks
 */
const updateWorkInProgressHook = () => {
  // 获取将要构建新hook对应的老hook
  if (currentHook === null) {
    // 拿到老fiber
    const current = currentlyRendingFiber.alternate;
    currentHook = current.memoizedState; // 老hooks链表的第一个hook
  } else {
    currentHook = currentHook.next;
  }
  // 根据老hook 创建新hook
  const newHook = {
    memoizedState: currentHook.memoizedState,
    queue: currentHook.queue,
    next: null,
  };
  if (workInProgressHook === null) {
    workInProgressHook = newHook;
    currentlyRendingFiber.memoizedState = newHook;
  } else {
    workInProgressHook.next = newHook;
    workInProgressHook = newHook;
  }
  return workInProgressHook;
};

/**
 * 挂载的时候执行的 useState
 * 如果setState两次的值一样 后续是不需要进行更新的
 * @param initialState
 */
const mountState = (initialState) => {
  const hook = mountWorkInProgressHook();
  hook.memoizedState = initialState;
  const queue = {
    pending: null,
    dispatch: null,
    lastRenderedReducer: baseStateReducer, // 上一次的 reducer
    lastRenderedState: initialState, // 上一次的状态
  };
  hook.queue = queue;
  const dispatch = (queue.dispatch = dispatchSetState.bind(
    null,
    currentlyRendingFiber,
    queue
  ));
  return [hook.memoizedState, dispatch];
};
/**
 * setState更新逻辑
 * @param fiber
 * @param queue
 * @param action 新状态 or 设置状态函数  setNumber(1) => setNumber(num => num + 1)
 */
const dispatchSetState = (fiber: FiberNode, queue, action) => {
  const update = {
    action,
    hasEagerState: false, // 是否有急切的更新
    eagerState: null, // 急切的更新状态
    next: null,
  };
  const {
    lastRenderedReducer, // 上一次的 reducer
    lastRenderedState, // 上一次的状态
  } = queue;
  // 派发动作后 立刻用上一次的reducer和状态 加当前action 计算新状态
  const eagerState = lastRenderedReducer(lastRenderedState, action); // 计算新状态
  update.hasEagerState = true;
  update.eagerState = eagerState;
  if (Object.is(eagerState, lastRenderedState)) {
    // setState的值是老状态 不需要更新 就不进行调度了
    return
  }
  // 下面是真正的入队更新，并调度更新
  const root = enqueueConcurrentHookUpdate(fiber, queue, update);
  scheduleUpdateOnFiber(root);
};

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
  useState: mountState,
};

const HooksDispatcherOnUpdate = {
  useReducer: updateReducer,
  useState: updateState,
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
  // 有老fiber 且 对应的hook链表存在
  if (current !== null && current.memoizedState !== null) {
    // 更新
    ReactCurrentDispatcher.current = HooksDispatcherOnUpdate;
  } else {
    // 挂载
    // 在函数组件执行前  给 ReactCurrentDispatcher.current 赋值
    ReactCurrentDispatcher.current = HooksDispatcherOnMount;
  }
  const children = Component(props); // 得到虚拟dom
  // 重置相关公共变量
  currentlyRendingFiber = null;
  workInProgressHook = null;
  currentHook = null;
  return children;
};
