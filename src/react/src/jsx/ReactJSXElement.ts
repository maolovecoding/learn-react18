import { hasOwnProperty } from "shared/hasOwnProperty";
import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";

/**
 * 保留的属性 不会放到props内
 */
const RESOLVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true,
};

/**
 *
 * @param type 标签类型 div span
 * @param config 配置 { children: [], style: {} }
 * @returns
 */
export const jsxDEV = (type: string, config, maybeKey) => {
  let propName: string; // 属性名
  const props = {}; // 属性对象
  let key = null; // 每个虚拟DOM可以有一个可选的key属性 用来区分一个父节点下的不同子节点
  let ref = null; // 通过ref可以获取真实DOM的诉求
  if (typeof maybeKey !== 'undefined') {
    key = maybeKey
  }
  if (hasValidRef(config)) {
    ref = config.key;
  }
  for (propName in config) {
    if (
      hasOwnProperty.call(config, propName) &&
      !Object.hasOwn(RESOLVED_PROPS, propName)
    ) {
      props[propName] = config[propName];
    }
  }
  return ReactElement(type, key, ref, props);
};

const hasValidKey = (config) => {
  return config.key !== undefined;
};

const hasValidRef = (config) => {
  return config.ref !== undefined;
};

/**
 * 工厂方法 返回一个react元素 所谓的虚拟DOM
 * @param type
 * @param key 唯一标识
 * @param ref 用来获取真实DOM的ref
 * @param props 属性
 * @returns
 */
const ReactElement = (type, key, ref, props) => {
  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type,
    key,
    ref,
    props,
  };
};

export type ReactElementType = ReturnType<typeof ReactElement>;
