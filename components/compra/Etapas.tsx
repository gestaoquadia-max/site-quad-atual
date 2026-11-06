// "Carrinho → Pagamento → Confirmação", com a etapa atual em destaque.
const ETAPAS = ["Carrinho", "Pagamento", "Confirmação"] as const;

export default function Etapas({ atual }: { atual: (typeof ETAPAS)[number] }) {
  const indice = ETAPAS.indexOf(atual);
  return (
    <ol aria-label="Etapas da compra" className="mb-3.5 flex flex-wrap items-center gap-2.5 text-[13px] font-semibold text-ardosia">
      {ETAPAS.map((e, i) => (
        <li key={e} className="flex items-center gap-2.5">
          {i > 0 && <span aria-hidden="true">→</span>}
          <span aria-current={i === indice ? "step" : undefined} className={i < indice ? "text-[#13774A]" : i === indice ? "text-tinta" : ""}>
            {e}
          </span>
        </li>
      ))}
    </ol>
  );
}
