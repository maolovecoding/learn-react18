import { setValueForStyles } from "./CSSPropertyOperations";
import { setValueForProperty } from "./DOMPropertyOperations";
import setTextContent from "./setTextContent";

const STYLE = 'style'
const CHILDREN = 'children'
/**
 * 设置初始化属性
 * @param domElement 
 * @param tag 标签 tag span div
 * @param props 
 */
export const setInitialProperties = (domElement: Node, tag, props) => { 
  setInitialDOMProperties(tag, domElement, props)
};
/**
 * 初始化dom属性
 * @param tag 
 * @param domElement 
 * @param nextProps 
 */
export const setInitialDOMProperties = (tag, domElement, nextProps) => {
  for (const propsKey in nextProps) {
    if (nextProps.hasOwnProperty(propsKey)) {
      const nextProp = nextProps[propsKey]
      if (propsKey === STYLE) {
        // style属性
        setValueForStyles(domElement, nextProp)
      } else if (propsKey === CHILDREN) {
        // children属性 独生子需要处理 
        if (typeof nextProp === 'string') {
          setTextContent(domElement, nextProp)
        } else if (typeof nextProp === 'number') {
          setTextContent(domElement, nextProp + '')
        }
      } else if (nextProp !== null) {
        setValueForProperty(domElement, propsKey, nextProp)
      }
    }
  }
}