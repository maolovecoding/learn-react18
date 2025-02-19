import { IHeapNode, peek, pop, push } from "./SchedulerMinHeap";
import {
  IdlePriority,
  ImmediatePriority,
  LowPriority,
  NormalPriority,
  UserBlockingPriority,
} from "./SchedulerPriorities";

export {
  IdlePriority,
  ImmediatePriority,
  LowPriority,
  NormalPriority,
  UserBlockingPriority,
} from "./SchedulerPriorities";

const maxSigned31BitInt = 1073741823;

// 立刻过期
const IMMEDIATE_PRIORITY_TIMEOUT = -1;
// 用户阻塞优先级过期时间
const USER_BLOCKING_PRIORITY_TIMEOUT = 250;
// 正常过期时间
const NORMAL_PRIORITY_TIMEOUT = 5000;
// 低优先级过期时间
const LOW_PRIORITY_TIMEOUT = 10000;
// 空闲优先级超时时间 永不过期
const IDLE_PRIORITY_TIMEOUT = maxSigned31BitInt;

/**
 * 任务id 自增
 */
let taskIdCounter = 1;
/**
 * 任务队列
 */
const taskQueue: IHeapNode[] = [];
/**
 * 调度函数
 */
let scheduleHostCallback: ((startTime: number) => boolean) | null = null;
/**
 * 开始执行工作的时间
 */
let startTime = 0;
/**
 * 当前要执行的任务
 */
let currentTask: IHeapNode | null = null;

/**
 * 每一帧的间隔时间
 * react每一帧申请五毫秒进行任务的执行，如果没有执行完任务 也会放弃控制器交还给浏览器
 */
const frameInternal = 5;

const channel = new MessageChannel();

const port1 = channel.port1;

const port2 = channel.port2;

port1.onmessage = () => performWorkUntilDeadline();

/**
 * 调度更新
 * 按照优先级执行任务
 * @param callback
 */
export const scheduleCallback = (
  priorityLevel: number,
  callback: () => void
) => {
  // 获取当前时间
  const currentTime = getCurrentTime();
  // 任务开始时间
  const startTime = currentTime;
  // 超时时间
  let timeout: number;
  switch (priorityLevel) {
    case ImmediatePriority:
      timeout = IMMEDIATE_PRIORITY_TIMEOUT;
      break;
    case UserBlockingPriority:
      timeout = USER_BLOCKING_PRIORITY_TIMEOUT;
      break;

    case LowPriority:
      timeout = LOW_PRIORITY_TIMEOUT;
      break;
    case IdlePriority:
      timeout = IDLE_PRIORITY_TIMEOUT;
      break;
    case NormalPriority:
    default:
      timeout = NORMAL_PRIORITY_TIMEOUT;
      break;
  }
  // 计算任务的过期时间
  const expirationTime = startTime + timeout;
  const newTask = {
    id: taskIdCounter++,
    callback, // 任务函数
    priorityLevel, // 优先级
    startTime, // 开始时间
    expirationTime, // 任务的过期时间
    sortIndex: expirationTime, // 排序依赖
  };
  push(taskQueue, newTask);
  // flushWork 刷新工作 执行任务
  requestHostCallback(flushWork);
  return newTask;
};

/**
 *
 * @returns 从页面启动到现在的时间
 */
const getCurrentTime = () => performance.now();
/**
 * 开始执行任务队列中的任务
 * @param startTime
 */
const flushWork = (startTime: number) => {
  return workLoop(startTime);
};

const workLoop = (startTime: number) => {
  let currentTime = startTime;
  // 优先级最高的任务
  currentTask = peek(taskQueue);
  while (currentTask !== null) {
    if (currentTask.expirationTime > currentTime && shouldYieldToHost()) {
      // 此任务的过期时间小于当前时间，也就是未过期 并且需要放弃执行
      // 跳出循环
      break;
    }
    // 取出当前任务中的回调函数 performConcurrentWorkOnRoot
    const callback = currentTask.callback;
    if (typeof callback === "function") {
      currentTask.callback = null;
      // 返回值是新函数 表示工作还没完成
      const continuationCallback = callback();
      if (typeof continuationCallback === "function") {
        currentTask.callback = continuationCallback;
        return true; // 还有任务要执行
      }
      // 此任务完成 不需要继续执行 弹出任务
      if (currentTask === peek(taskQueue)) {
        pop(taskQueue);
      }
    } else {
      pop(taskQueue);
    }
    // 当前任务结束 或者任务不合法 执行下一个任务
    currentTask = peek(taskQueue);
  }
  // 循环结束还有未完成的任务 表示 hasMoreWork = true
  if (currentTask !== null) {
    return true;
  } else {
    return false;
  }
};
/**
 * 请求调度
 * @param flushWork
 */
const requestHostCallback = (flushWork) => {
  // 缓存回调函数
  scheduleHostCallback = flushWork;
  // 执行工作直到截止时间
  schedulePerformWorkUntilDeadline();
};

const schedulePerformWorkUntilDeadline = () => {
  port2.postMessage(null);
};
/**
 * 执行工作直到截止时间
 */
const performWorkUntilDeadline = () => {
  if (scheduleHostCallback !== null) {
    // 先获取任务执行开始的时间
    startTime = getCurrentTime();
    // 是否还有更多工作要做
    let hasMoreWork = true;
    try {
      // 执行 flushWork 判断是否有返回值
      hasMoreWork = scheduleHostCallback(startTime);
    } finally {
      // 还有更多工作
      if (hasMoreWork) {
        schedulePerformWorkUntilDeadline();
      } else {
        scheduleHostCallback = null;
      }
    }
  }
};

/**
 * 是否需要放弃执行
 */
const shouldYieldToHost = () => {
  // 用当前时间减去开始的时候 ，就是耗时 过去的时间
  const timeElapsed = getCurrentTime() - startTime;
  // 经过的时间不足5ms 还可以执行任务
  if (timeElapsed < frameInternal) {
    return false;
  }
  // 表示五毫秒用完 需要放弃执行
  return true;
};

export { shouldYieldToHost as shouldYield };
