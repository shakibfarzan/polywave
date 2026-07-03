import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { usePolywaveStore } from "./lib/store";
import "./index.css";

// Dev-only: expose the store for debugging/automation (stripped from prod builds).
if (import.meta.env.DEV) {
  (window as unknown as { __polywave: typeof usePolywaveStore }).__polywave =
    usePolywaveStore;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
