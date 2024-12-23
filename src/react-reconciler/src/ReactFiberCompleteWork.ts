import logger, { indent } from "shared/logger";
import { FiberNode } from "./ReactFiber";

/**
 * 执行此fiber的完成工作 如果是原生组件 则是创建真实DOM节点
 * @param current
 * @param returnFiber
 */
export const completeWork = (current: FiberNode, completedWork: FiberNode) => {
  indent.number -= 2;
  logger(" ".repeat(indent.number) + "completeWork", completedWork);
};
