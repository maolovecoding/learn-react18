import { createContainer } from "react-reconciler/src/ReactFiberReconciler";

/**
 *
 * @param container 真实 dom 节点 根节点
 * @returns
 */
export const createRoot = (container: Element) => {
  const root = createContainer(container);
  return new ReactDOMRoot(root);
};

class ReactDOMRoot {
  constructor(private _internalRoot) {}
  render() {}
}
