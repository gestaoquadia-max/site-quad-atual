import type { ReactNode } from "react";

export default function Kicker({
  color = "text-blue-dark",
  className = "",
  children,
}: {
  color?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={`font-display text-[11px] font-semibold uppercase tracking-[0.14em] ${color} ${className}`}>
      {children}
    </span>
  );
}
