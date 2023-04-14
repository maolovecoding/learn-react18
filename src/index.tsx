import { createRoot } from 'react-dom/client'
// const element = <h1 id="container">
//   hello
//   <span style={{color: 'red'}}>world</span>
// </h1>

// console.log(element)
const root = createRoot(document.getElementById('root'))
// console.log(root)
// root.render(element)

function FunctionComponent() {
  return (
    <h1 id="container">
      hello
      <span style={{color: 'red'}}>world</span>
    </h1>
  )
}
const element = <FunctionComponent/>
root.render(element)