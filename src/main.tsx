import { createRoot } from "react-dom/client";
const element = (
<h1>
  hello
  <span style={{ color: "red" }}>world</span>
</h1>
);
console.log(element);

const root = createRoot(document.getElementById("root"));
console.log(root);
// 把虚拟DOM渲染到容器
root.render(element);
