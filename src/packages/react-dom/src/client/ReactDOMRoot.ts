import { updateContainer, createContainer } from 'react-reconciler/src/ReactFiberReconciler';
import { FiberRootNode } from 'react-reconciler/src/createFiberRoot';

class ReactDOMRoot {
  private _internalRoot: any
  constructor(interalRoot:any){
    this._internalRoot = interalRoot
  }
  /**
   * 虚拟dom渲染为真实DOM
   * @param children 虚拟DOM
   */
  render(children: FiberRootNode){
    const root = this._internalRoot
    // 更新容器
    updateContainer(children, root)
  }
}

/**
 * 创建应用程序的根
 */
export const createRoot = (container: HTMLElement) => {
  const root = createContainer(container)
  return new ReactDOMRoot(root)
}

