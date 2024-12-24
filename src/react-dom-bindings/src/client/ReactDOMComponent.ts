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
