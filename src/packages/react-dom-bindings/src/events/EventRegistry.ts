
/**
 * 所有的原生事件
 */
export const allNativeEvents = new Set<string>();

/**
 * 注册两个阶段的事件
 * 当我在页面触发事件的时候 会走事件的处理函数
 * 事件处理函数需要找到DOM原生对应要执行的react事件 onClick onClickCapture
 * @param registerationName react事件名
 * @param dependencies 原生事件数组
 */
export const registerTwoPhaseEvent = (registerationName: string, dependencies: string[]) => {
  // 注册事件冒泡和捕获
  registerDirectEvent(registerationName, dependencies) // onClick 
  registerDirectEvent(registerationName + 'Capture', dependencies) // onClickCapture
}

export const registerDirectEvent = (registerationName: string, dependencies: string[]) => {
  for (let i = 0; i < dependencies.length; i++) {
    allNativeEvents.add(dependencies[i]) // click
  }
}