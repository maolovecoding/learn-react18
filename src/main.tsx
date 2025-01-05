import * as React from "react";
import { createRoot } from "react-dom/client";

const reducer = (
  state: number,
  action: {
    type: string;
  }
) => {
  if (action.type === "add") return state + 1;
  return state;
};

const App = () => {
  const [number, setNumber] = React.useReducer(reducer, 0);
  return (
    <button
      onClick={() =>
        setNumber({
          type: "add",
        })
      }
    >
      点击{number} + 1
    </button>
  );
};

const element = <App />;

console.log(element);

const root = createRoot(document.getElementById("root"));
console.log(root);
// 把虚拟DOM渲染到容器
root.render(element);
