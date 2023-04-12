import { IVNode, IVNodeProps } from "react/src/jsx/ReactJSXElement";
import { IUpdateQueue } from "./ReactFiberClassUpdateQueue";
import { NoFlags } from "./ReactFiberTags";
import { HostComponent, HostRoot, HostText, IndeterminateComponent } from "./ReactWorkTags";
import { FiberRootNode } from "./createFiberRoot";

/**
 * 创建根fiber节点
 */
export const createHostRootFiber = () => {
  return createFiber(HostRoot, null, null)
}
export const createFiber = (tag:number, pendingProps, key) => {
  return new FiberNode(tag, pendingProps, key)
}
export class FiberNode{
  // 每个虚拟DOM => Fiber节点 => 真实dom原生
  /**
   *
   * 此fiber对应的真实dom节点
   * @type {(FiberRootNode | Node)}
   * @memberof FiberNode
   */
  stateNode: FiberRootNode | Node = null
  type: any = null // fiber类型 来自于虚拟DOM节点的type， span div

  // fiber树结构
  return : FiberNode = null // 父fiber节点
  child: FiberNode = null // 第一个子fiber
  sibling: FiberNode = null // 下一个兄弟fiber

  // fiber是通过虚拟DOM节点创建 虚拟DOM会提供pendingProps来创建fiber节点的属性
  memoizedProps:any = null // 已经生效的属性

  /**
   * 每个fiber都会有自己的状态 不同类型fiber状态存的类型也是不一样的
   * 类组件fiber 存的就是类实例
   * HostRoot根fiber 存的就是要渲染的元素
   * @memberof FiberNode
   */
  memoizedState: any = null 
/**
 * 每个fiber身上还可能有更新队列
 * TODO 是在initialUpdateQueue的时候赋值的
 * @memberof FiberNode
 */
updateQueue: IUpdateQueue = null;

/**
 * 副作用标识 标识此fiber节点需要进行何种操作
 * @memberof FiberNode
 */
flags: number = NoFlags
/**
 * 子节点的副作用标识 需要对子fiber进行什么操作
 * 为什么需要它 父节点需要记录子节点标识吗？ 为了性能优化
 * 简单来说，如果该属性没有值，也就标识子fiber都是没有副作用的，不需要递归遍历
 * @memberof FiberNode
 */
subtreeFlags: number = NoFlags
/**
 * DOM diff使用
 * 轮替 替身
 * 双缓冲池技术：是在内存或者显存中开辟一块与屏幕大小一样的存储区域，作为缓冲屏幕，将下一帧要显示的图像绘制到这个缓冲屏幕上面，在显示的时候
 * 将虚拟屏幕中的数据复制到可见视频缓冲区里面去
 */
alternate: FiberNode = null
/**
 * 索引 fiber自身在父fiber中排第几
 * TODO： 在哪里出现的？ 出现在 placeChild这个方法
 */
index: number = 0 // 索引

  /**
   * 
   * @param tag fiber的类型 函数组件 类组件 原生组件 根原生等
   * @param pendingProps 新属性 等待处理或者说生效的属性
   * @param key 唯一标识
   */
  constructor(public tag:number, public pendingProps, public key){}
}
/**
 * 基于老fiber和新的props构建新fiber
 * @param oldFiber 老的fiber 
 * @param pendingProps 等待更新的props
 */
export const createWorkInProgress = (current: FiberNode, pendingProps) => {
  let workInProgress = current.alternate // 第一次是null
  if (workInProgress === null) {
    workInProgress = createFiber(current.tag, pendingProps, current.key)
    workInProgress.type = current.type
    workInProgress.stateNode = current.stateNode
    workInProgress.alternate = current
    current.alternate = workInProgress
  } else {
    // 更新
    workInProgress.pendingProps = pendingProps
    workInProgress.type = current.type
    workInProgress.flags = NoFlags
    workInProgress.subtreeFlags = NoFlags
  }
  workInProgress.child = current.child
  workInProgress.memoizedProps = current.memoizedProps
  workInProgress.memoizedState = current.memoizedState
  workInProgress.updateQueue = current.updateQueue
  workInProgress.sibling = current.sibling
  workInProgress.index = current.index
  return workInProgress
}
/**
 * 根据虚拟DOM节点 创建fiber节点
 * @param element 
 */
export const createFiberFromElement = (element: IVNodeProps | IVNode) => {
  const { type, key, props } = element
  return createFiberFromTypeAndProps(type, key, props)
}
/**
 * 根据type和props创建fiber
 * @param type 
 * @param key 
 * @param props 
 */
const createFiberFromTypeAndProps = (type, key, props) => {
  let tag = IndeterminateComponent
  if (typeof type === 'string') {
    // 原生组件的fiber类型 div span
    tag = HostComponent
  }
  const fiber = createFiber(tag, props, key)
  fiber.type = type
  return fiber
}
/**
 * 根据文本创建fiber
 * @param content 
 */
export const createFiberFormText = (content: string) => {
  const fiber = createFiber(HostText, content, null)
  return fiber
}