/**
 * 创建fiber root
 * @param containerInfo 容器信息
 */
export const createFiberRoot = (containerInfo) => {
  const root = new FiberRootNode(containerInfo);
  return root;
};

/**
 * 根 fiber root 本质就是持有真实的DOM节点  作为整个项目的根
 */

class FiberRootNode {
  constructor(public containerInfo) {}
}
