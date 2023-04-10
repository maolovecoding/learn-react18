
/** 
 * 副作用标识
 * */ 

export const NoFlags = 0b0 // 无副作用

export const PerformedWork = 0b1
export const Placement = 0b10 // 插入
export const Update = 0b100// 更新

