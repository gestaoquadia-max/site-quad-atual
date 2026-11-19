// A descrição do produto como foi digitada no console (recado da API de 19/11/2026): com as quebras de linha, o recuo
// e os emoji. Sempre como TEXTO, nunca como HTML. A tipografia vem de quem chama.
export default function TextoDoProduto({ texto, className = "" }: { texto: string; className?: string }) {
  return <p className={`whitespace-pre-wrap [overflow-wrap:anywhere] ${className}`}>{texto}</p>;
}

// O bloco "Sobre o …" do corpo da página, no molde do cartão "Sobre a turma", com o texto inteiro. Só aparece quando
// o texto não cabe na chamada do topo (cabeNaChamada, lib/seo.ts).
export function SobreOProduto({ rotulo, titulo, texto }: { rotulo: string; titulo: string; texto: string }) {
  return (
    <div className="rounded-[18px] border border-linha bg-superficie shadow-cartao p-[clamp(28px,4vw,48px)]">
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-azul-forte">{rotulo}</span>
      <h2 className="mb-4 mt-2 font-display text-2xl font-extrabold tracking-[-0.02em]">{titulo}</h2>
      <TextoDoProduto texto={texto} className="max-w-[760px] text-[15.5px] leading-[1.65] text-ardosia-escura" />
    </div>
  );
}
