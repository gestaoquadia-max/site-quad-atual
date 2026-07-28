export const metadata = { title: "Meus materiais — Área do Aluno" };

const materiais = [
  { titulo: "Direito Constitucional — Aula 12", sub: "Turma CFP 2025.2 · Publicado 13/07" },
  { titulo: "Penal Militar — Questões Comentadas", sub: "Turma CFP 2025.2 · Publicado 12/07" },
  { titulo: "Português — Interpretação de Texto", sub: "Compra avulsa · 02/07" },
  { titulo: "Direito Constitucional", sub: "Compra avulsa · 28/06" },
  { titulo: "Raciocínio Lógico", sub: "Compra avulsa · 15/06" },
  { titulo: "Legislação PM-BA", sub: "Turma CFP 2025.2 · Publicado 10/06" },
  { titulo: "Kit Completo CFP", sub: "Compra avulsa · 04/06" },
  { titulo: "Penal Militar", sub: "Compra avulsa · 20/05" },
];

export default function MeusMateriaisPage() {
  return (
    <>
      <h2 className="font-display text-[28px] font-bold uppercase">Meus materiais</h2>
      <p className="mb-8 text-sm text-steel">Tudo o que você já tem acesso, disponível para download.</p>

      {materiais.map((m) => (
        <div
          key={m.titulo + m.sub}
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
