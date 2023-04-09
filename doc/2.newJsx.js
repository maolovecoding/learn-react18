
// 在react17之前，babel转换是老的写法
const babel = require('@babel/core')

const sourceCode = `
<h1>
  hello
  <span style={{color: 'red'}}>world</span>
</h1>
`

const res = babel.transform(sourceCode, {
  plugins:[
    [
      "@babel/plugin-transform-react-jsx", {runtime: 'automatic'}
    ]
  ]
})

console.log(res.code)

// 新版是自动的 automatic
// 会自动帮忙引入 react/jsx-runtime
// 也就是说： react.createElelment => jsx
// 老版本没有children属性，不会帮我们处理，新版本是把子节点直接作为children属性了
/*
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
_jsxs("h1", {
  children: ["hello", _jsx("span", {
    style: {
      color: 'red'
    },
    children: "world"
  })]
});
*/