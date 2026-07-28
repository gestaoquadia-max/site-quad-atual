import Link from "next/link";

export default function BuyBox({
  preco,
  precoSufixo,
  nota,
  cta,
  vagas,
}: {
  preco: string;
  precoSufixo?: string;
  nota: string;
  cta: string;
  vagas?: { total: number; ocupadas: number };
}) {
  const pct = vagas ? Math.round((vagas.ocupadas / vagas.total) * 100) : 0;

  return (
    <div className="sticky top-[92px] border border-t-[3px] border-dark border-t-blue bg-navy-mid p-7 shadow">
      <div className="font-display text-[38px] font-bold leading-none text-blue">
        {preco}
        {precoSufixo && <small className="text-[15px] font-medium text-steel-light">{precoSufixo}</small>}
      </div>
      <p className="mb-5 mt-2.5 text-[13px] text-steel-light">{nota}</p>
      {vagas && (
        <div className="mb-5">
          <div className="mb-2 flex justify-between text-xs uppercase tracking-wide text-steel-light">
            <span>Ocupação da turma</span>
            <strong className="text-blue">
              {vagas.ocupadas} de {vagas.total} vagas preenchidas
            </strong>
          </div>
          <div className="h-2 border border-dark bg-navy-deep">
            <div className="h-full bg-blue" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
      <Link href="/checkout" className="btn btn-blue block w-full">
        {cta}
      </Link>
      <div className="mt-3.5 flex items-center justify-center gap-2 text-xs text-steel">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <rect x="2" y="5" width="8" height="6" rx="1" stroke="currentColor" />
          <path d="M4 5V3.5C4 2.4 4.9 1.5 6 1.5s2 .9 2 2V5" stroke="currentColor" />
        </svg>
        Pagamento seguro via Pagar.me
      </div>
    </div>
  );
}
