## react18学习

### 安装vite
```js

pnpm i vite vite -D
pnpm i @vitejs/plugin-react -D

pnpm i @babel/core -D
pnpm i @babel/plugin-transform-react-jsx -D

```

### 入口文件html
根目录下新建入口文件index.html

### 新建vite配置文件
vite.config.ts

### 配置eslint
```shell
pnpm create @eslint/config
```

## 配置别名
### vite
```ts

import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins:[
    react()
  ],
  resolve: {
    alias:{
      react: path.posix.resolve('src/packages/react'),
      'react-dom': path.posix.resolve('src/packages/react-dom'),
      'react-reconciler': path.posix.resolve('src/packages/react-reconciler'),
      scheduler: path.posix.resolve('src/packages/scheduler'),
      shared: path.posix.resolve('src/packages/shared'),
    }
  }
})
```


### 配置ts
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "jsx": "react-jsxdev",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "baseUrl": ".",
    "paths": {
      "react/*": ["./src/packages/react/*"],
      "react-dom/*": ["./src/packages/react-dom/*"],
      "react-reconciler/*": ["./src/packages/react-reconciler/*"],
      "scheduler/*": ["./src/packages/scheduler/*"],
      "shared/*": ["./src/packages/shared/*"],
    }
  }
}
```

### react-dom
虚拟DOM转真实DOM。


### requestIdleCallback
1. 兼容性差，react利用MessageChannel自己实现了一个
2. 执行时间不可控
react内部实现了一个，里面把每帧的执行时间定为5ms

### fiber

1. fiber是一个执行单元（原子）
2. fiber是一个数据结构
以前，react虚拟DOM生成真实DOM是一气呵成的，不可中断。如果工作时间过长可能引起卡顿。
有了fiber之后，虚拟DOM => fiber => 生成真实DOM
中间多了fiber的过程，因为fiber是一个类链表结构，可以方便的中断和重启
