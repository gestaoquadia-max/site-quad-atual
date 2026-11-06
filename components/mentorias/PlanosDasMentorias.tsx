"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { CONCURSOS_DAS_MENTORIAS, mentorias, type PlanoDaMentoria } from "@/lib/conteudo";

const [mentoria, mentoriaMais, combo] = mentorias;

function Duracao({ numero, escuro = false }: { numero: string; escuro?: boolean }) {
  return (
    <span className="flex items-baseline gap-2 whitespace-nowrap">
      <span className={`font-display text-[44px] font-extrabold leading-none tracking-[-0.04em] ${escuro ? "" : "text-vinho"}`}>{numero}</span>
      <span className={`text-sm font-semibold ${escuro ? "text-[#D6CFDD]" : "text-ardosia"}`}>meses de acesso</span>
    </span>
  );
}

// Escolha das mentorias em dois passos (31/10/2026), como a página de turmas: primeiro o concurso, com o brasão;
// depois o plano, cujo botão leva ao checkout daquele concurso na Tutory (CONCURSOS_DAS_MENTORIAS).
// Sem concurso escolhido, os botões dos planos levam de volta à escolha.
export default function PlanosDasMentorias() {
  const [escolhido, setEscolhido] = useState<string | null>(null);
  const escolha = useRef<HTMLDivElement>(null);
  const concurso = CONCURSOS_DAS_MENTORIAS.find((c) => c.id === escolhido) ?? null;

  function voltarParaAEscolha() {
    escolha.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    (escolha.current?.querySelector("button") as HTMLButtonElement | null)?.focus({ preventScroll: true });
  }

  // O botão de um plano: com o concurso, o link do checkout; sem ele, a volta para a escolha.
  function botaoDoPlano(plano: PlanoDaMentoria, rotulo: string, className: string) {
    if (!concurso) {
      return (
        <button type="button" onClick={voltarParaAEscolha} className={className}>
          Escolha o concurso acima
        </button>
      );
    }
    return (
      <a href={concurso.checkout[plano]} target="_blank" rel="noopener" className={className}>
        {rotulo}
        <span className="sr-only"> para {concurso.titulo} (abre o checkout em nova aba)</span>
      </a>
    );
  }

  return (
    <section id="planos" className="scroll-mt-[110px] bg-nevoa py-[clamp(64px,8vw,120px)] text-tinta">
      <div className="conteiner">
        <h2 className="font-display text-[clamp(2rem,3.6vw,3rem)] font-extrabold tracking-[-0.035em]">Escolha sua mentoria</h2>

        {/* Passo 1: o concurso. */}
        <div ref={escolha} className="mt-[clamp(24px,3vw,36px)]">
          <h3 id="mentoria-concurso" className="mb-3.5 flex items-center gap-2.5 font-display text-lg font-extrabold">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-vinho text-sm text-white">1</span>
            Para qual concurso você vai se preparar?
          </h3>
          <div role="group" aria-labelledby="mentoria-concurso" className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,210px),1fr))] gap-2.5">
            {CONCURSOS_DAS_MENTORIAS.map((c) => {
              const ligado = escolhido === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={ligado}
                  onClick={() => setEscolhido(c.id)}
                  className={`flex min-h-[76px] items-center gap-3 rounded-[14px] border bg-superficie px-3.5 py-3 text-left shadow-cartao transition-[border-color,box-shadow] ${
                    ligado ? "border-vinho shadow-[0_0_0_3px_rgba(142,27,46,0.16)]" : "border-linha-forte hover:border-vinho/60"
                  }`}
                >
                  <Image src={c.brasao} alt="" width={48} height={48} className="h-12 w-12 flex-none object-contain" />
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="font-display text-[16px] font-extrabold leading-tight">{c.titulo}</span>
                    <span className="text-[12.5px] leading-snug text-ardosia">{c.subtitulo}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Passo 2: o plano. */}
        <h3 className="mb-3.5 mt-[clamp(32px,4vw,48px)] flex items-center gap-2.5 font-display text-lg font-extrabold">
          <span className={`grid h-7 w-7 place-items-center rounded-full text-sm text-white ${concurso ? "bg-vinho" : "bg-linha-forte"}`}>2</span>
          Escolha o plano{concurso ? ` para ${concurso.titulo}` : ""}
        </h3>
        <div className="grid items-stretch gap-[clamp(16px,2vw,28px)] lg:grid-cols-2">
          <article className="relative flex flex-col gap-[22px] overflow-hidden rounded-3xl border border-linha-forte bg-superficie p-[clamp(26px,3vw,44px)] shadow-cartao-alto">
            {/* Faixa vinho no alto: o cartão claro se separa do fundo, que é da mesma família de cor. */}
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#8E1B2E,#E0425C)]" />
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h4 className="font-display text-[clamp(2.2rem,3.4vw,3rem)] font-extrabold leading-none tracking-[-0.04em]">{mentoria.nome}</h4>
              <Duracao numero="12" />
            </div>
            <p className="text-[16.5px] leading-[1.6] text-ardosia-escura [text-wrap:pretty]">{mentoria.descricao}</p>
            <ul className="flex flex-col border-t border-linha">
              {mentoria.recursos.map((r) => (
                <li key={r} className="flex items-center gap-3 border-b border-linha py-[13px] text-[15.5px]">
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="flex-none text-vinho">
                    <path d="M3 8.5l3.2 3L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {r}
                </li>
              ))}
            </ul>
            {botaoDoPlano(
              "mentoria",
              "Quero a Mentoria",
              "mt-auto inline-flex h-[54px] items-center justify-center rounded-[11px] border-[1.5px] border-vinho font-display text-base font-bold text-vinho transition-colors hover:bg-vinho hover:text-white",
            )}
          </article>

          <article className="relative flex flex-col gap-[22px] overflow-hidden rounded-3xl border border-[#5A2A35] bg-[#140A0E] p-[clamp(26px,3vw,44px)] text-white shadow-[0_40px_80px_-40px_rgba(20,10,14,0.9)]">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_100%_0%,rgba(142,27,46,0.55),transparent_70%)]" />
            <div className="relative flex flex-wrap items-end justify-between gap-4">
              <h4 className="font-display text-[clamp(2.2rem,3.4vw,3rem)] font-extrabold leading-none tracking-[-0.04em]">
                Mentoria<span className="text-[#E0425C]">+</span>
              </h4>
              <Duracao numero="3" escuro />
            </div>
            <p className="relative text-[16.5px] leading-[1.6] text-[#E2DAE4] [text-wrap:pretty]">{mentoriaMais.descricao}</p>
            <ul className="relative flex flex-col border-t border-white/10">
              {mentoriaMais.recursos.map((r) => (
                <li key={r} className="flex items-center gap-3 border-b border-white/10 py-[13px] text-[15.5px]">
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="flex-none text-[#F07A8E]">
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  {r}
                </li>
              ))}
            </ul>
            <p className="relative rounded-xl border border-[rgba(240,122,142,0.25)] bg-[rgba(142,27,46,0.22)] px-4 py-3.5 text-sm leading-[1.5] text-[#F3E6EA]">
              Contratada isoladamente, a Mentoria+ inclui toda a estrutura da Mentoria, e todo o acesso dura 3 meses.
            </p>
            {botaoDoPlano(
              "plus",
              "Quero a Mentoria+",
              "relative mt-auto inline-flex h-[54px] items-center justify-center rounded-[11px] bg-vinho font-display text-base font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] transition-colors hover:bg-vinho-forte hover:text-white",
            )}
          </article>
        </div>

        <div className="mt-[clamp(16px,2vw,28px)] flex flex-wrap items-center justify-between gap-x-12 gap-y-6 rounded-3xl bg-[linear-gradient(100deg,#22080F_0%,#3A0E1A_55%,#5A1424_100%)] px-[clamp(26px,3vw,44px)] py-[clamp(24px,3vw,36px)] text-white">
          <div className="flex flex-[1_1_460px] flex-col gap-2">
            <h4 className="font-display text-[clamp(1.5rem,2.4vw,2rem)] font-extrabold tracking-[-0.03em]">Quer o melhor dos dois planos?</h4>
            <p className="max-w-[640px] text-base leading-[1.55] text-[#D6CFDD] [text-wrap:pretty]">
              <strong className="font-bold text-white">{combo.descricao}</strong> O aluno mantém a estrutura da Mentoria por um ano, com acompanhamento premium durante três meses.
            </p>
          </div>
          {botaoDoPlano(
            "combo",
            "Quero o Combo",
            "inline-flex h-[54px] flex-none items-center whitespace-nowrap rounded-[11px] bg-superficie px-[26px] font-display text-base font-bold text-vinho transition-transform hover:-translate-y-0.5 hover:text-vinho",
          )}
        </div>
        <p className="mt-4 text-[13px] text-ardosia">Valores e condições de pagamento aparecem no checkout de cada plano, na Tutory.</p>
      </div>
    </section>
  );
}
