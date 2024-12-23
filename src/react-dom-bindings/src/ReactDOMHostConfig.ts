/**
 * 判断当前虚拟DOM是否是直接的单个子节点 文本节点
 * @param type
 * @param content
 * @returns
 */
export const shouldSetTextContent = (type, props) => {
  const children = props.children;
  return typeof children === "string" || typeof children === "number";
};
