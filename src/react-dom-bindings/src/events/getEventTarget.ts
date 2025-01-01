/**
 * 获取事件源
 * @param nativeEvent
 * @returns
 */
const getEventTarget = (nativeEvent) => {
  const target = nativeEvent.target || nativeEvent.srcElement || window;
  return target;
};

export default getEventTarget;
