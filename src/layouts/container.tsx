import type { FC, PropsWithChildren } from "react";

export const Container: FC<PropsWithChildren> = ({ children }) => (
  <div className="max-w-3xl mx-auto px-4 py-12">{children}</div>
);
