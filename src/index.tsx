import React from "react";
import { createRoot } from "react-dom/client";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import "./index.css";
import { App } from "./App";

// No <React.StrictMode>: its double-run effects (React 18 roots) break the
// current MUI/tiptap/drag-and-drop versions, e.g. input labels overlapping
// values. Re-enable after upgrading them.
createRoot(document.getElementById("app")!).render(<App />);
