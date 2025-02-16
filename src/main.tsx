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
  console.log("------ App render ---------");
  const [number, setNumber] = React.useState(0);
  React.useEffect(() => {
    console.log("useEffect 1");
    const timer = setInterval(() => {
      setNumber(number + 1);
    }, 1000);
    return () => {
      console.log("destroy useEffect 1");
      clearInterval(timer);
    };
  }, []);
  // React.useEffect(() => {
  //   console.log("useEffect 2");
  //   return () => {
  //     console.log("destroy useEffect 2");
  //   };
  // });
  // React.useEffect(() => {
  //   console.log("useEffect 3");
  //   return () => {
  //     console.log("destroy useEffect 3");
  //   };
  // });
  return (
    <button
      onClick={() => {
        setNumber(number + 1);
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
