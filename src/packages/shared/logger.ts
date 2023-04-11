/**
 * @Author: 毛毛 
 * @Date: 2023-04-11 00:08:43 
 * @Last Modified by: 毛毛
 * @Last Modified time: 2023-04-11 00:16:48
 * @description 打印日志 方便查看
 */
import { FiberNode } from 'react-reconciler/src/ReactFiber';
import * as ReactWorkTags from 'react-reconciler/src/ReactWorkTags'

const ReactWorkTagsMap = new Map<number, keyof typeof ReactWorkTags>()
for(const tag in ReactWorkTags) {
  ReactWorkTagsMap.set(ReactWorkTags[tag], tag as keyof typeof ReactWorkTags)
}
export default (prefix, workInProgress: FiberNode) => {
  const tagValue = workInProgress.tag
  const tagName = ReactWorkTagsMap.get(tagValue)
  let str = ` ${tagName} `
  if(tagName === 'HostComponent') {
    str += ` ${workInProgress.type}`
  } else if (tagName === 'HostText') {
    str += ` ${workInProgress.pendingProps}`
  }
  console.log(`${prefix} ${str}`)
}
let indent = { number: 0 }

export {
  indent
}