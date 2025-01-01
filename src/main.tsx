import { createRoot } from "react-dom/client";

const App = () => {
  return (
    <h1>
      hello
      <span style={{ color: "red" }}>world</span>
    </h1>
  );
};

const element = <App />;

console.log(element);

const root = createRoot(document.getElementById("root"));
console.log(root);
// 把虚拟DOM渲染到容器
root.render(element);
