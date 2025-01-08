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
  const [number, setNumber] = React.useState(0);
  return number % 2 === 0 ? (
    <div
      onClick={() => {
        setNumber(number + 1);
      }}
      key="title"
      id="title"
    >
      title
    </div>
  ) : (
    <p
      onClick={() => {
        setNumber(number + 1);
      }}
      key="title"
      id="title"
    >
      title2
    </p>
  );
};

const element = <App />;

console.log(element);

const root = createRoot(document.getElementById("root"));
console.log(root);
// 把虚拟DOM渲染到容器
root.render(element);
