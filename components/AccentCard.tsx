import type { ReactNode } from "react";

export default function AccentCard({
  side = "l",
  dark = false,
  className = "",
  children,
}: {
  side?: "l" | "t";
  dark?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const acento = side === "l" ? "border-l-[3px] border-l-blue" : "border-t-[3px] border-t-blue";
  const base = dark ? "border-dark bg-navy-mid" : "border-light bg-white";
  return <div className={`border transition-colors hover:border-blue ${base} ${acento} ${className}`}>{children}</div>;
}
