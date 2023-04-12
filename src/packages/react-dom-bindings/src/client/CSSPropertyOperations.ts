
/**
 * 设置dom的styles
 * @param node dom
 * @param style 
 */
export const setValueForStyles = (node: Node, styles) => {
  const { style } = node as HTMLElement
  for (const styleName in styles) {
    if (styles.hasOwnProperty(styleName)) {
      const styleValue = styles[styleName]
      style[styleName] = styleValue
    }
  }
};
