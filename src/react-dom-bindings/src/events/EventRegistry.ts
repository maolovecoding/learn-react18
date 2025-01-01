/**
 * 事件注册
 */

export const allNativeEvents = new Set<string>();

/**
 * 注册两阶段事件
 * 在页面出发事件的时候，走事件处理函数 事件处理函数找到对应要执行的React事件 onClick
 * @param registrationName react事件名
 * @param dependencies 原生事件数组 ['click']
 */
export const registerTwoPhaseEvent = (
  registrationName: string,
  dependencies: string[]
) => {
  // 注册冒泡事件
  registerDirectEvent(registrationName, dependencies);
  // 注册捕获事件
  registerDirectEvent(`${registrationName}Capture`, dependencies);
};

export const registerDirectEvent = (
  registrationName: string,
  dependencies: string[]
) => {
  for (let i = 0; i < dependencies.length; i++) {
    allNativeEvents.add(dependencies[i]); // click
  }
};
