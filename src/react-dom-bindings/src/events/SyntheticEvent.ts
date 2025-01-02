import assign from "shared/assign";

const functionThatReturnsTrue = () => true;
const functionThatReturnsFalse = () => false;

/**
 * 鼠标事件接口
 */
const MouseEventInterface = {
  clientX: 0,
  clientY: 0,
  pageX: 0,
  pageY: 0,
  screenX: 0,
  screenY: 0,
};

const createSyntheticEvent = (Interface) => {
  /**
   * 合成事件基类
   */
  class SyntheticBaseEvent {
    _reactName;
    type;
    _targetInst;
    nativeEvent;
    currentTarget // 当前的事件源 随着事件回调的执行 不断变化
    target;
    /**
     * 是否阻止默认事件了
     */
    isDefaultPrevented = functionThatReturnsFalse;
    /**
     * 是否阻止继续传播了
     */
    isPropagationStopped = functionThatReturnsFalse;
    /**
     *
     * @param reactName react属性名 onClick
     * @param reactEventType 事件类型 click
     * @param targetInst 事件源fiber
     * @param nativeEvent 原生事件对象
     * @param nativeEventTarget 原生事件源对应的真实dom
     */
    constructor(
      reactName,
      reactEventType,
      targetInst,
      nativeEvent,
      nativeEventTarget
    ) {
      this._reactName = reactName;
      this.type = reactEventType;
      this._targetInst = targetInst;
      this.nativeEvent = nativeEvent; // 原始的事件源 不变
      this.target = nativeEventTarget;
      // 把原生事件对象上的属性拷贝到合成事件对象上
      for (const propName in Interface) {
        if (Object.hasOwn(Interface, propName)) {
          this[propName] = nativeEvent[propName];
        }
      }
    }
  }
  // 兼容
  assign(SyntheticBaseEvent.prototype, {
    preventDefault() {
      const event = this.nativeEvent; // 拿到原生事件
      if (event.preventDefault) {
        event.preventDefault();
      } else {
        event.returnValue = false; // IE
      }
      this.isDefaultPrevented = functionThatReturnsTrue;
    },
    stopPropagation() {
      const event = this.nativeEvent; // 拿到原生事件
      if (event.stopPropagation) {
        event.stopPropagation();
      } else {
        event.cancelBubble = false; // IE
      }
      this.isPropagationStopped = functionThatReturnsTrue;
    },
  });
  return SyntheticBaseEvent;
};

/**
 * 合成鼠标事件
 */
export const SyntheticMouseEvent = createSyntheticEvent(MouseEventInterface);
