import { ReactElementType } from "react/type";
import {
  createFiberFromElement,
  FiberNode,
  createFiberFromText,
} from "./ReactFiber";
import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import { Placement } from "./ReactFiberFlags";

/**
 *
 * @param shouldTrackSideEffects 是否跟踪副作用
 */
const createChildReconciler = (shouldTrackSideEffects: boolean) => {
  /**
   * 根据虚拟dom创建单元素的fiber
   * @param returnFiber 父fiber
   * @param currentFirstFiber 老fiber的第一个子fiber
   * @param element 虚拟DOM 单节点
   * @returns 返回创建的子fiber
   */
  const reconcileSingleElement = (
    returnFiber: FiberNode,
    currentFirstFiber: FiberNode,
    element: ReactElementType
  ) => {
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
   * 处理多个子节点的情况
   * @param returnFiber
   * @param currentFirstFiber
   * @param newChildren
   */
  const reconcileChildrenArray = (
    returnFiber: FiberNode,
    currentFirstFiber: FiberNode,
    newChildren: ReactElementType[]
  ) => {
    let resultingFiberChild: FiberNode = null; // 返回的第一个儿子
    let previousNewFiber: FiberNode = null; // 上一个fiber
    let newIndex = 0;
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
    if (shouldTrackSideEffects) {
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
    newFiber.index = newIndex;
    if (shouldTrackSideEffects) {
      newFiber.flags |= Placement; // 跟踪插入副作用 需要创建真实DOM并插入到父容器
      // 如果父fiber是初次挂载 shouldTrackSideEffects 是 false 不需要添加flags
      // 这种情况下会在完成阶段把所有子节点全部添加到自己身上
    }
    return newFiber;
  };
  /**
   * 比较子 fibers  dom-diff 老的子fiber和新的子虚拟DOM进行比较
   * @param returnFiber 新的父fiber
   * @param currentFirstFiber 老fiber的第一个子fiber
   * @param newChild 新的子虚拟DOM
   */
  const reconcileChildFibers = (
    returnFiber: FiberNode,
    currentFirstFiber: FiberNode,
    newChild: ReactElementType | ReactElementType[]
  ) => {
    // 处理是多个子节点的情况
    if (Array.isArray(newChild)) {
      return reconcileChildrenArray(returnFiber, currentFirstFiber, newChild);
    }
    // 现在考虑只有一个子节点的情况
    if (typeof newChild === "object" && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          const fiber = reconcileSingleElement(
            returnFiber,
            currentFirstFiber,
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
