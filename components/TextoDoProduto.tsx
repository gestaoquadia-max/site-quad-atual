// A descrição do produto como foi digitada no console (recado da API de 19/11/2026): com as quebras de linha, o recuo
// e os emoji. Sempre como TEXTO, nunca como HTML. A tipografia vem de quem chama.
export default function TextoDoProduto({ texto, className = "" }: { texto: string; className?: string }) {
  return <p className={`whitespace-pre-wrap [overflow-wrap:anywhere] ${className}`}>{texto}</p>;
}

// Abaixo do título fica só este link, que desce até o bloco "Sobre o …" com o texto inteiro (pedido de 24/11/2026:
// a descrição não fica embaixo do título). A cor e o espaço vêm de quem chama (topo escuro ou claro).
export function LinkParaADescricao({ className = "" }: { className?: string }) {
  return (
    <a href="#descricao" className={`inline-flex items-center gap-1.5 font-semibold underline underline-offset-4 ${className}`}>
      Leia a descrição completa <span aria-hidden="true">↓</span>
    </a>
  );
}

// O bloco "Sobre o …" do corpo da página, no molde do cartão "Sobre a turma", com o texto inteiro: o destino do
// LinkParaADescricao (#descricao). O scroll-mt deixa o título do bloco abaixo do menu fixo do topo.
export function SobreOProduto({ rotulo, titulo, texto }: { rotulo: string; titulo: string; texto: string }) {
  return (
    <div id="descricao" className="scroll-mt-[130px] rounded-[18px] border border-linha bg-superficie shadow-cartao p-[clamp(28px,4vw,48px)]">
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-azul-forte">{rotulo}</span>
      <h2 className="mb-4 mt-2 font-display text-2xl font-extrabold tracking-[-0.02em]">{titulo}</h2>
      <TextoDoProduto texto={texto} className="max-w-[760px] text-[15.5px] leading-[1.65] text-ardosia-escura" />
    </div>
  );
}
