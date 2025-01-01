import { FiberNode } from "react-reconciler/src/ReactFiber";
import { getFiberCurrentPropsFromNode } from "../client/ReactDOMComponentTree";

/**
 * 获取此fiber上对应的回调函数
 * @param instance
 * @param registrationName
 */
const getListener = (instance: FiberNode, registrationName: string) => {
  const { stateNode } = instance;
  if (stateNode === null) {
    return null;
  }
  const props = getFiberCurrentPropsFromNode(stateNode);
  if (props === null) {
    return null;
  }
  const listener = props[registrationName]; // props.onClick
  if (listener === undefined) {
    return null;
  }
  return listener;
};

export default getListener;
