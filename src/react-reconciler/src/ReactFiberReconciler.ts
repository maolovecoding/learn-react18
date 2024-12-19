import { Container } from "react-dom/client";
import { createFiberRoot, FiberRootNode } from "./ReactFiberRoot";
import { createUpdate, enqueueUpdate } from "./ReactFiberClassUpdate";

/**
 * 创建容器
 */
export const createContainer = (containerInfo: Container) => {
  return createFiberRoot(containerInfo);
};

/**
 * 更新容器
 * @param element 虚拟DOM
 * @param container 根fiber容器 含有真实DOM
 */
export const updateContainer = (element, container: FiberRootNode) => {
  // 拿到 当前的根fiber
  const current = container.current;
  // 创建更新
  const update = createUpdate();
  // 更新的虚拟DOM
  update.payload = {
    element,
  };
  // 把此更新对象添加到 current 这个根fiber的更新队列上
  enqueueUpdate(current, update);
};
