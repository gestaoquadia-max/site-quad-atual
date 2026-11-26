"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Turma } from "@/lib/data";
import type { MaterialDaBlack } from "@/lib/vitrine";
import { insigniaDaModalidade } from "@/lib/turmas";
import { SeloDaContagem, emReais } from "@/components/blackfriday/materiais/PartesDosMateriais";
import { cartoesDaBlack, vagasRestantes } from "@/components/turmas/TopoDaBlack";
import TelasDaMentoria from "@/components/blackfriday/mentorias/TelasDaMentoria";
import { INCLUSO_NA_MENTORIA, PRECO_DA_MENTORIA } from "@/lib/black/mentorias";

// O topo da Home no período da Black (prévia da designer de 26/11/2026, "Preview Site Dia 27", Início): um carrossel
// com Turmas presenciais, Mentoria e Materiais, que passa sozinho a cada 5 s (com pausa e pontos). Cada slide só entra
// com o dado real: Turmas, com turma marcada como Black e aberta; Materiais, com material ou combo da Black à venda.
// A Mentoria fica com o preço da campanha (lib/black/mentorias.ts), sem preço riscado nem parcelas
// (decisão de 26/11/2026). Fica no lugar do PrimeiroContato (app/page.tsx).

const IMG = "/images/home/black";
const INTERVALO_MS = 5000;

const INSIGNIA_FIXA: Record<string, string> = { rondesp: `${IMG}/rondesp.webp`, patamo: `${IMG}/patamo.webp`, bope: `${IMG}/bope.webp` };

// As capas do fundo do slide dos Materiais (public/images/black-friday/capas).
const CAPAS = [
  "simulado-sd-pmba",
  "modulo-cfo",
  "vade-mecum-sd-pmba",
  "simulado-cbmba",
  "modulo-pmpe",
  "modulo-cbmba",
  "simulado-pmpe",
  "simulado-cfo",
  "modulo-sdpmba",
  "simulado-pmal",
  "modulo-pmal",
  "simulado-pmpi",
  "simulado-agp-pcpe",
  "simulado-pmsp",
  "simulado-pppe",
].map((c) => `/images/black-friday/capas/${c}.webp`);

const reais = (texto: string) => Number(texto.replace(/[^\d,]/g, "").replace(",", "."));
const desconto = (por: number, de: number | null | undefined) => (de && de > por ? Math.round((1 - por / de) * 100) : null);

function Seta() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const QUADRO =
  "flex flex-col gap-2.5 rounded-3xl border-[1.5px] border-laranja bg-[rgba(12,9,7,0.92)] px-[22px] py-5 text-white shadow-[0_0_0_1px_rgba(255,140,60,0.25),0_0_40px_-4px_rgba(242,90,12,0.55),0_30px_60px_-20px_rgba(0,0,0,0.8)]";
const BOTAO =
  "btn-q h-14 rounded-[14px] bg-[linear-gradient(180deg,#FF7A2E,#E5530A)] text-[19px] text-white shadow-[0_10px_26px_-8px_rgba(242,90,12,0.8)] hover:text-white";

function CabecalhoDoQuadro({ titulo, off }: { titulo: string; off: number | null }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-display text-base font-extrabold tracking-[0.14em]">{titulo}</span>
      {off !== null && <span className="rounded-[10px] bg-laranja px-3 py-1.5 font-display text-lg font-extrabold">-{off}%</span>}
    </div>
  );
}

function RodapeDoQuadro() {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-[#2E241E] pt-3 text-[15px] text-[#D6CCC5]">
      <span>Preço válido até 30/11</span>
      <SeloDaContagem />
    </div>
  );
}

function Itens({ itens }: { itens: string[] }) {
  return (
    <ul className="flex flex-col gap-3.5">
      {itens.map((t) => (
        <li key={t} className="flex items-center gap-3.5 text-[clamp(16px,1.5vw,19px)] text-[#F3EEEA]">
          <span
            aria-hidden="true"
            className="grid h-7 w-7 flex-none place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#FFB27A,#F25A0C_60%,#B23E06)] text-[15px] font-extrabold text-white shadow-[0_0_12px_rgba(255,110,20,0.7)]"
          >
            ✓
          </span>
          {t}
        </li>
      ))}
    </ul>
  );
}

function Titulo({ antes, destaque }: { antes: string; destaque: string }) {
  return (
    <h2 className="font-display text-[clamp(2.2rem,3.6vw,3.25rem)] font-extrabold leading-none tracking-[-0.04em] text-white [text-shadow:0_4px_18px_rgba(0,0,0,0.6)] [text-wrap:balance]">
      {antes} <span className="bg-[linear-gradient(180deg,#FF7A2E,#FF6A1A)] bg-clip-text text-transparent [text-shadow:none]">{destaque}</span>
    </h2>
  );
}

// ---------- Turmas ----------

function SlideDasTurmas({ turmas, todas }: { turmas: Turma[]; todas: Turma[] | null }) {
  const cartoes = cartoesDaBlack(turmas, todas).filter((c) => c.turmas.some((t) => t.status === "aberta"));
  const [escolhida, setEscolhida] = useState(0);
  const c = cartoes[Math.min(escolhida, cartoes.length - 1)];
  const ref = c.turmas.find((t) => t.status === "aberta") ?? c.turmas[0];
  const preco = ref.preco === "Consulte" ? null : ref.preco;
  const off = preco ? desconto(reais(preco), ref.precoCheio ? reais(ref.precoCheio) : null) : null;
  const insignia = (id: string) => INSIGNIA_FIXA[id] ?? insigniaDaModalidade(todas, id);
  return (
    <>
      <Conteudo
        meio={
          <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[520px] -translate-x-1/2 -translate-y-[40%] scale-[.8]">
            <span className="absolute left-1/2 top-[300px] h-11 w-[300px] -translate-x-1/2 rounded-[50%] border-2 border-[rgba(255,140,60,0.95)] shadow-[0_0_24px_4px_rgba(255,110,20,0.8),inset_0_0_18px_rgba(255,110,20,0.6)]" />
            {cartoes.map((x, i) => {
              const centro = x.id === c.id;
              const lado = cartoes.filter((y) => y.id !== c.id).indexOf(x);
              const tf = centro
                ? "translateX(-50%) translateY(10px) scale(1.12)"
                : lado === 0
                  ? "translateX(-50%) translateX(-160px) translateY(60px) rotateY(32deg) scale(.72)"
                  : "translateX(-50%) translateX(160px) translateY(60px) rotateY(-32deg) scale(.72)";
              const src = insignia(x.id);
              return src ? (
                <Image
                  key={x.id}
                  src={src}
                  alt=""
                  width={260}
                  height={260}
                  priority={i === 0}
                  className="absolute left-1/2 top-0 h-[260px] w-[260px] object-contain transition-[transform,filter] duration-[450ms]"
                  style={{
                    transform: tf,
                    zIndex: centro ? 3 : 1,
                    filter: centro
                      ? "drop-shadow(0 0 28px rgba(255,110,20,.75)) drop-shadow(0 24px 30px rgba(0,0,0,.6))"
                      : "brightness(.8) drop-shadow(0 20px 26px rgba(0,0,0,.7))",
                  }}
                />
              ) : null;
            })}
          </div>
        }
        esquerda={
          <>
            <Titulo antes="Últimas vagas nas turmas" destaque="presenciais" />
            <Itens itens={["Aulas presenciais em Feira de Santana", "Vagas promocionais limitadas"]} />
          </>
        }
        quadro={
          <div className={QUADRO}>
            <CabecalhoDoQuadro titulo="ESCOLHA SUA TURMA" off={off} />
            <div className="flex flex-col gap-2" role="group" aria-label="Modalidades com vagas da Black">
              {cartoes.map((x, i) => {
                const restam = x.turmas.map(vagasRestantes);
                const soma = restam.every((v) => v !== null) ? restam.reduce<number>((s, v) => s + (v ?? 0), 0) : null;
                const ligada = x.id === c.id;
                const src = insignia(x.id);
                return (
                  <button
                    key={x.id}
                    type="button"
                    aria-pressed={ligada}
                    onClick={() => setEscolhida(i)}
                    className={`flex items-center gap-3.5 rounded-[14px] border-[1.5px] px-3.5 py-[7px] text-left font-display text-white transition-colors ${
                      ligada ? "border-laranja bg-laranja/[0.15] shadow-[0_0_18px_-2px_rgba(242,90,12,0.6)]" : "border-[#3A2E27] hover:border-[#5A4536]"
                    }`}
                  >
                    {src ? <Image src={src} alt="" width={40} height={40} className="h-10 w-10 object-contain" /> : <span className="h-10 w-10" />}
                    <b className="flex-1 text-lg">{x.nome}</b>
                    {soma !== null && (
                      <>
                        <span aria-hidden="true" className="h-6 w-px bg-[#3A2E27]" />
                        <span className="min-w-[80px] text-right text-base font-extrabold text-[#FF7A2E]">restam {soma}</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="my-1 flex flex-col items-center">
              {preco && ref.precoCheio && <s className="text-xl text-[#A39790]">{ref.precoCheio}</s>}
              <span className="whitespace-nowrap font-display text-[clamp(52px,5vw,68px)] font-extrabold leading-none tracking-[-0.045em]">
                {preco ?? "A confirmar"}
              </span>
            </div>
            <Link href={`/turmas?m=${c.id}`} className={BOTAO}>
              Garantir vaga na {c.nome} <Seta />
            </Link>
            <RodapeDoQuadro />
          </div>
        }
      />
    </>
  );
}

// ---------- Mentoria ----------

function SlideDaMentoria() {
  return (
    <>
      <Conteudo
        meio={<TelasDaMentoria className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[44%] scale-[.8]" />}
        esquerda={
          <>
            <Titulo antes="Mentoria com acompanhamento de" destaque="12 meses" />
            <Itens itens={INCLUSO_NA_MENTORIA} />
          </>
        }
        quadro={
          <div className={QUADRO}>
            <CabecalhoDoQuadro titulo="MENTORIA · 12 MESES" off={null} />
            <div className="mb-1.5 mt-3.5 flex flex-col items-center">
              <span className="whitespace-nowrap font-display text-[clamp(56px,5.4vw,72px)] font-extrabold leading-none tracking-[-0.045em]">
                {PRECO_DA_MENTORIA}
              </span>
            </div>
            <Link href="/mentorias?escolher=1" className={BOTAO}>
              Garantir minha mentoria <Seta />
            </Link>
            <RodapeDoQuadro />
          </div>
        }
      />
    </>
  );
}

// ---------- Materiais ----------

function SlideDosMateriais({ materiais }: { materiais: MaterialDaBlack[] }) {
  const maisBarato = [...materiais].sort((a, b) => a.preco - b.preco)[0];
  const off = desconto(maisBarato.preco, maisBarato.precoCheio);
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-12%] top-[-40%] z-[1] hidden h-[180%] w-[78%] lg:block"
        style={{
          maskImage: "linear-gradient(90deg,transparent 0%,#000 40%),linear-gradient(180deg,#000 55%,transparent 76%)",
          maskComposite: "intersect",
          WebkitMaskImage: "linear-gradient(90deg,transparent 0%,#000 40%),linear-gradient(180deg,#000 55%,transparent 76%)",
          WebkitMaskComposite: "source-in",
        }}
      >
        <div className="absolute inset-0 grid -rotate-[14deg] skew-x-[-6deg] grid-cols-5 content-center gap-x-3.5 opacity-95">
          {CAPAS.map((src, i) => (
            <Image
              key={i}
              src={src}
              alt=""
              width={180}
              height={255}
              sizes="180px"
              className="aspect-[707/1000] w-full rounded object-cover shadow-[0_16px_30px_-10px_rgba(0,0,0,0.8)]"
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_60%_50%,rgba(242,90,12,0.25),rgba(18,15,13,0.35)_70%)]" />
      </div>
      <Conteudo
        esquerda={
          <>
            <Titulo antes="Simulados, módulos e" destaque="Vade Mecum" />
            <Itens itens={["Simulados no padrão da banca", "Módulos e Vade Mecum do edital", "Acesso imediato após a compra"]} />
          </>
        }
        quadro={
          <div className={QUADRO}>
            <CabecalhoDoQuadro titulo="MATERIAIS" off={off} />
            <div className="mb-1.5 mt-3.5 flex flex-col items-center">
              <span className="text-xl text-[#A39790]">
                {maisBarato.precoCheio && maisBarato.precoCheio > maisBarato.preco && <s>{emReais(maisBarato.precoCheio)}</s>} a partir de
              </span>
              <span className="whitespace-nowrap font-display text-[clamp(56px,5.4vw,72px)] font-extrabold leading-none tracking-[-0.045em]">
                {emReais(maisBarato.preco)}
              </span>
              <span className="mt-1.5 text-base text-[#D6CCC5]">Acesso imediato · pagamento único</span>
            </div>
            <Link href="/produtos" className={BOTAO}>
              Ver materiais <Seta />
            </Link>
            <RodapeDoQuadro />
          </div>
        }
      />
    </>
  );
}

// O texto à esquerda, a ilustração no meio (só no computador, numa coluna própria, para nunca encostar no texto nem no
// quadro) e o quadro da oferta à direita. No celular, o texto e o quadro, um embaixo do outro.
function Conteudo({ esquerda, meio, quadro }: { esquerda: React.ReactNode; meio?: React.ReactNode; quadro: React.ReactNode }) {
  return (
    <div className="conteiner relative z-[4] grid h-full items-center gap-10 pb-12 pt-[clamp(56px,6vw,88px)] lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,400px)_minmax(0,1fr)_400px] xl:gap-8">
      <div className="flex max-w-[400px] flex-col gap-[26px]">{esquerda}</div>
      <div className="relative hidden h-[440px] xl:block">{meio}</div>
      <div className="w-full max-w-[420px] lg:max-w-none">{quadro}</div>
    </div>
  );
}

export default function CarrosselDaBlack({ turmas, materiais }: { turmas: Turma[] | null; materiais: MaterialDaBlack[] | null }) {
  const daBlack = (turmas ?? []).filter((t) => t.black && !t.isolada);
  const comTurma = daBlack.some((t) => t.status === "aberta");
  const aVenda = (materiais ?? []).filter((m) => m.aVenda && m.preco > 0);
  // A ordem da designer: Mentoria, Turmas, Materiais.
  const slides = [
    { id: "mentoria", nome: "Mentoria", el: <SlideDaMentoria /> },
    comTurma && { id: "turmas", nome: "Turmas presenciais", el: <SlideDasTurmas turmas={daBlack} todas={turmas} /> },
    aVenda.length > 0 && { id: "materiais", nome: "Materiais", el: <SlideDosMateriais materiais={aVenda} /> },
  ].filter((s): s is { id: string; nome: string; el: React.ReactElement } => Boolean(s));

  const [atual, setAtual] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [emUso, setEmUso] = useState(false);
  const total = slides.length;

  useEffect(() => {
    if (pausado || emUso || total < 2) return;
    const t = setInterval(() => {
      if (document.visibilityState !== "hidden") setAtual((a) => (a + 1) % total);
    }, INTERVALO_MS);
    return () => clearInterval(t);
  }, [pausado, emUso, total]);

  const slide = slides[atual % total];

  return (
    <section
      aria-roledescription="carrossel"
      aria-label="Ofertas da Black Friday"
      className="relative overflow-hidden bg-[radial-gradient(520px_560px_at_0%_560px,rgba(255,110,20,0.75),rgba(242,90,12,0.25)_45%,transparent_75%),radial-gradient(520px_380px_at_100%_0%,rgba(255,122,46,0.4),transparent_70%),linear-gradient(180deg,#1A0F0A_0,#120F0D_560px)] text-[#F3EEEA]"
      onMouseEnter={() => setEmUso(true)}
      onMouseLeave={() => setEmUso(false)}
      onFocus={() => setEmUso(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setEmUso(false);
      }}
    >
      <div className="relative min-h-[640px] bg-[radial-gradient(36%_55%_at_50%_32%,rgba(255,110,20,0.5),transparent_70%)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-80 blur-[6px]"
          style={{
            background:
              "linear-gradient(118deg,transparent 4%,rgba(255,122,46,.28) 6.5%,transparent 9%),linear-gradient(118deg,transparent 8.5%,rgba(255,122,46,.12) 10%,transparent 11.5%),linear-gradient(118deg,transparent 88%,rgba(255,122,46,.24) 90.5%,transparent 93%),linear-gradient(118deg,transparent 92.5%,rgba(255,122,46,.1) 94%,transparent 95.5%)",
          }}
        />
        <div
          key={slide.id}
          role="group"
          aria-roledescription="slide"
          aria-label={`${(atual % total) + 1} de ${total}: ${slide.nome}`}
          className="animate-[q-surgir_300ms_ease_both]"
        >
          {slide.el}
        </div>
        {total > 1 && (
          <div className="conteiner relative z-[5] flex items-center gap-3 pb-7 lg:absolute lg:inset-x-0 lg:bottom-7 lg:pb-0">
            <button
              type="button"
              onClick={() => setPausado((p) => !p)}
              aria-label={pausado ? "Continuar o carrossel" : "Pausar o carrossel"}
              className="grid h-[30px] w-[30px] place-items-center rounded-full bg-[#1C1714] text-[11px] text-white ring-1 ring-white/15 hover:ring-laranja"
            >
              {pausado ? "▶" : "❚❚"}
            </button>
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Ir para ${s.nome}`}
                aria-current={i === atual % total}
                onClick={() => setAtual(i)}
                className={`h-1.5 rounded-full transition-all ${i === atual % total ? "w-10 bg-laranja" : "w-3.5 bg-[#5A4A40] hover:bg-[#7A6A60]"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
