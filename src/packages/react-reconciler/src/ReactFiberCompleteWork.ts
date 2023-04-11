import logger, { indent } from "shared/logger";
import { FiberNode } from "./ReactFiber";
/**
 * 执行完成工作单元
 * @param current 
 * @param completeWork 构建完成的fiber节点
 */
export const completeWork = (current: FiberNode, completeWork) => {
  indent.number -= 2
  logger(' '.repeat(indent.number) + 'completeWork', completeWork)
}