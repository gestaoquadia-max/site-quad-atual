// A área de aprovados ainda não tem as histórias reais (virão da API): até lá, este aviso fica no lugar dos cartões,
// na home e em /aprovados (09/11/2026). Os cartões de exemplo continuam em lib/data.ts, fora da tela.
export default function AprovadosEmDesenvolvimento() {
  return (
    <div className="mx-auto max-w-[720px] rounded-[20px] border border-linha bg-superficie p-[clamp(24px,3vw,40px)] text-center shadow-cartao">
      <span className="mb-4 inline-block rounded-full bg-azul/10 px-3.5 py-1 text-[12.5px] font-bold uppercase tracking-[0.08em] text-azul-forte">
        Em desenvolvimento
      </span>
      <h3 className="mb-3 font-display text-[clamp(20px,2.2vw,26px)] font-extrabold leading-tight tracking-[-0.02em]">
        Estamos preparando esta área
      </h3>
      <p className="text-[16px] leading-[1.65] text-ardosia">
        Em breve, as histórias dos alunos do Quad aprovados na PM-BA, no CFO e em outras forças de segurança vão estar aqui.
      </p>
    </div>
  );
}
