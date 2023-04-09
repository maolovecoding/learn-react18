
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
      "@babel/plugin-transform-react-jsx", {runtime: 'classic'}
    ]
  ]
})

console.log(res)

/*
  code: React.createElement("h1", null, "hello", React.createElement("span", {\n' +
  '  style: {\n' +
  "    color: 'red'\n" +
  '  }\n' +
  '}, "world"));',
*/