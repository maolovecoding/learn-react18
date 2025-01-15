import ReactSharedInternals from "shared/ReactSharedInternals";
import { FiberNode } from "./ReactFiber";
import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop";
import { enqueueConcurrentHookUpdate } from "./ReactFiberConcurrentUpdates";
import { Passive as PassiveEffect } from "./ReactFiberFlags";
import {
  HasEffect as HookHasEffect,
  Passive as HookPassive,
} from "./ReactHookEffectTags";
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

const updateEffect = (create, deps) => {
  return updateEffectImpl(PassiveEffect, HookPassive, create, deps);
};

/**
 * useEffect更新时执行
 * @param fiberFlags fiber副作用
 * @param hookFlags hook副作用标识
 * @param create 副作用函数
 * @param deps 依赖数组
 */
const updateEffectImpl = (fiberFlags, hookFlags, create, deps) => {
  const hook = updateWorkInProgressHook();
  const nextDeps = deps ?? null;
  let destroy; // 上一个useEffect的销毁函数
  if (currentHook !== null) {
    const prevEffect = currentHook.memoizedState; // 老hook指向老的 effect对象
    destroy = prevEffect.destroy;
    if (nextDeps !== null) {
      const prevDeps = prevEffect.deps;
      // 用新老依赖数组进行对比
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        // 依赖没有变 不需要执行 effect
        // 不管要不要执行，都需要把信新的effect组成完整的循环链表放到fiber.updateQueue中
        hook.memoizedState = pushEffect(hookFlags, create, destroy, deps);
        return;
      }
    }
  }
  // 需要执行的需要修改fiber的flags
  currentlyRendingFiber.flags |= fiberFlags;
  // hook的副作用需要执行 副作用标识不一样 HookHasEffect | hookFlags
  hook.memoizedState = pushEffect(
    HookHasEffect | hookFlags,
    create,
    destroy,
    deps
  );
};

const areHookInputsEqual = (nextDeps, prevDeps) => {
  if (prevDeps === null) {
    return false;
  }
  for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    if (Object.is(nextDeps[i], prevDeps[i])) continue;
    return false;
  }
  return true;
};

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
      // setState 的时候已经计算状态了 直接使用 不在计算本次的update
      if (update.hasEagerState) {
        newState = update.eagerState;
      } else {
        const action = update.action; // 获取动作
        newState = reducer(newState, action); // 获取计算后的新状态
      }
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
    return;
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

/**
 * 挂载effect
 * @param effect
 * @param deps
 */
const mountEffect = (effect: () => void | (() => void), deps) => {
  return mountEffectImpl(PassiveEffect, HookPassive, effect, deps);
};
/**
 *
 * @param fiberFlags fiber副作用
 * @param hookFlags hook副作用
 * @param effect
 * @param deps
 */
const mountEffectImpl = (fiberFlags, hookFlags, effect, deps) => {
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  currentlyRendingFiber.flags |= fiberFlags; // 给当前函数组件fiber添加flags
  hook.memoizedState = pushEffect(
    HookHasEffect | hookFlags,
    effect,
    undefined,
    nextDeps
  );
};
/**
 * 构建 effect链表
 * @param tag hook副作用 effect标签
 * @param create 创建方法
 * @param destroy 销毁方法
 * @param deps 依赖数组
 */
const pushEffect = (tag, create, destroy, deps) => {
  const effect = {
    tag,
    create,
    destroy,
    deps,
    next: null,
  };

  let componentUpdateQueue = currentlyRendingFiber.updateQueue;
  if (componentUpdateQueue === null) {
    componentUpdateQueue = createFunctionComponentUpdateQueue();
    currentlyRendingFiber.updateQueue = componentUpdateQueue;
    componentUpdateQueue.lastEffect = effect.next = effect;
  } else {
    const lastEffect = componentUpdateQueue.lastEffect;
    if (lastEffect === null) {
      componentUpdateQueue.lastEffect = effect.next = effect;
    } else {
      const firstEffect = lastEffect.next;
      lastEffect.next = effect;
      effect.next = firstEffect;
      componentUpdateQueue.lastEffect = effect;
    }
  }
  return effect;
};
/**
 * 函数组件的更新队列 里面存放的是副作用 effect循环单向链表
 * @returns
 */
const createFunctionComponentUpdateQueue = () => {
  return {
    lastEffect: null,
  };
};

const HooksDispatcherOnMount = {
  useReducer: mountReducer,
  useState: mountState,
  useEffect: mountEffect,
};

const HooksDispatcherOnUpdate = {
  useReducer: updateReducer,
  useState: updateState,
  useEffect: updateEffect,
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
  workInProgress.updateQueue = null; // 清空 函数组件的更新队列 里面存放的是effects 要构建新的，fiber可能被复用，需要清空
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
