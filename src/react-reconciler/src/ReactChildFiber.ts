/* eslint-disable react-hooks/rules-of-hooks */
import { ReactElementType } from "react/type";
import {
  createFiberFromElement,
  FiberNode,
  createFiberFromText,
  createWorkInProgress,
} from "./ReactFiber";
import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import { ChildDeletion, Placement } from "./ReactFiberFlags";

/**
 *
 * @param shouldTrackSideEffects 是否跟踪副作用
 */
const createChildReconciler = (shouldTrackSideEffects: boolean) => {
  /**
   * 根据老fiber创建复用的fiber
   * @param fiber 老fiber
   * @param pendingProps 等待生效的props
   */
  const useFiber = (fiber: FiberNode, pendingProps) => {
    const clone = createWorkInProgress(fiber, pendingProps);
    clone.index = 0;
    clone.sibling = null;
    return clone;
  };
  /**
   * 删除父fiber的child子fiber
   * @param returnFiber
   * @param childToDelete
   */
  const deleteChild = (returnFiber: FiberNode, childToDelete: FiberNode) => {
    if (!shouldTrackSideEffects) {
      return;
    }
    const deletions = returnFiber.deletions;
    if (deletions === null) {
      // 没有要删除的子fiber
      returnFiber.deletions = [childToDelete];
      returnFiber.flags |= ChildDeletion; // 删除的副作用
    } else {
      deletions.push(childToDelete);
    }
  };
  /**
   * 删除父fiber的 currentFirstChild 以及后面的所有的兄弟fiber
   * @param returnFiber
   * @param currentFirstChild
   */
  const deleteRemainingChild = (
    returnFiber: FiberNode,
    currentFirstChild: FiberNode
  ) => {
    if (!shouldTrackSideEffects) return;
    let childToDelete = currentFirstChild;
    while (childToDelete !== null) {
      deleteChild(returnFiber, childToDelete);
      childToDelete = childToDelete.sibling;
    }
    return null;
  };
  /**
   * 根据虚拟dom创建单元素的fiber
   * @param returnFiber 父fiber
   * @param currentFirstChild 老fiber的第一个子fiber
   * @param element 虚拟DOM 单节点
   * @returns 返回创建的子fiber
   */
  const reconcileSingleElement = (
    returnFiber: FiberNode,
    currentFirstChild: FiberNode,
    element: ReactElementType
  ) => {
    const key = element.key; // 新虚拟dom的唯一标识
    let child = currentFirstChild; // 老 fc 对应的fiber
    while (child !== null) {
      // 判断此老fiber对应的key和新的虚拟dom对象对应的key是否相同
      if (child.key === key) {
        // 看类型 type 是否一样
        // 老fiber对应的类型和新虚拟dom的类型是否相同
        if (child.type === element.type) {
          // 单节点的更新 所以删除多余的其他老fiber
          deleteRemainingChild(returnFiber, child.sibling);
          // key和类型都一样，此节点可以复用
          const existing = useFiber(child, element.props);
          existing.return = returnFiber;
          return existing;
        } else {
          // key相同类型不同 div -> span
          // 不能复用fiber 把剩下的老fiber都删掉 包含当前child fiber
          deleteRemainingChild(returnFiber, child);
        }
      } else {
        deleteChild(returnFiber, child);
      }
      child = child.sibling;
    }
    // 根据虚拟DOM 创建对应的fiber节点
    const created = createFiberFromElement(element);
    created.return = returnFiber; // 子fiber指向父fiber
    return created;
  };
  /**
   * 创建一个子节点 根据虚拟DOM创建fiber
   * @param returnFiber
   * @param newChild
   */
  const createChild = (returnFiber: FiberNode, newChild: ReactElementType) => {
    if (
      (typeof newChild === "string" && newChild !== "") ||
      typeof newChild === "number"
    ) {
      // 是文本字符串 或者文本数字 创建对应fiber
      const created = createFiberFromText(`${newChild}`);
      created.return = returnFiber;
      return created;
    }
    if (newChild !== null && typeof newChild === "object") {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          // 根据虚拟DOM 创建对应的fiber节点
          const created = createFiberFromElement(newChild);
          created.return = returnFiber; // 子fiber指向父fiber
          return created;
        }
        default:
          break;
      }
    }
    return null;
  };
  /**
   * 更新元素 新的虚拟dom更新老fiber
   * @param returnFiber
   * @param current
   * @param element
   */
  const updateElement = (
    returnFiber: FiberNode,
    current: FiberNode,
    element: ReactElementType // 虚拟dom
  ) => {
    // 元素类型 前面调用此方法的时候判断过key了
    const elementType = element.type;
    if (current !== null) {
      if (current.type === elementType) {
        // 类型 和 key 都一样 复用老fiber
        const existing = useFiber(current, element.props);
        existing.return = returnFiber;
        return existing;
      }
    }
    // key 一样 类型不一样 根据虚拟dom创建新fiber替换
    const created = createFiberFromElement(element);
    created.return = returnFiber;
    return created;
  };
  /**
   *
   * @param returnFiber 父fiber
   * @param oldFiber 老fiber
   * @param newChild 虚拟dom
   */
  const updateSlot = (
    returnFiber: FiberNode,
    oldFiber: FiberNode,
    newChild: ReactElementType // 虚拟dom
  ) => {
    const key = oldFiber?.key || null;
    if (newChild !== null && typeof newChild === "object") {
      // 有新的虚拟dom
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          if (newChild.key === key) {
            // key 认为是相同的节点
            return updateElement(returnFiber, oldFiber, newChild);
          }
          break;
        default:
          return null;
      }
    }
    return null;
  };
  /**
   * 处理多个子节点的情况
   * @param returnFiber
   * @param currentFirstChild
   * @param newChildren
   */
  const reconcileChildrenArray = (
    returnFiber: FiberNode,
    currentFirstChild: FiberNode,
    newChildren: ReactElementType[]
  ) => {
    let resultingFiberChild: FiberNode = null; // 返回的第一个儿子
    let previousNewFiber: FiberNode = null; // 上一个fiber
    let newIndex = 0; // 遍历新虚拟dom的索引
    let oldFiber = currentFirstChild; // 第一个老fiber
    let nextOldFiber = null; // 下一个老fiber
    // 第一轮循环
    for (; oldFiber !== null && newIndex < newChildren.length; newIndex++) {
      nextOldFiber = oldFiber.sibling;
      const newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIndex]);
      if (newFiber === null) {
        break;
      }
      if (shouldTrackSideEffects) {
        if (oldFiber !== null && newFiber.alternate === null) {
          // 有老fiber 但是不能复用，创建新fiber了。 type类型不一样
          deleteChild(returnFiber, oldFiber); // 删除老fiber
        }
      }
      placeChild(newFiber, newIndex);
      if (previousNewFiber === null) {
        resultingFiberChild = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
      oldFiber = nextOldFiber;
    }
    // 没有老fiber要处理了， 但是还有新的虚拟DOM 处理插入节点的逻辑
    for (; newIndex < newChildren.length; newIndex++) {
      const newFiber = createChild(returnFiber, newChildren[newIndex]);
      if (newFiber === null) continue;
      placeChild(newFiber, newIndex);
      if (previousNewFiber === null) {
        resultingFiberChild = newFiber; // 第一个创建的子fiber
      } else {
        // 不是大孩子 孩子节点串起来
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
    }
    return resultingFiberChild;
  };
  /**
   * 插入子fiber 单元素 没有子孩子了
   * @param newFiber
   * @returns
   */
  const placeSingleChild = (newFiber: FiberNode) => {
    // 需要跟踪副作用且页面没有老fiber 其实就是没有这个dom
    if (shouldTrackSideEffects && newFiber.alternate === null) {
      // 设置插入副作用 在 commit阶段 在容器上插入此节点
      // react渲染分为渲染(创建fiber树)和提交(更新真实DOM)两个阶段
      newFiber.flags |= Placement;
    }
    return newFiber;
  };
  /**
   * 多个子fiber插入
   * @param newFiber
   * @param newIndex
   */
  const placeChild = (newFiber: FiberNode, newIndex: number) => {
    newFiber.index = newIndex; // 在新fiber上的挂载索引
    if (!shouldTrackSideEffects) return;
    const current = newFiber.alternate;
    if (current !== null) return; // 没有老fiber 说明是新fiber节点 需要插入真实DOM
    newFiber.flags |= Placement; // 跟踪插入副作用 需要创建真实DOM并插入到父容器
    // 如果父fiber是初次挂载 shouldTrackSideEffects 是 false 不需要添加flags
    // 这种情况下会在完成阶段把所有子节点全部添加到自己身上
  };
  /**
   * 比较子 fibers  dom-diff 老的子fiber和新的子虚拟DOM进行比较
   * @param returnFiber 新的父fiber
   * @param currentFirstChild 老fiber的第一个子fiber
   * @param newChild 新的子虚拟DOM
   */
  const reconcileChildFibers = (
    returnFiber: FiberNode,
    currentFirstChild: FiberNode,
    newChild: ReactElementType | ReactElementType[]
  ) => {
    // 处理是多个子节点的情况
    if (Array.isArray(newChild)) {
      return reconcileChildrenArray(returnFiber, currentFirstChild, newChild);
    }
    // 现在考虑只有一个子节点的情况
    if (typeof newChild === "object" && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          const fiber = reconcileSingleElement(
            returnFiber,
            currentFirstChild,
            newChild
          ); // 协调单个子元素
          // 插入子子节点
          return placeSingleChild(fiber);
        }
        default:
          break;
      }
    }
    return null;
  };
  return reconcileChildFibers;
};
/**
 * 无老fiber 不需要跟踪副作用 初次挂载
 */
export const mountChildFibers = createChildReconciler(false);
/**
 * 有老fiber 此时更新使用此方法更新副作用
 */
export const reconcileChildFibers = createChildReconciler(true);
