import { setValueForStyles } from "./CSSPropertyOperations";
import { setValueForProperty } from "./DOMPerpertyOperations";
import setTextContent from "./setTextContent";

const STYLE = "style";
const CHILDREN = "children";
/**
 * 设置初始化属性
 * @param domElement
 * @param tag span div
 * @param props
 */
export const setInitialProperties = (domElement, tag, props) => {
  setInitialDOMProperties(tag, domElement, props);
};
/**
 * 设置DOM的初始化属性
 * @param tag
 * @param domElement
 * @param props
 */
const setInitialDOMProperties = (tag, domElement, props) => {
  for (const propKey in props) {
    if (Object.hasOwn(props, propKey)) {
      const nextProp = props[propKey];
      if (propKey === STYLE) {
        setValueForStyles(domElement, nextProp);
      } else if (propKey === CHILDREN) {
        // 处理独生子 文本独生子节点
        if (typeof nextProp === "string") {
          setTextContent(domElement, nextProp);
        } else if (typeof nextProp === "number") {
          setTextContent(domElement, nextProp.toString());
        }
      } else if (nextProp !== null) {
        setValueForProperty(domElement, propKey, nextProp);
      }
    }
  }
};

/**
 *
 * @param domElement dom
 * @param tag span div
 * @param lastProps
 * @param nextProps
 */
export const diffProperties = (domElement, tag, lastProps, nextProps) => {
  let updatePayload = null;
  let propKey;
  let styleName;
  let styleUpdates = null;
  // 属性的删除 老对象有 新对象没有 需要删除
  for (propKey in lastProps) {
    if (
      Object.hasOwn(nextProps, propKey) ||
      !Object.hasOwn(lastProps, propKey) ||
      lastProps[propKey] === null
    ) {
      continue;
    }
    // 清除老样式
    if (propKey === STYLE) {
      const lastStyle = lastProps[propKey];
      for (styleName in lastStyle) {
        if (Object.hasOwn(lastStyle, styleName)) {
          if (!styleUpdates) {
            styleUpdates = {};
          }
          styleUpdates[styleName] = "";
        }
      }
    } else {
      (updatePayload = updatePayload || []).push(propKey, null);
    }
  }
  for (propKey in nextProps) {
    const nextProp = nextProps[propKey]; // 新属性值
    const lastProp = lastProps[propKey]; // 老属性值
    if (
      !Object.hasOwn(nextProps, propKey) ||
      nextProp === lastProp ||
      (nextProp === null && lastProp === null)
    ) {
      continue;
    }
    if (propKey === STYLE) {
      if (lastProp !== null) {
        // 遍历老样式对象 计算要删除的样式
        for (styleName in lastProp) {
          // 老样式存在 新样式没有 置空
          if (
            Object.hasOwn(lastProp, styleName) &&
            (nextProp === null || !Object.hasOwn(nextProp, styleName))
          ) {
            if (!styleUpdates) {
              styleUpdates = {};
            }
            styleUpdates[styleName] = "";
          }
        }

        for (styleName in nextProp) {
          if (
            Object.hasOwn(nextProp, styleName) &&
            lastProp[styleName] !== nextProp[styleName]
          ) {
            // 新老属性值不一致
            if (!styleUpdates) {
              styleUpdates = {};
            }
            styleUpdates[styleName] = nextProp[styleName];
          }
        }
      } else {
        styleUpdates = nextProp;
      }
    } else if (propKey === CHILDREN) {
      if (typeof nextProp === "string" || typeof nextProp === "number") {
        (updatePayload = updatePayload || []).push(propKey, nextProp);
      }
    } else {
      (updatePayload = updatePayload || []).push(propKey, nextProp);
    }
  }
  if (styleUpdates !== null) {
    (updatePayload = updatePayload || []).push(STYLE, styleUpdates);
  }
  return updatePayload;
};
/**
 * 更新dom相关属性
 * @param domElement
 * @param updatePayload
 * @param type
 * @param oldProps
 * @param newProps
 */
export const updateProperties = (
  domElement,
  updatePayload,
  type,
  oldProps,
  newProps
) => {
  updateDOMProperties(domElement, updatePayload);
};

const updateDOMProperties = (domElement, updatePayload) => {
  for (let i = 0; i < updatePayload.length; i += 2) {
    const propKey = updatePayload[i];
    const propValue = updatePayload[i + 1];
    if (propKey === STYLE) {
      setValueForStyles(domElement, propValue);
    } else if (propKey === CHILDREN) {
      // 更新文本
      setTextContent(domElement, propValue);
    } else {
      setValueForProperty(domElement, propKey, propValue);
    }
  }
};
