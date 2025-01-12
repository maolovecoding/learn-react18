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
  return number === 0 ? (
    <ul
      onClick={() => {
        setNumber(number + 1);
      }}
      key="title"
      id="title"
    >
      <li key="A" id="A">
        A
      </li>
      <li key="B" id="B">
        B
      </li>
      <li key="C" id="C">
        C
      </li>
      <li key="D" id="D">
        D
      </li>
      <li key="E" id="E">
        E
      </li>
      <li key="F" id="F">
        F
      </li>
    </ul>
  ) : (
    <ul
      onClick={() => {
        setNumber(number + 1);
      }}
      key="title"
      id="title"
    >
      <li key="A" id="A">
        A2
      </li>

      <li key="C" id="C">
        C2
      </li>

      <li key="E" id="E">
        E2
      </li>
      <li key="B" id="B">
        B2
      </li>
      <li key="G" id="G">
        G
      </li>
      <li key="D" id="D">
        D2
      </li>
    </ul>
  );
};

const element = <App />;

console.log(element);

const root = createRoot(document.getElementById("root"));
console.log(root);
// 把虚拟DOM渲染到容器
root.render(element);
