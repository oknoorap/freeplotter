import { type FC, StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { ReactQueryProvider } from "./providers/ReactQueryProvider.tsx";
import Homepage from "./pages/Home.tsx";
import "./index.css";

const pageLookup: Record<string, FC> = {
  "/": Homepage,
  "/outline.html": Homepage,
};

const renderApp = (pageName: string) => {
  const Page = pageLookup[pageName];
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ReactQueryProvider>
        <Page />
      </ReactQueryProvider>
    </StrictMode>,
  );
};

renderApp(window.location.pathname);
