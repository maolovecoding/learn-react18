
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
      'react-dom-bindings': path.posix.resolve('src/packages/react-dom-bindings'),
      'react-reconciler': path.posix.resolve('src/packages/react-reconciler'),
      scheduler: path.posix.resolve('src/packages/scheduler'),
      shared: path.posix.resolve('src/packages/shared'),
    }
  }
})