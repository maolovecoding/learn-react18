/**
 * dom属性操作
 * @param node 
 * @param name 
 * @param value 
 */
export const setValueForProperty = (node: HTMLElement, name, value) => {
  if (value === null) {
    node.removeAttribute(name)
  } else {
    node.setAttribute(name, value)
  }
}
