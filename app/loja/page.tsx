import Trilha from "@/components/Trilha";
import ListaDaLoja from "@/components/loja/ListaDaLoja";
import { metadadosDaPagina } from "@/lib/seo";
import { listarProdutosDaLoja } from "@/lib/vitrine";

export const metadata = metadadosDaPagina({
  titulo: "Loja Quad",
  descricao: "Camisas, canecas, garrafas e outros produtos oficiais do Quad Concursos, com retirada na sede.",
  caminho: "/loja",
});

// Igual a SEGUNDOS_DE_CACHE (lib/vitrine.ts).
export const revalidate = 60;

export default async function LojaPage() {
  const produtos = (await listarProdutosDaLoja()) ?? [];
  return (
    <>
      <section className="relative overflow-hidden bg-marinho-950 pb-[clamp(48px,5vw,72px)] pt-[clamp(28px,3vw,40px)] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_70%_at_80%_20%,rgba(0,107,255,0.26),transparent_70%)]" />
        <div className="conteiner relative">
          <Trilha itens={[{ rotulo: "Início", href: "/" }, { rotulo: "Loja" }]} className="mb-[clamp(28px,4vw,48px)]" />
          <h1 className="mb-3.5 font-display text-[clamp(2.8rem,5.6vw,5rem)] font-extrabold leading-[0.98] tracking-[-0.045em]">Loja Quad</h1>
          <p className="max-w-[520px] text-[clamp(16px,1.4vw,18px)] leading-[1.6] text-[#B4C1D3]">
            Produtos oficiais da marca Quad Concursos, com retirada gratuita na sede.
          </p>
        </div>
      </section>
      <section className="bg-nevoa pb-[clamp(64px,8vw,112px)] pt-[clamp(40px,5vw,72px)]">
        <div className="conteiner flex flex-col gap-6">
          <ListaDaLoja produtos={produtos} />
        </div>
      </section>
    </>
  );
}
