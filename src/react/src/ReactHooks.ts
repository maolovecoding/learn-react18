import ReactCurrentDispatcher from "./ReactCurrentDispatcher";

const resolveDispatcher = () => {
  return ReactCurrentDispatcher.current;
};

/**
 *
 * @param reducer 处理函数 根据老状态和动作计算新状态
 * @param initialArg 初始化状态
 */
export const useReducer = (reducer, initialArg) => {
  const dispatcher = resolveDispatcher();
  return dispatcher.useReducer(reducer, initialArg);
};

/**
 *
 * @param initialState 初始状态
 */
export const useState = (initialState) => {
  const dispatcher = resolveDispatcher();
  return dispatcher.useState(initialState);
};

export const useEffect = (effect: () => void | (() => void), deps) => {
  const dispatcher = resolveDispatcher();
  return dispatcher.useEffect(effect, deps);
};


export const useLayoutEffect = (effect: () => void | (() => void), deps) => {
  const dispatcher = resolveDispatcher();
  return dispatcher.useLayoutEffect(effect, deps);
};