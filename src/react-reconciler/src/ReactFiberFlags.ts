/**
 * 无副作用标识
 */
export const NoFlags = 0b0;
/**
 * 增加(插入)操作
 */
export const Placement = 0b10;
/**
 * 更新操作
 */
export const Update = 0b100;
/**
 * 子节点删除操作
 */
export const ChildDeletion = 0b1000;
/**
 * 修改操作掩码
 */
export const MutationMask = Placement | Update;
