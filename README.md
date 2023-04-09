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