import CartaoEvento from "@/components/home/CartaoEvento";
import { paraCartaoDeExcursao, type ViagemDeExcursao } from "@/lib/excursoes";

// As excursões para o dia da prova em /eventos (âncora #excursoes, usada pelo menu). Sem nenhuma à venda, a seção
// mostra o aviso; sem resposta da API, some (a agenda acima já avisa da falha).
export default function SecaoDeExcursoes({ viagens }: { viagens: ViagemDeExcursao[] | null }) {
  if (viagens === null) return null;
  return (
    <section id="excursoes" className="scroll-mt-[120px] bg-nevoa-clara py-[clamp(56px,7vw,96px)]">
      <div className="conteiner">
        <div className="mb-[clamp(24px,3vw,36px)] max-w-[640px]">
          <h2 className="titulo-secao mb-3">Excursões para provas</h2>
          <p className="text-[17px] leading-[1.6] text-ardosia">
            Viagens organizadas pelo Quad para o dia da prova, com embarque na sede, em Feira de Santana.
          </p>
        </div>
        {viagens.length === 0 ? (
          <div className="flex flex-col items-center gap-2.5 rounded-[18px] border-[1.5px] border-dashed border-[#C9D3E0] px-5 py-[clamp(40px,5vw,64px)] text-center">
            <span className="font-display text-[22px] font-extrabold">Nenhuma excursão com vagas abertas</span>
            <span className="max-w-[460px] text-[15px] text-ardosia">As próximas excursões aparecem aqui assim que as vendas abrirem.</span>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,290px),1fr))] gap-5">
            {viagens.map((v) => {
              const cartao = paraCartaoDeExcursao(v);
              return <CartaoEvento key={cartao.id} evento={cartao} />;
            })}
          </div>
        )}
      </div>
    </section>
  );
}
