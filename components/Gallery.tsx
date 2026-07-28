import Kicker from "./Kicker";

export default function Gallery({ items }: { items: string[] }) {
  return (
    <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {items.map((label, i) => (
        <div
          key={label}
          className={`group relative flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2.5 overflow-hidden border border-dark bg-gradient-to-br from-navy-mid to-navy-deep transition-colors hover:border-blue ${
            i === 0 ? "col-span-full aspect-[16/7]" : ""
          }`}
        >
          <div className="pattern-diagonal pointer-events-none absolute inset-0 transition-opacity group-hover:opacity-70" />
          <span className="hexagon relative flex h-11 w-11 items-center justify-center bg-white/5 text-blue transition-colors group-hover:bg-blue/15">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="14" height="12" />
              <circle cx="6.5" cy="7" r="1.3" />
              <path d="M2 12.5l4-3.5 3 2.5 3-3 3 4" />
            </svg>
          </span>
          <Kicker color="text-blue" className="relative">Conteúdo em breve</Kicker>
          <span className="relative text-[11px] uppercase tracking-[0.08em] text-steel-light">{label}</span>
        </div>
      ))}
    </div>
  );
}
