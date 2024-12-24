/**
 * 给dom节点设置属性值
 * @param node
 * @param name
 * @param value
 */
export const setValueForProperty = (node: HTMLElement, name: string, value) => {
  if (value === null) {
    node.removeAttribute(name);
  } else {
    node.setAttribute(name, value);
  }
};
