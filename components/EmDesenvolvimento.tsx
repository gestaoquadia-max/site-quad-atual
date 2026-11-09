// Aviso de área em desenvolvimento (09/11/2026): no lugar dos aprovados (sem as histórias reais, que virão da API) e
// das áreas em espera (lib/em-espera.ts), na home e nas páginas delas.
export default function EmDesenvolvimento({ texto }: { texto: string }) {
  return (
    <div className="mx-auto max-w-[720px] rounded-[20px] border border-linha bg-superficie p-[clamp(24px,3vw,40px)] text-center shadow-cartao">
      <span className="mb-4 inline-block rounded-full bg-azul/10 px-3.5 py-1 text-[12.5px] font-bold uppercase tracking-[0.08em] text-azul-forte">
        Em desenvolvimento
      </span>
      <h3 className="mb-3 font-display text-[clamp(20px,2.2vw,26px)] font-extrabold leading-tight tracking-[-0.02em]">
        Estamos preparando esta área
      </h3>
      <p className="text-[16px] leading-[1.65] text-ardosia">{texto}</p>
    </div>
  );
}
