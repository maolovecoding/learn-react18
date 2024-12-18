import { createFiberRoot } from "./ReactFiberRoot";

/**
 * 创建容器
 */
export const createContainer = (containerInfo) => {
  return createFiberRoot(containerInfo);
};
