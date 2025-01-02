import { createRoot } from "react-dom/client";

const App = () => {
  return (
    <h1
      onClick={(e) => {
        console.log("父 冒泡 click", e.currentTarget);
      }}
      onClickCapture={(e) => {
        console.log("父 捕获 clickCapture", e.currentTarget);
      }}
    >
      hello
      <span
        style={{ color: "red" }}
        onClick={(e) => {
          e.stopPropagation();
          console.log("子 冒泡 click", e.currentTarget);
        }}
        onClickCapture={(e) =>
          console.log("子 捕获 clickCapture", e.currentTarget)
        }
      >
        world
      </span>
    </h1>
  );
};

const element = <App />;

console.log(element);

const root = createRoot(document.getElementById("root"));
console.log(root);
// 把虚拟DOM渲染到容器
root.render(element);
