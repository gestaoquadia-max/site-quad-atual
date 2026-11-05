"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Professor } from "@/lib/data";
import { getIniciais } from "@/lib/format";
import Reveal from "@/components/Reveal";
import { SetaDoLink } from "@/components/Trilho";

// Painéis à vista no computador; o destacado se abre e mostra tudo.
const NO_COMPUTADOR = 4;
const SEGUNDOS_POR_PROFESSOR = 5;

// "Bruno Araújo Agostinho" → "Bruno" em cima e "ARAÚJO AGOSTINHO" grande embaixo.
function partesDoNome(nome: string) {
  const [primeiro, ...resto] = nome.trim().split(/\s+/);
  return { primeiro: resto.length ? primeiro : "", sobrenome: resto.length ? resto.join(" ") : primeiro };
}

function numero(i: number) {
  return String(i + 1).padStart(2, "0");
}

// Fundo do painel: as iniciais gigantes, só no contorno, sobre uma grade fina. A foto do cadastro é um recorte sem
// fundo (PNG transparente; hoje 512 × 512, a original é 1080 × 1350): fica inteira, "em pé" na base do painel, na frente das iniciais, como um pôster.
function Fundo({ professor }: { professor: Professor }) {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-[radial-gradient(90%_70%_at_80%_10%,#1E5BD8_0%,#0B2A55_45%,#060F1E_100%)]">
      <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(80%_70%_at_70%_20%,#000,transparent)]" />
      <span className="absolute -right-[4%] top-[2%] select-none font-display text-[clamp(180px,22vw,320px)] font-extrabold leading-none tracking-[-0.06em] text-transparent [-webkit-text-stroke:1.5px_rgba(111,174,255,0.45)]">
        {getIniciais(professor.nome)}
      </span>
      {/* Altura fixa (88% do painel, que vai até 580 px) e a foto ajustada pela altura: a quadrada antiga (512 × 512)
          fica no tamanho do arquivo, sem esticar, e a original 4:5 (aceita pela API desde o PR #139) cabe inteira. */}
      {professor.fotoUrl && (
        <div className="absolute inset-x-0 bottom-0 h-[88%]">
          <Image src={professor.fotoUrl} alt="" fill unoptimized className="object-contain object-bottom" />
        </div>
      )}
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(5,14,28,0.92)_6%,rgba(5,14,28,0.55)_26%,rgba(5,14,28,0)_50%)]" />
    </div>
  );
}

// O conteúdo do painel aberto: número, matéria na vertical, nome em duas linhas e o convite.
function Aberto({ professor, indice, total }: { professor: Professor; indice: number; total: number }) {
  const { primeiro, sobrenome } = partesDoNome(professor.nome);
  return (
    <>
      <span className="absolute left-6 top-6 font-display text-[15px] font-bold tracking-[0.08em] text-white/70 [font-variant-numeric:tabular-nums]">
        <span className="text-white">{numero(indice)}</span> / {String(total).padStart(2, "0")}
      </span>
      {professor.materia && (
        <span className="absolute right-5 top-6 flex items-center gap-3 text-[12px] font-bold uppercase tracking-[0.32em] text-azul-ceu [writing-mode:vertical-rl]">
          {professor.materia}
          <span aria-hidden="true" className="block h-16 w-px bg-azul-ceu/60" />
        </span>
      )}
      <div className="absolute inset-x-6 bottom-6 pr-10">
        {primeiro && <span className="block font-display text-[clamp(18px,1.6vw,24px)] font-semibold tracking-[-0.01em] text-white/85">{primeiro}</span>}
        <span className="mt-0.5 block font-display text-[clamp(30px,3.4vw,52px)] font-extrabold uppercase leading-[0.92] tracking-[-0.035em] text-white [overflow-wrap:anywhere]">{sobrenome}</span>
        <span className="mt-5 inline-flex items-center gap-2 border-b border-white/30 pb-1 text-[14px] font-semibold text-white transition-colors group-hover:border-azul-ceu group-hover:text-azul-ceu">
          Ver perfil <SetaDoLink />
        </span>
      </div>
    </>
  );
}

// Professores na Home: painéis grandes que se abrem como sanfona (computador) e cartões altos que se arrastam (celular).
// Avança sozinho a cada 5 s no computador; para ao passar o mouse, ao focar e pelo botão (WCAG 2.2.2).
// Sem minibio: ela fica na página do professor.
export default function ProfessoresEmDestaque({ professores }: { professores: Professor[] }) {
  const total = professores.length;
  const visiveis = Math.min(NO_COMPUTADOR, total);
  // inicio: o primeiro professor à vista; ativo: a posição do painel aberto (0 a visiveis - 1).
  const [{ inicio, ativo }, setVista] = useState({ inicio: 0, ativo: 0 });
  const [pausado, setPausado] = useState(false);
  const [emFoco, setEmFoco] = useState(false);

  const janela = Array.from({ length: visiveis }, (_, i) => (inicio + i) % total);

  function andar(passo: 1 | -1) {
    setVista((v) => ({ ...v, inicio: (v.inicio + passo + total) % total }));
  }

  function abrir(posicao: number) {
    setVista((v) => ({ ...v, ativo: posicao }));
  }

  useEffect(() => {
    if (pausado || emFoco || total < 2) return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      // Abre o próximo painel; depois do último, passa para os próximos professores.
      setVista((v) => (v.ativo < visiveis - 1 ? { ...v, ativo: v.ativo + 1 } : { inicio: (v.inicio + visiveis) % total, ativo: 0 }));
    }, SEGUNDOS_POR_PROFESSOR * 1000);
    return () => window.clearInterval(id);
  }, [pausado, emFoco, total, visiveis]);

  const setas = "grid size-11 place-items-center rounded-full border border-white/20 text-white transition-colors hover:border-azul-ceu hover:bg-azul/[0.12]";

  return (
    <section id="professores" className="secao relative overflow-hidden bg-marinho-950 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_55%_at_0%_0%,rgba(0,107,255,0.18),transparent_70%)]" />
      <div className="conteiner relative">
        <Reveal className="mb-[clamp(28px,3.4vw,44px)] flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-azul-ceu">Corpo docente · {total} professores</span>
            <h2 className="titulo-secao mt-2">Conheça nossos professores</h2>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/professores" className="mr-2 inline-flex min-h-[44px] items-center gap-2 font-display text-[15px] font-bold text-azul-ceu hover:text-white">
              Ver todos os professores <SetaDoLink />
            </Link>
            <div className="hidden items-center gap-2.5 lg:flex">
              <button type="button" onClick={() => setPausado((p) => !p)} aria-pressed={pausado} aria-label={pausado ? "Continuar a passagem" : "Pausar a passagem"} className={setas}>
                <span aria-hidden="true" className="text-[12px]">{pausado ? "▶" : "❚❚"}</span>
              </button>
              <button type="button" onClick={() => andar(-1)} aria-label="Professor anterior" className={setas}>
                <span aria-hidden="true" className="rotate-180"><SetaDoLink /></span>
              </button>
              <button type="button" onClick={() => andar(1)} aria-label="Próximo professor" className={setas}>
                <SetaDoLink />
              </button>
            </div>
          </div>
        </Reveal>

        {/* Computador: sanfona de painéis. */}
        <div
          className="hidden h-[clamp(460px,40vw,580px)] gap-3 lg:flex"
          onMouseEnter={() => setEmFoco(true)}
          onMouseLeave={() => setEmFoco(false)}
          onFocus={() => setEmFoco(true)}
          onBlur={() => setEmFoco(false)}
        >
          {janela.map((indice, posicao) => {
            const p = professores[indice];
            const aberto = posicao === ativo;
            const { sobrenome } = partesDoNome(p.nome);
            return (
              <Link
                key={p.slug}
                href={`/professores/${p.slug}`}
                onMouseEnter={() => abrir(posicao)}
                onFocus={() => abrir(posicao)}
                aria-label={`${p.nome}${p.materia ? `, ${p.materia}` : ""}`}
                className={`group relative min-w-0 overflow-hidden rounded-[22px] border text-white shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] transition-[flex-grow,border-color] duration-[650ms] ease-[cubic-bezier(.2,.8,.2,1)] hover:text-white ${aberto ? "flex-[4.2] border-[rgba(111,174,255,0.45)]" : "flex-1 border-white/[0.08]"}`}
              >
                <Fundo professor={p} />
                <div className={`absolute inset-0 transition-opacity duration-300 ${aberto ? "opacity-100 delay-300" : "pointer-events-none opacity-0"}`}>
                  <Aberto professor={p} indice={indice} total={total} />
                </div>
                <div aria-hidden="true" className={`absolute inset-0 transition-opacity duration-300 ${aberto ? "opacity-0" : "opacity-100 delay-200"}`}>
                  <span className="absolute left-1/2 top-5 -translate-x-1/2 font-display text-[13px] font-bold text-white/60">{numero(indice)}</span>
                  <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rotate-180 whitespace-nowrap font-display text-[20px] font-extrabold uppercase tracking-[0.02em] text-white [writing-mode:vertical-rl]">
                    {sobrenome}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Pontos de progresso: em que parte da lista a sanfona está. */}
        <div aria-hidden="true" className="mt-5 hidden h-[3px] overflow-hidden rounded-full bg-white/10 lg:block">
          <div className="h-full rounded-full bg-azul-ceu transition-[width] duration-500" style={{ width: `${(((inicio + ativo) % total) + 1) / total * 100}%` }} />
        </div>
      </div>

      {/* Celular e tablet: cartões altos, já abertos, que se arrastam para o lado. */}
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-[max(16px,calc((100vw-1200px)/2))] pb-2 [scrollbar-width:none] lg:hidden">
        {professores.map((p, i) => (
          <Link
            key={p.slug}
            href={`/professores/${p.slug}`}
            aria-label={`${p.nome}${p.materia ? `, ${p.materia}` : ""}`}
            className="group relative aspect-[3/4] w-[78%] max-w-[360px] flex-none snap-center overflow-hidden rounded-[22px] border border-white/[0.1] text-white hover:text-white sm:w-[46%]"
          >
            <Fundo professor={p} />
            <Aberto professor={p} indice={i} total={total} />
          </Link>
        ))}
      </div>
    </section>
  );
}
