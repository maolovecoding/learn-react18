import { FiberNode } from "react-reconciler/src/ReactFiber";
import * as ReactWorkTags from "react-reconciler/src/ReactWorkTags";

const ReactWorkTagsMap = new Map<number, keyof typeof ReactWorkTags>();

for (const tag in ReactWorkTags) {
  ReactWorkTagsMap.set(ReactWorkTags[tag], tag as keyof typeof ReactWorkTags);
}

const logger = (prefix, workInProgress: FiberNode) => {
  const tagValue = workInProgress.tag;
  const tagName = ReactWorkTagsMap.get(tagValue);
  let str = `${tagName}`;
  if (tagName === "HostComponent") {
    str += ` ${workInProgress.type}`;
  } else if (tagName === "HostText") {
    str += ` ${workInProgress.pendingProps}`;
  }
  console.log(`${prefix} ${str}`);
};

export default logger;
