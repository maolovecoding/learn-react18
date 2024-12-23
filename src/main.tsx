import { createRoot } from "react-dom/client";
const element = (
  <div>
    <h1>
      hello
      <span style={{ color: "red" }}>world</span>
    </h1>
    <h2>
      hello2
      <span style={{ color: "green" }}>world2</span>
    </h2>
  </div>
);
console.log(element);

const root = createRoot(document.getElementById("root"));
console.log(root);
// 把虚拟DOM渲染到容器
root.render(element);
