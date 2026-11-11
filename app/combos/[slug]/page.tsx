import Link from "next/link";
import { notFound } from "next/navigation";
import VerItem from "@/components/VerItem";
import Trilha from "@/components/Trilha";
import { buscarCombo, economiaEmTexto, linkDaParte, precoDoCombo, rotuloDaParte } from "@/lib/combos";
import { emReais } from "@/lib/loja";
import { metadadosDaPagina, resumir } from "@/lib/seo";
import Onda from "@/components/home/Onda";

// Igual a SEGUNDOS_DE_CACHE (lib/vitrine.ts); o Next exige um número escrito aqui.
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const combo = await buscarCombo(slug).catch(() => null);
  if (!combo) return {};
  return metadadosDaPagina({
    titulo: combo.nome,
    descricao: resumir(combo.descricao && combo.descricao !== combo.nome ? combo.descricao : `${combo.nome}: ${combo.componentes.map((p) => p.nome).join(", ")}.`),
    caminho: `/combos/${combo.slug}`,
  });
}

export default async function ComboPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const combo = await buscarCombo(slug).catch(() => null);
  if (!combo) notFound();
  const economia = economiaEmTexto(combo);
  const descricao = combo.descricao && combo.descricao !== combo.nome ? combo.descricao : null;

  return (
    <>
      <VerItem item={{ item_id: combo.id, item_name: combo.nome, item_category: "Combo", price: precoDoCombo(combo) / 100 }} />
      <section className="relative overflow-hidden bg-marinho-950 fundo-escuro-da-onda pb-[clamp(48px,6vw,80px)] pt-[clamp(28px,3vw,40px)] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_60%_at_80%_0%,rgba(0,107,255,0.28),transparent_70%)]" />
        <div className="conteiner relative">
          <Trilha itens={[{ rotulo: "Início", href: "/" }, { rotulo: "Combos", href: "/combos" }, { rotulo: combo.nome }]} className="mb-[clamp(28px,4vw,48px)]" />
          <div className="grid items-end gap-[clamp(28px,4vw,64px)] lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-azul-ceu">Combo · {combo.componentes.length} itens</span>
              <h1 className="mt-3 font-display text-[clamp(2.2rem,4.4vw,3.8rem)] font-extrabold leading-[1.04] tracking-[-0.04em] [text-wrap:balance]">{combo.nome}</h1>
              {descricao && <p className="mt-4 max-w-[600px] text-[17px] leading-[1.6] text-[#B4C1D3] [text-wrap:pretty]">{descricao}</p>}
            </div>

            {/* Preço e compra. */}
            <div className="flex flex-col gap-4 rounded-[20px] border border-white/10 bg-white/[0.04] p-[clamp(22px,2.4vw,30px)]">
              {economia && <span className="self-start rounded-full bg-[#E3F3EA] px-3 py-1 text-[12.5px] font-bold text-[#13774A]">{economia}</span>}
              <div>
                {combo.precoCheioEmCentavos !== null && combo.precoCheioEmCentavos > precoDoCombo(combo) && (
                  <span className="text-[15px] text-prata">
                    De <s>{emReais(combo.precoCheioEmCentavos)}</s> por
                  </span>
                )}
                <div className="font-display text-[clamp(2.4rem,4vw,3.2rem)] font-extrabold leading-none tracking-[-0.04em] [font-variant-numeric:tabular-nums]">
                  {emReais(precoDoCombo(combo))}
                </div>
              </div>
              {combo.disponivel ? (
                <Link href={`/checkout/combo/${combo.slug}`} className="btn-q btn-q-azul h-[54px] text-base">
                  Comprar combo
                </Link>
              ) : (
                <span className="rounded-xl border border-white/15 px-4 py-3 text-[14px] text-prata">
                  Este combo está indisponível agora: alguma parte dele saiu de venda.
                </span>
              )}
              <p className="text-[13px] leading-[1.5] text-[#8FA0B8]">
                O combo é pago à parte do carrinho, em uma cobrança só, no cartão ou no PIX. Não aceita cupom: o desconto já está no preço.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Onda para="claro" />

      <section className="bg-nevoa py-[clamp(48px,6vw,88px)]">
        <div className="conteiner">
          <h2 className="mb-5 font-display text-[clamp(1.6rem,2.6vw,2.1rem)] font-extrabold tracking-[-0.03em]">O que vem no combo</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {combo.componentes.map((p) => {
              const link = linkDaParte(p);
              return (
                <li key={p.tipo + p.id} className="flex items-center justify-between gap-4 rounded-2xl border border-linha bg-superficie shadow-cartao p-5">
                  <div className="min-w-0">
                    <span className="text-[11.5px] font-bold uppercase tracking-[0.1em] text-azul-forte">{rotuloDaParte(p)}</span>
                    <p className="mt-1 font-display text-[17px] font-extrabold">{p.nome}</p>
                    {!p.aVenda && <p className="mt-1 text-[13px] font-semibold text-[#B42323]">Fora de venda agora</p>}
                    {p.variacoes.length > 0 && <p className="mt-1 text-[13px] text-ardosia">Você escolhe a opção ({p.variacoes.map((v) => v.nome).join(", ")}) no pagamento.</p>}
                  </div>
                  <div className="flex flex-none flex-col items-end gap-1.5">
                    {p.precoEmCentavos !== null && (
                      <span className="text-[14px] text-ardosia [font-variant-numeric:tabular-nums]">{emReais(p.precoEmCentavos)}</span>
                    )}
                    {link && (
                      <Link href={link} className="text-[13px] font-semibold text-azul-forte hover:text-marinho-600">
                        Ver detalhes
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}
