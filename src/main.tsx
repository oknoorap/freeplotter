import { type FC, StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { ReactQueryProvider } from "./providers/ReactQueryProvider.tsx";
import Homepage from "./pages/Home.tsx";
import OutlinePage from "./pages/Outline.tsx";
import PesanPage from "./pages/Pesan.tsx";
import "./index.css";

const pageLookup: Record<string, FC> = {
  "/": Homepage,
  "/outline": OutlinePage,
  "/pesan": PesanPage,
};

const renderApp = (pageName: string) => {
  const Page = pageLookup[pageName.replace(/\.html$/, "")];
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ReactQueryProvider>
        <Page />
      </ReactQueryProvider>
    </StrictMode>,
  );
};

renderApp(window.location.pathname);
