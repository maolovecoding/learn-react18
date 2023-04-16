import logger, { indent } from "shared/logger";
import { FiberNode } from "./ReactFiber";
import { HostComponent, HostRoot, HostText } from "./ReactWorkTags";
import { appendInitialChild, createInstance, createTextInstance, finalizeInitialChildren } from "react-dom-bindings/src/client/ReactDOMHostConfig";
/**
 * 完成一个fiber节点的构建工作
 * @param current 
 * @param completeWork 构建完成的fiber节点
 */
export const completeWork = (current: FiberNode, workInProgress: FiberNode) => {
  indent.number -= 2
  logger(' '.repeat(indent.number) + 'completeWork', workInProgress)
  const newProps = workInProgress.pendingProps
  switch (workInProgress.tag) {
    case HostRoot: // 根fiber有根节点 也就是dom了
      bubbleProperties(workInProgress)
      break
    case HostComponent:
      // TODO 目前只处理创建或者说挂载新节点的逻辑 后面会区分是初次挂载还是更新
      // 原生节点 span div
      // 创建真实dom节点 
      const { type } = workInProgress
      const instance = createInstance(type, newProps, workInProgress)
      // 把所有的儿子都添加到自己身上
      appendAllChildren(instance, workInProgress)
      workInProgress.stateNode = instance
      finalizeInitialChildren(instance, type, newProps) // 完成初始化的儿子
      bubbleProperties(workInProgress)
      break
    case HostText:
      // 如果完成的fiber是文本节点 那就创建真实的文本节点
      const newText = newProps
      workInProgress.stateNode = createTextInstance(newText)
      // 向上冒泡属性 副作用
      bubbleProperties(workInProgress)
      break
    default:
      break
  }
}
/**
 * 冒泡属性
 * @param completedWork 完成的工作 fiber
 */
const bubbleProperties = (completedWork: FiberNode) => {
  let { subtreeFlags, child } = completedWork
  // 遍历所有的子fiber 收集所有子fiber副作用和其后代的副作用
  while (child !== null) {
    subtreeFlags |= child.flags // 合并子节点的副作用
    subtreeFlags |= child.subtreeFlags // 合并后代子节点链的副作用
    child = child.sibling // 移动到兄弟节点 
  }
  completedWork.subtreeFlags = subtreeFlags
}

/**
 * 把当前完成的fiber的所有子fiber对应的真实dom都挂载到自己父fiber真实dom上
 * @param parent dom
 * @param workInProgress 完成的fiber 
 */
export const appendAllChildren = (parent: Node, workInProgress: FiberNode) => {
  let node = workInProgress.child
  while (node !== null) {
    if (node.tag === HostComponent || node.tag === HostText) {
      // 原生节点 或者文本节点
      appendInitialChild(parent, node.stateNode as Node)
    } else if (node.child !== null) { // 如果第一个儿子 child 不是原生节点 说明可能是函数组件 类组件
      // 函数组件 类组件
      node = node.child
      continue
    }
    if (node === workInProgress) {
      return
    }
    // 注意 函数组件是没有对应的dom的 真实dom在子fiber的stateNode上的
    while (node.sibling === null) {
      if (node.return === null || node.return === workInProgress) {
        // 回到构建的父fiber 挂载完毕
        return
      }
      // 子fiber没有兄弟了 回到父亲 然后找父亲的兄弟
      node = node.return
    }
    node = node.sibling
  }
}
