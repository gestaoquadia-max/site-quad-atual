import Link from "next/link";
import { economiaEmTexto, precoDoCombo, rotuloDaParte, type Combo } from "@/lib/combos";
import { emReais } from "@/lib/loja";

// Cartão de um combo: nome, partes, preço cheio riscado, o que se paga e a economia. Leva à página do combo, onde se
// compra (o combo tem pagamento próprio, fora do carrinho).
export default function CartaoCombo({ combo }: { combo: Combo }) {
  const economia = economiaEmTexto(combo);
  return (
    <Link
      href={`/combos/${combo.slug}`}
      className="group relative flex h-full flex-col gap-4 rounded-[20px] border border-linha bg-white p-[clamp(20px,2vw,26px)] text-tinta shadow-[0_1px_2px_rgba(16,27,45,0.05),0_12px_28px_-22px_rgba(7,20,38,0.25)] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-[3px] hover:border-azul/45 hover:text-tinta"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex h-6 items-center rounded-full bg-azul-palido px-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-azul-forte">
          Combo · {combo.componentes.length} {combo.componentes.length === 1 ? "item" : "itens"}
        </span>
        {economia && (
          <span className="inline-flex h-6 items-center whitespace-nowrap rounded-full bg-[#E3F3EA] px-2.5 text-[11.5px] font-bold text-[#13774A]">{economia}</span>
        )}
      </div>
      <h3 className="font-display text-[21px] font-extrabold leading-[1.15] tracking-[-0.02em]">{combo.nome}</h3>
      <ul className="flex flex-col gap-2 border-t border-[#EEF2F7] pt-3.5">
        {combo.componentes.map((p) => (
          <li key={p.tipo + p.id} className="flex items-baseline justify-between gap-3 text-[14px]">
            <span className="min-w-0">
              <span className="font-semibold">{p.nome}</span>
              <span className="block text-[12.5px] text-ardosia">{rotuloDaParte(p)}</span>
            </span>
            {p.precoEmCentavos !== null && (
              <span className="whitespace-nowrap text-[13px] text-ardosia [font-variant-numeric:tabular-nums]">{emReais(p.precoEmCentavos)}</span>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-[#EEF2F7] pt-4">
        <div className="flex flex-col">
          {combo.precoCheioEmCentavos !== null && combo.precoCheioEmCentavos > precoDoCombo(combo) && (
            <s className="text-[13px] text-ardosia [font-variant-numeric:tabular-nums]">{emReais(combo.precoCheioEmCentavos)}</s>
          )}
          <span className="font-display text-[26px] font-extrabold leading-none tracking-[-0.03em] [font-variant-numeric:tabular-nums]">
            {emReais(precoDoCombo(combo))}
          </span>
        </div>
        <span className={`btn-q h-11 px-4 text-sm ${combo.disponivel ? "btn-q-azul" : "btn-q-contorno"}`}>
          {combo.disponivel ? "Ver combo" : "Indisponível"}
        </span>
      </div>
    </Link>
  );
}
