import { NoFlags } from "./ReactFiberFlags";
import { FiberRootNode } from "./ReactFiberRoot";
import { HostRoot } from "./ReactWorkTags";
import * as ReactWorkTags from "./ReactWorkTags";

export type ReactWorkTagsType = (typeof ReactWorkTags)[keyof typeof ReactWorkTags]

/**
 * fiber 节点
 */

export class FiberNode {
  /**
   *
   * @param tag fiber的类型 函数组件 原生组件 类组件
   * @param pendingProps 新属性 等待处理 或者生效的属性
   * @param key 唯一标识 diff使用
   */
  constructor(
    public tag: ReactWorkTagsType,
    public pendingProps,
    public key
  ) {
    // fiber 通过虚拟DOM节点创建 虚拟DOM提供了 pendingProps来创建fiber节点的属性
  }
  /**
   * 对应的真实DOM节点
   * @description 每个虚拟DOM => Fiber节点 => 真实DOM
   */
  public stateNode: FiberRootNode | null = null;
  /**
   * fiber类型 来源虚拟DOM节点的type eg: div span
   */
  public type = null;
  /**
   * 父节点
   */
  public return: FiberNode | null = null;
  /**
   * 第一个子节点
   */
  public child: FiberNode | null = null;
  /**
   * 指向下一个兄弟节点
   */
  public sibling: FiberNode | null = null;
  /**
   * 已经生效的属性
   */
  public memoizedProps = null;
  /**
   * fiber对应的状态 每种 fiber状态存的类型是不一样的
   * 类组件对应的fiber 存的是类实例的状态 HostRoot存的就是要渲染的元素
   */
  public memoizedState = null;
  /**
   * 每个fiber可以带有更新队列
   */
  public updateQueue: IUpdateQueue | null = null;
  /**
   * 副作用标识 表示要针对此fiber进行何种操作
   */
  public flags = NoFlags;
  /**
   * 子节点对应的副作用标识
   * 方便性能优化
   */
  public subtreeFlags = NoFlags;
  /**
   * 替身 fiber双缓冲机制
   */
  public alternate: FiberNode | null = null;
  /**
   * 索引
   */
  public index: number | null = null;
}

export const createFiber = (tag: ReactWorkTagsType, pendingProps, key) => {
  return new FiberNode(tag, pendingProps, key);
};

export const createHostRootFiber = () => {
  return createFiber(HostRoot, null, null);
};

/**
 * 根据老fiber和新属性创建新fiber
 * @param fiber
 */
export const createWorkInProgress = (
  current: FiberNode,
  pendingProps = null
) => {
  let workInProgress = current.alternate; // fiber的替身
  if (workInProgress === null) {
    // 第一次 是 null
    workInProgress = createFiber(current.tag, pendingProps, current.key);
    // 对应的真实DOM
    workInProgress.stateNode = current.stateNode;
    // 双向指针
    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    // 已有老fiber 复用fiber
    workInProgress.pendingProps = pendingProps;
    workInProgress.type = current.type;
    workInProgress.flags = NoFlags;
    workInProgress.subtreeFlags = NoFlags;
  }
  // 更新其他属性
  workInProgress.child = current.child;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;
  workInProgress.sibling = current.sibling;
  workInProgress.index = current.index;
  return workInProgress;
};

export interface IUpdateQueue {
  shared: {
    pending: null | IUpdate;
  };
}

export interface IUpdate {
  payload: {
    element: null;
  };
  next: IUpdate | null;
}
