import CartaoEvento from "@/components/home/CartaoEvento";
import { paraCartaoDeExcursao, type ViagemDeExcursao } from "@/lib/excursoes";

// As excursões para o dia da prova em /eventos (âncora #excursoes, usada pelo menu). Na Agenda Quad da designer
// (11/11/2026), a seção só existe quando há excursões cadastradas.
export default function SecaoDeExcursoes({ viagens }: { viagens: ViagemDeExcursao[] | null }) {
  if (!viagens?.length) return null;
  return (
    <section id="excursoes" className="scroll-mt-[120px] bg-nevoa pt-[clamp(48px,6vw,72px)]">
      <div className="conteiner flex flex-col gap-7">
        <div className="flex flex-col gap-2">
          <h2 className="titulo-secao">Excursões para provas</h2>
          <p className="text-[16.5px] leading-[1.55] text-ardosia [text-wrap:pretty]">
            Viagens organizadas pelo Quad para o dia da prova, com embarque na sede, em Feira de Santana.
          </p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-6">
          {viagens.map((v) => {
            const cartao = paraCartaoDeExcursao(v);
            return <CartaoEvento key={cartao.id} evento={cartao} />;
          })}
        </div>
      </div>
    </section>
  );
}
