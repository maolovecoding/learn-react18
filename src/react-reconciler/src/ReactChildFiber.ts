import { ReactElementType } from "react/type";
import { createFiberFromElement, FiberNode } from "./ReactFiber";
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
  const placeSingleChild = (newFiber: FiberNode) => {
    if (shouldTrackSideEffects) {
      // 设置插入副作用 在 commit阶段 在容器上插入此节点
      // react渲染分为渲染(创建fiber树)和提交(更新真实DOM)两个阶段
      newFiber.flags |= Placement;
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
    newChild: ReactElementType
  ) => {
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
