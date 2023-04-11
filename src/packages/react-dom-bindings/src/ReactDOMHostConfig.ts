/**
 * 是否直接设置文本内容 只有一个孩子 也就是 children = 'xx'
 * @param type 
 * @param props 
 */
export const shouldSetTextContent = (type, props) => {
  return typeof props.children === 'string' || typeof props.children === 'number'
}