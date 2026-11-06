import Link from "next/link";
import type { Combo } from "@/lib/combos";
import CartaoCombo from "./CartaoCombo";

// Os combos com alguma parte da área (Turmas, Materiais, Loja, Eventos), no fim da página dela. Sem combos, nada aparece.
export default function SecaoDeCombos({ combos, titulo, descricao, fundo = "nevoa" }: { combos: Combo[]; titulo: string; descricao: string; fundo?: "nevoa" | "branco" }) {
  if (combos.length === 0) return null;
  return (
    <section className={`${fundo === "branco" ? "bg-nevoa-clara" : "bg-nevoa"} py-[clamp(56px,7vw,96px)]`}>
      <div className="conteiner">
        <div className="mb-[clamp(24px,3vw,36px)] flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-azul-forte">Combos</span>
            <h2 className="mt-1.5 font-display text-[clamp(1.8rem,3.2vw,2.6rem)] font-extrabold tracking-[-0.035em]">{titulo}</h2>
            <p className="mt-2 max-w-[620px] text-[15.5px] leading-[1.55] text-ardosia [text-wrap:pretty]">{descricao}</p>
          </div>
          <Link href="/combos" className="inline-flex min-h-[44px] items-center gap-2 font-display text-[15px] font-bold text-azul-forte hover:text-marinho-600">
            Ver todos os combos →
          </Link>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-[clamp(16px,1.6vw,24px)]">
          {combos.map((c) => (
            <CartaoCombo key={c.id} combo={c} />
          ))}
        </div>
      </div>
    </section>
  );
}
