import { Container } from "react-dom/client";
import { createFiberRoot } from "./ReactFiberRoot";

/**
 * 创建容器
 */
export const createContainer = (containerInfo: Container) => {
  return createFiberRoot(containerInfo);
};
