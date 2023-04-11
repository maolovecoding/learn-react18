import { IVNode, IVNodeProps } from "react/src/jsx/ReactJSXElement";
import { FiberNode, createFiberFormText, createFiberFromElement } from "./ReactFiber";
import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import { Placement } from "./ReactFiberTags";
import isArray from "shared/isArray";

/**
 * 
 * @param shouldTrackSideEffect 是否更新副作用 新老需要比较
 */
const createChildReconciler = (shouldTrackSideEffect: boolean) => {
  const reconcileSignleElement = (returnFiber: FiberNode, currentFirstFiber: FiberNode, element: IVNode | string | IVNode[]) => {
    // 初次挂载 老节点 currentFirstFiber 肯定是没有的 所以可以直接根据虚拟DOM创建新的fiber节点
    const created = createFiberFromElement(element as IVNodeProps | IVNode)
    created.return = returnFiber
    return created
  }
  /**
   * 
   * @param newFiber 新的fiber
   * @param newIndex 索引 单个孩子肯定是0
   */
  const placeSignleChild = (newFiber: FiberNode, newIndex: number = 0) => {
    if (shouldTrackSideEffect) {
      // 添加副作用 插入 要在最后的提交节点插入此节点 React的渲染分成渲染(创建fiber树)和提交(更新真实dom)两个阶段
      newFiber.flags |= Placement
    }
    return newFiber
  }
  /**
   * 创建子fiber
   * @param returnFiber 父fiber
   * @param newChild 子虚拟DOM
   */
  const createChild = (returnFiber: FiberNode, newChild: IVNode | string) => {
    if ((typeof newChild === 'string' && newChild !== '') || typeof newChild === 'number') {
      // 子虚拟DOM可能是字符串 数字
      const created = createFiberFormText(`${newChild}`)
      created.return = returnFiber
      return created
    }
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: // react 元素
          const created = createFiberFromElement(newChild)
          created.return = returnFiber
          return created
        default:
          break
      }
    }
    return null
  }
  /**
   * 放置子fiber 子fiber在父fiber中排第几
   * @param newFiber 
   * @param newIdx 索引
   */
  const placeChild = (newFiber: FiberNode, newIdx: number) => {
    newFiber.index=  newIdx
    if (shouldTrackSideEffect) {
      newFiber.flags |= Placement // fiber需要创建真实dom且插入到父容器
      // 如果父fiber是初次挂载，不需要添加flags
      // 这种情况下会在完成节点 把所有的子节点全部添加到自己身上
    }
  }
  /**
   * 协调子数组虚拟DOM构建fiber
   * @param returnFiber 
   * @param currentFirstFiber 
   * @param newChildren 
   */
  const reconcileChildrenArray = (returnFiber: FiberNode, currentFirstFiber: FiberNode, newChildren: IVNode[]) => {
    // 返回的第一个新儿子
    let resultingFirstChild: FiberNode = null 
    let previousNewFiber: FiberNode = null // 上一个新fiber
    let newIndex = 0
    for (;newIndex < newChildren.length; newIndex++) {
      const newFiber = createChild(returnFiber, newChildren[newIndex])
      if (newFiber === null) continue
      placeChild(newFiber, newIndex)
      if (previousNewFiber === null) {
        resultingFirstChild = newFiber // 大儿子
      } else {
        previousNewFiber.sibling = newFiber // 兄弟节点串起来
      }
      previousNewFiber = newFiber
    }
    return resultingFirstChild
  }
  /**
   * 协调子fiber dom-diff 老的子fiber链表和新的虚拟DOM比较的过程
   * @param returnFiber 新的父fiber 
   * @param currentFirstFiber 老fiber的第一个儿子 child
   * @param newChild 新的子虚拟DOM
   */
  const reconcileChildFibers = (returnFiber: FiberNode, currentFirstFiber: FiberNode, newChild: IVNode | string | IVNode[]) => {;
    // 虚拟ODM是数组
    if(isArray<IVNode[]>(newChild)) {
      return reconcileChildrenArray(returnFiber, currentFirstFiber, newChild)
    }
    // TODO 暂时考虑的新节点只有一个的情况
    if (typeof newChild === 'object' && newChild !== null) { // 虚拟DOM
      switch ((newChild as IVNode).$$typeof) {
        case REACT_ELEMENT_TYPE:
          // 协调单元素 独生子 是虚拟DOM
          // placeSignleChild 放置单个儿子
          return placeSignleChild(reconcileSignleElement(returnFiber, currentFirstFiber, newChild))
        default:
          break
      }
    }
    return null
  }
  return reconcileChildFibers
}
/**
 * 没有老fiber 初次挂载 无需比较
 */
export const mountChildFibers = createChildReconciler(false)
/**
 * 更新
 */
export const reconcileChildFibers = createChildReconciler(true)