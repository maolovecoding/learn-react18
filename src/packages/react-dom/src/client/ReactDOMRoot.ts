import { listenToAllSupportedEvents } from 'react-dom-bindings/src/events/DOMPluginEventSystem';
import { updateContainer, createContainer } from 'react-reconciler/src/ReactFiberReconciler';
import { FiberRootNode } from 'react-reconciler/src/createFiberRoot';
import { IVNode } from 'react/src/jsx/ReactJSXElement';

class ReactDOMRoot {
  private _internalRoot: FiberRootNode
  constructor(interalRoot: FiberRootNode){
    this._internalRoot = interalRoot
  }
  /**
   * 虚拟dom渲染为真实DOM
   * @param children 虚拟DOM
   */
  render(children: IVNode){
    const root = this._internalRoot
    // TODO 目前没有更新逻辑 所以每次render先清空容器
    root.containerInfo.innerHTML = ''
    // 更新容器
    updateContainer(children, root)
  }
}

/**
 * 创建应用程序的根 绑定事件
 */
export const createRoot = (container: HTMLElement) => {
  const root = createContainer(container)
  // 绑定/监听事件
  listenToAllSupportedEvents(container)
  return new ReactDOMRoot(root)
}

