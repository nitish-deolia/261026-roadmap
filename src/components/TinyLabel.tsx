import type { ReactNode } from "react";

export function TinyLabel({ children }: { children: ReactNode }) {
  return (
    <span className="eyebrow">
      <span className="eyebrow-dot" />
      {children}
    </span>
  );
}
