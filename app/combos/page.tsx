import Trilha from "@/components/Trilha";
import CartaoCombo from "@/components/combos/CartaoCombo";
import { areaDoCombo, listarCombos, type AreaDoCombo, type Combo } from "@/lib/combos";
import { metadadosDaPagina } from "@/lib/seo";

// Igual a SEGUNDOS_DE_CACHE (lib/vitrine.ts); o Next exige um número escrito aqui.
export const revalidate = 60;

export const metadata = metadadosDaPagina({
  titulo: "Combos",
  descricao: "Turmas, materiais e simulados do Quad Concursos juntos, por um preço menor que a soma das partes.",
  caminho: "/combos",
});

// Todos os combos, agrupados pela área das partes; os que misturam áreas vêm por último.
const GRUPOS: { area: AreaDoCombo | null; titulo: string }[] = [
  { area: "turmas", titulo: "Combos de turmas" },
  { area: "materiais", titulo: "Combos de materiais" },
  { area: "simulados", titulo: "Combos de simulados" },
  { area: null, titulo: "Combos completos" },
];

export default async function CombosPage() {
  const combos = await listarCombos();
  const porGrupo = GRUPOS.map((g) => ({ ...g, combos: (combos ?? []).filter((c: Combo) => areaDoCombo(c) === g.area) })).filter((g) => g.combos.length > 0);

  return (
    <>
      <section className="relative overflow-hidden bg-marinho-950 pb-[clamp(48px,6vw,80px)] pt-[clamp(28px,3vw,40px)] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_60%_at_80%_0%,rgba(0,107,255,0.28),transparent_70%)]" />
        <div className="conteiner relative">
          <Trilha itens={[{ rotulo: "Início", href: "/" }, { rotulo: "Combos" }]} className="mb-[clamp(28px,4vw,48px)]" />
          <h1 className="font-display text-[clamp(2.4rem,5vw,4.2rem)] font-extrabold leading-[1.02] tracking-[-0.04em]">Combos do Quad</h1>
          <p className="mt-4 max-w-[600px] text-[clamp(16px,1.4vw,18px)] leading-[1.6] text-[#B4C1D3] [text-wrap:pretty]">
            Turmas, materiais e simulados juntos, por um preço menor que a soma das partes. Cada combo é pago de uma vez, à parte do carrinho.
          </p>
        </div>
      </section>

      <section className="bg-nevoa py-[clamp(48px,6vw,88px)]">
        <div className="conteiner flex flex-col gap-[clamp(40px,5vw,64px)]">
          {combos === null && (
            <div role="alert" className="rounded-2xl border border-[#9B3535]/30 bg-[#9B3535]/[0.06] p-6 text-center text-sm text-[#FF9C9C]">
              Não foi possível carregar os combos agora. Tente novamente em instantes.
            </div>
          )}
          {combos !== null && porGrupo.length === 0 && (
            <div className="flex flex-col items-center gap-2.5 rounded-[18px] border-[1.5px] border-dashed border-linha-forte px-5 py-[clamp(40px,5vw,64px)] text-center text-ardosia-escura">
              <span className="font-display text-[22px] font-extrabold text-tinta">Nenhum combo à venda agora</span>
              <span className="max-w-[440px] text-[15px] [text-wrap:pretty]">Os combos aparecem aqui assim que forem cadastrados.</span>
            </div>
          )}
          {porGrupo.map((g) => (
            <div key={g.titulo}>
              <h2 className="mb-5 font-display text-[clamp(1.6rem,2.6vw,2.1rem)] font-extrabold tracking-[-0.03em]">{g.titulo}</h2>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-[clamp(16px,1.6vw,24px)]">
                {g.combos.map((c) => (
                  <CartaoCombo key={c.id} combo={c} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
