import AccentCard from "@/components/AccentCard";

const materiais = [
  { titulo: "Direito Constitucional — Aula 12", sub: "Turma CFP 2025.2 · Publicado hoje" },
  { titulo: "Penal Militar — Questões Comentadas", sub: "Turma CFP 2025.2 · Publicado ontem" },
  { titulo: "Português — Interpretação de Texto", sub: "Compra avulsa · 02/07" },
];

export default function AlunoPage() {
  return (
    <>
      <h2 className="font-display text-[28px] font-bold uppercase">Painel</h2>
      <p className="mb-8 text-sm text-steel">Bem-vindo de volta, João. Missão do dia: constância.</p>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        {[
          { lbl: "Turmas ativas", val: "1" },
          { lbl: "Materiais disponíveis", val: "8" },
          { lbl: "Próximo evento", val: "26 JUL" },
        ].map((s) => (
          <AccentCard key={s.lbl} className="p-5">
            <div className="text-xs uppercase tracking-[0.08em] text-steel">{s.lbl}</div>
            <div className="font-display mt-1 text-[30px] font-bold">{s.val}</div>
          </AccentCard>
        ))}
      </div>

      <h2 className="font-display mb-4 text-xl font-bold uppercase">Materiais recentes</h2>
      {materiais.map((m) => (
        <div
          key={m.titulo}
          className="mb-2.5 flex items-center justify-between border border-light bg-white px-5 py-4"
        >
          <div className="flex items-center gap-3.5">
            <span className="font-display flex h-11 w-[38px] items-center justify-center bg-navy text-[10px] font-bold tracking-wide text-blue">
              PDF
            </span>
            <div>
              <div className="text-[15px] font-semibold">{m.titulo}</div>
              <div className="text-xs text-steel">{m.sub}</div>
            </div>
          </div>
          <button className="focus-ring font-display bg-navy px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-blue transition-colors hover:bg-navy-mid">
            Baixar
          </button>
        </div>
      ))}
    </>
  );
}
