/**
 * 给dom元素设置style样式
 * @param domElement
 * @param nextProp
 */
export const setValueForStyles = (domElement: HTMLElement, styles) => {
  const { style } = domElement;
  for (const styleName in styles) {
    if (Object.hasOwn(styles, styleName)) {
      const styleValue = styles[styleName];
      style[styleName] = styleValue;
    }
  }
};
