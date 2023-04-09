
import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import { hasOwnProperty} from 'shared/hasOwnProperty'
/**
 * 
 * @param type react元素类型
 * @param config 配置对象
 */
export const jsxDEV = (type, config) => {
  let propName; // 属性名
  const props = {}; // 属性对象
  let key = null, // 每个虚拟dom都有一个可选的key属性，用来区分一个父节点下不同的子节点
  ref = null; // ref可以通过该属性获取真实DOM元素的引用，class组件实例等
  if(hasValidKey(config)) key = config.key
  if(hasValidKey(config)) ref = config.ref
  for(propName in config){
    // 确保属性是自身拥有，而不是原型继承
    // Object.prototype.hasOwnProperty.call(config, propName)
    if(hasOwnProperty(config, propName)
    &&
    !RESERVED_PROPS.hasOwnProperty(propName)
    ){
      props[propName]=config[propName]
    }
  }
  return ReactElement(type, key, ref, props)
}
/**
 * 创建react元素的工厂方法 也就是虚拟DOM工厂函数
 * @param type 
 * @param key 
 * @param ref 
 * @param props 
 */
const ReactElement = (type, key, ref, props)=>{
  return {
    $$typeof: REACT_ELEMENT_TYPE, // 也就是说这个虚拟DOM的类型就是react元素
    type, // 真实dom类型
    key,// 唯一标识
    ref,
    props // 属性 children style
  }
}
/**
 * 
 * @param config 配置对象 
 * @returns 是否有合法的key
 */
const hasValidKey = (config: any) => config.key !== undefined 
/**
 * 
 * @param config 配置对象 
 * @returns 是否有合法的ref
 */
const hasValidRef = (config: any) => config.ref !== undefined 

// 保留属性 这些属性不会放到react props中
const RESERVED_PROPS = {
  key:true,
  ref: true,
  __self: true,
  __source: true
}
