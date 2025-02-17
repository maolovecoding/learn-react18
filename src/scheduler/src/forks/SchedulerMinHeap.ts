export interface IHeapNode {
  sortIndex: number; // 越小优先级越高
  id: number;
}
/**
 * 向最小堆添加节点
 * @param heap
 * @param node
 */
const push = (heap: IHeapNode[], node: IHeapNode) => {
  // 获取元素数量
  const index = heap.length;
  heap.push(node); // 先放到末尾
  siftUp(heap, node, index); // 向上调整
};

const pop = (heap: IHeapNode[]) => {
  if (heap.length === 0) {
    return null;
  }
  const first = heap[0];
  if (first !== undefined) {
    const last = heap.pop();
    if (last !== first) {
      heap[0] = last;
      siftDown(heap, last, 0);
    }
    return first;
  }
  return null;
};
/**
 * 查看最小堆堆顶元素
 * @param heap
 */
const peek = (heap: IHeapNode[]) => {
  const first = heap[0];
  return first ?? null;
};
/**
 * 向上调整某个节点，使其位于正确的位置
 * @param heap
 * @param node
 * @param i
 */
const siftUp = (heap: IHeapNode[], node: IHeapNode, i: number) => {
  let index = i;
  while (true) {
    const parentIndex = (index - 1) >>> 1;
    const parent = node[parentIndex];
    // 父节点大于子节点 交换位置
    if (parent !== undefined && compare(parent, node) > 0) {
      heap[parentIndex] = node;
      heap[index] = parent;
      index = parentIndex;
    } else {
      return;
    }
  }
};
/**
 * 向下调整某个节点，使其位于正确的位置
 * @param heap
 * @param node
 * @param i
 */
const siftDown = (heap: IHeapNode[], node: IHeapNode, i: number) => {
  let index = i;
  const length = heap.length;
  while (index < length) {
    const leftIndex = (index + 1) * 2 - 1;
    const rightIndex = leftIndex + 1;
    const left = heap[leftIndex];
    const right = heap[rightIndex];
    if (left !== undefined && compare(left, node) < 0) {
      // 左子节点小于父节点 需要调整位置
      // 先看左右节点大小
      if (right !== undefined && compare(right, left) < 0) {
        // 右节点更小
        heap[index] = right;
        heap[rightIndex] = node;
        index = rightIndex;
      } else {
        // 左节点小 或者没有右节点
        heap[index] = left;
        heap[leftIndex] = node;
        index = leftIndex;
      }
    } else if (right !== undefined && compare(right, node) < 0) {
      heap[index] = right;
      heap[rightIndex] = node;
      index = rightIndex;
    } else {
      return;
    }
  }
};

const compare = (a: IHeapNode, b: IHeapNode) => {
  const diff = a.sortIndex - b.sortIndex;
  return diff !== 0 ? diff : a.id - b.id;
};

export { push, pop, siftDown, siftUp };

// const heap = [];
// let id = 1;

// push(heap, {
//   sortIndex: 1,
//   id: id++,
// });

// push(heap, {
//   sortIndex: 2,
//   id: id++,
// });

// push(heap, {
//   sortIndex: 3,
//   id: id++,
// });
// push(heap, {
//   sortIndex: 4,
//   id: id++,
// });

// push(heap, {
//   sortIndex: 5,
//   id: id++,
// });
// push(heap, {
//   sortIndex: 6,
//   id: id++,
// });

// push(heap, {
//   sortIndex: 7,
//   id: id++,
// });

// console.log(peek(heap));
// pop(heap);
// console.log(peek(heap));
