import type { FC, PropsWithChildren } from "react";

export const DefaultLayout: FC<PropsWithChildren> = ({ children }) => (
  <div className="min-h-screen bg-gray-900 text-stone-300">{children}</div>
);
