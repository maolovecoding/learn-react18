
/** 
 * 副作用标识
 * */ 

export const NoFlags = 0b0 // 无副作用

export const PerformedWork = 0b1
export const Placement = 0b10 // 插入
export const Update = 0b100 // 更新

export const ChildDeletion = 0b1000; // 子节点删除

export const ContentReset = 0b10000; // 内容重置

export const Callback = 0b100000

export const MutationMask = Placement | Update // 插入或者更新

