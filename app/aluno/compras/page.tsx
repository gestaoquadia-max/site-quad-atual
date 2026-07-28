export const metadata = { title: "Compras — Área do Aluno" };

const compras = [
  { nome: "Mensalidade — Turma CFP 2025.2", data: "04/07/2025", valor: "R$ 497,00", status: "Pago" },
  { nome: "Kit Completo CFP", data: "04/06/2025", valor: "R$ 149,90", status: "Pago" },
  { nome: "Direito Constitucional", data: "28/06/2025", valor: "R$ 49,90", status: "Pago" },
  { nome: "Raciocínio Lógico", data: "15/06/2025", valor: "R$ 34,90", status: "Pago" },
];

export default function ComprasPage() {
  return (
    <>
      <h2 className="font-display text-[28px] font-bold uppercase">Compras</h2>
      <p className="mb-8 text-sm text-steel">Histórico de mensalidades e materiais adquiridos.</p>

      <div className="border border-light bg-white">
        {compras.map((c, i) => (
          <div
            key={c.nome + c.data}
            className={`flex items-center justify-between px-5 py-4 ${
              i !== compras.length - 1 ? "border-b border-light" : ""
            }`}
          >
            <div>
              <div className="text-[15px] font-semibold">{c.nome}</div>
              <div className="text-xs text-steel">{c.data}</div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-display text-base font-bold text-navy">{c.valor}</span>
              <span className="bg-[#E4EFE5] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#3E7A44]">
                {c.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
