import logger, { indent } from "shared/logger";
import { FiberNode } from "./ReactFiber";
import { HostComponent, HostText } from "./ReactWorkTags";
import {
  createTextInstance,
  createInstance,
  appendInitialChild,
  finalizeInitialChildren,
} from "react-dom-bindings/src/client/ReactDOMHostConfig";
import { NoFlags } from "./ReactFiberFlags";

/**
 * 把当前完成的fiber所有的子节点对应的真实DOM都挂载到自己父parent真实DOM上
 * @param parent 当前完成fiber的真实DOM节点
 * @param completedWork 完成的fiber
 */
export const appendAllChildren = (
  parent: HTMLElement,
  completedWork: FiberNode
) => {
  let node = completedWork.child;
  while (node !== null) {
    if (node.tag === HostComponent || node.tag === HostText) {
      // 原生节点 or 文本节点
      appendInitialChild(parent, node.stateNode);
    } else if (node.child !== null) {
      // 如果第一个儿子(node)不是一个原生节点，说明可能是一个函数式组件节点
      // 这里说的儿子指的是 completedWork的子节点
      node = node.child; // 找到函数式组件的子节点(fiber)
      continue;
    }
    if (node === completedWork) return;
    // 没有兄弟节点
    while (node.sibling === null) {
      // 回到当前完成的fiber
      if (node.return === null || node.return === completedWork) return;
      node = node.return; // 回到父节点 找父节点的兄弟节点
    }
    node = node.sibling;
  }
};

/**
 * 执行此fiber的完成工作 如果是原生组件 则是创建真实DOM节点
 * 完成一个fiber节点
 * @param current
 * @param returnFiber
 */
export const completeWork = (current: FiberNode, completedWork: FiberNode) => {
  indent.number -= 2;
  logger(" ".repeat(indent.number) + "completeWork", completedWork);
  const newProps = completedWork.pendingProps;
  switch (completedWork.tag) {
    case HostComponent: {
      // TODO 现在只是处理创建或者说挂载新节点的逻辑 后面会区分是初次挂载还是更新
      // 原生节点 div span
      const { type } = completedWork;
      // 创建一个真实的dom实例
      const instance = createInstance(type, newProps, completedWork);
      completedWork.stateNode = instance;
      // 把自己所有的儿子都添加到自己身上
      appendAllChildren(instance, completedWork);
      // 完成初始化的儿子
      finalizeInitialChildren(instance, type, newProps);
      // 向上冒泡副作用到父fiber
      bubbleProperties(completedWork);
      break;
    }
    case HostText: {
      // 文本节点 属性就是文本
      const newText = newProps;
      completedWork.stateNode = createTextInstance(newText); // 创建真实的文本节点
      // 向上冒泡副作用到父fiber
      bubbleProperties(completedWork);
      break;
    }
  }
};
/**
 * 冒泡副作用
 * @param completedWork
 */
const bubbleProperties = (completedWork: FiberNode) => {
  let subTreeFlags = NoFlags;
  let child = completedWork.child;
  while (child !== null) {
    // 收集子fiber的所有副作用到自己身上
    subTreeFlags |= child.subtreeFlags;
    subTreeFlags |= child.flags;
    child = child.sibling;
  }
  // 将当前fiber下的所有fiber树上的副作用到自己身上
  completedWork.subtreeFlags = subTreeFlags;
};
