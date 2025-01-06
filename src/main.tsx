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
  const attrs = {
    id: "btn",
    style: null,
  };
  if (number === 6) {
    delete attrs.id;
    attrs.style = { color: "red" };
  }
  return (
    <button
      {...attrs}
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
      {number}
    </button>
  );
};

const element = <App />;

console.log(element);

const root = createRoot(document.getElementById("root"));
console.log(root);
// 把虚拟DOM渲染到容器
root.render(element);
