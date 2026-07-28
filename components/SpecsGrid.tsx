export default function SpecsGrid({
  specs,
}: {
  specs: { label: string; valor: string; destaque?: boolean }[];
}) {
  return (
    <div className="mt-7 grid grid-cols-2 gap-px border border-dark bg-white/10 sm:grid-cols-3">
      {specs.map((s) => (
        <div key={s.label} className="bg-navy-mid p-4">
          <div className="text-[11px] uppercase tracking-[0.1em] text-steel">{s.label}</div>
          <div className={`font-display mt-1 text-[17px] font-bold ${s.destaque ? "text-blue" : "text-offwhite"}`}>
            {s.valor}
          </div>
        </div>
      ))}
    </div>
  );
}
