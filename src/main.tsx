import * as React from "react";
import { createRoot } from "react-dom/client";

const reducer = (
  state: number,
  action: {
    type: string;
    payload: number;
  }
) => {
  if (action.type === "add") return state + action.payload;
  return state;
};

const App = () => {
  const [number, setNumber] = React.useReducer(reducer, 0);
  const [number2, setNumber2] = React.useReducer(reducer, 0);
  return (
    <button
      onClick={() => {
        setNumber({
          type: "add",
          payload: 1,
        });
        setNumber({
          type: "add",
          payload: 2,
        });
        setNumber({
          type: "add",
          payload: 3,
        });
      }}
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
