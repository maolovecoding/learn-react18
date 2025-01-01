import { listenToAllSupportedEvents } from "react-dom-bindings/src/events/DOMPluginEventSystem";
import {
  createContainer,
  updateContainer,
} from "react-reconciler/src/ReactFiberReconciler";
import { FiberRootNode } from "react-reconciler/src/ReactFiberRoot";

/**
 *
 * @param container 真实 dom 节点 根节点
 * @returns
 */
export const createRoot = (container: Container) => {
  const root = createContainer(container);
  // 事件代理到根容器
  listenToAllSupportedEvents(container); // 监听所有支持的事件
  return new ReactDOMRoot(root);
};

class ReactDOMRoot {
  constructor(private _internalRoot: FiberRootNode) {}
  /**
   * 将虚拟DOM渲染到容器中
   * @param children 虚拟DOM
   */
  render(children) {
    const root = this._internalRoot;
    updateContainer(children, root);
  }
}

export type Container = Element | DocumentFragment;
