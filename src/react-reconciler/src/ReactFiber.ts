import { NoFlags } from "./ReactFiberFlags";
import { HostRoot } from "./ReactWorkTags";
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
  constructor(private tag: number, private pendingProps, private key) {
    // fiber 通过虚拟DOM节点创建 虚拟DOM提供了 pendingProps来创建fiber节点的属性
  }
  /**
   * 对应的真实DOM节点
   * @description 每个虚拟DOM => Fiber节点 => 真实DOM
   */
  public stateNode = null;
  /**
   * fiber类型 来源虚拟DOM节点的type eg: div span
   */
  public type = null;
  /**
   * 父节点
   */
  public return = null;
  /**
   * 第一个子节点
   */
  public child = null;
  /**
   * 指向下一个兄弟节点
   */
  public sibling = null;
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
  public alternate = null;
}

export const createFiber = (tag: number, pendingProps, key) => {
  return new FiberNode(tag, pendingProps, key);
};

export const createHostRootFiber = () => {
  return createFiber(HostRoot, null, null);
};

export interface IUpdateQueue {
  shared: {
    pending: null;
  };
}
