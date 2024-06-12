import { createRoot } from "react-dom/client";
import App from "./App";

import "./styles/app.scss";

document.addEventListener("DOMContentLoaded", () => {
  const cont = document.getElementById("root");
  if (cont) {
    const root = createRoot(cont);
    root.render(<App />);
  }
});
