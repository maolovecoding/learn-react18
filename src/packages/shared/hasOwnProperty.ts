/**
 * 判断对象是否有该属性 
 * @param obj 
 * @param key 
 * @returns 
 */
export const hasOwnProperty = (obj, key):boolean => Object.prototype.hasOwnProperty.call(obj, key)