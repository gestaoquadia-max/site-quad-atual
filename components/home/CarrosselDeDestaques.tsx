"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { Banner } from "@/lib/conteudo";

const INTERVALO_MS = 6000;

function SetaDoBotao() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Botão do banner: a cor vem do cadastro (azul por padrão; vinho nas Mentorias).
function BotaoDoBanner({ banner, largo = false }: { banner: Banner; largo?: boolean }) {
  const cor = banner.botao.cor ?? "#006BFF";
  const estilo = {
    "--cor": cor,
    background: cor,
    color: banner.botao.corTexto ?? "#FFFFFF",
    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.22),0 1px 2px rgba(0,0,0,0.3),0 16px 36px -14px ${cor}`,
  } as CSSProperties;
  return (
    <Link
      href={banner.botao.link}
      style={estilo}
      className={`pointer-events-auto inline-flex h-14 items-center justify-center gap-2.5 whitespace-nowrap rounded-[10px] px-7 font-display text-base font-bold transition-[filter,transform] duration-150 hover:-translate-y-0.5 hover:brightness-90 active:translate-y-0 active:brightness-75 focus-visible:shadow-[0_0_0_3px_#071426,0_0_0_5px_var(--cor)] ${largo ? "w-full" : ""}`}
    >
      {banner.botao.texto}
      <SetaDoBotao />
    </Link>
  );
}

const TITULO_PRINCIPAL = (
  <>
    Sua aprovação começa com a{" "}
    <em className="bg-[linear-gradient(100deg,#7DB8FF_0%,#2F86FF_45%,#1F5BFF_100%)] bg-clip-text not-italic text-transparent [filter:drop-shadow(0_6px_24px_rgba(0,107,255,0.35))]">
      preparação certa
    </em>
  </>
);

const MASCARA_DA_FOTO = "linear-gradient(180deg,#000 72%,transparent 98%)";

// Composição institucional: Danilo, "+800 aprovados" e a chamada principal. Uma versão para o computador e outra para o celular.
function SlideDanilo({ banner, primeiro }: { banner: Banner; primeiro: boolean }) {
  return (
    <>
      {/* Computador */}
      <div className="absolute inset-0 hidden min-[1000px]:block">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(42%_65%_at_74%_40%,rgba(0,107,255,0.42),transparent_70%),radial-gradient(28%_45%_at_22%_55%,rgba(20,74,255,0.16),transparent_70%),radial-gradient(60%_40%_at_70%_110%,rgba(0,107,255,0.30),transparent_70%),linear-gradient(180deg,#071426_0%,#081830_100%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_60%_40%,transparent_55%,rgba(3,9,18,0.65)_100%)]" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:64px_64px]"
          style={{ maskImage: "radial-gradient(55% 70% at 70% 45%, #000 0%, transparent 75%)", WebkitMaskImage: "radial-gradient(55% 70% at 70% 45%, #000 0%, transparent 75%)" }}
        />
        <div className="conteiner relative grid h-full grid-cols-2 grid-rows-[100%] gap-x-10">
          <div className="flex min-h-0 flex-col items-start justify-center pb-24 pt-6">
            <h1 className="mb-6 font-display text-[clamp(2.4rem,4.4vw,4.9rem)] font-extrabold leading-none tracking-[-0.04em] [text-wrap:balance]">{TITULO_PRINCIPAL}</h1>
            <p className="mb-9 max-w-[470px] text-[clamp(16px,1.5vw,18.5px)] leading-[1.6] text-[#B4C1D3] [text-wrap:pretty]">
              Cursos presenciais, materiais e treinamento direto ao ponto para quem quer entrar nas forças de segurança.
            </p>
            <BotaoDoBanner banner={banner} />
          </div>
          <div className="relative flex h-[calc(100%-24px)] items-end justify-center self-end">
            <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[36%] h-[92%] w-[min(118%,720px)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(47,134,255,0.44),rgba(0,107,255,0.18)_45%,rgba(0,107,255,0.05)_72%,transparent_100%)]" />
            <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[30%] aspect-square w-[min(70%,400px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(170,210,255,0.30),rgba(47,134,255,0.16)_55%,transparent_100%)]" />
            <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[30%] aspect-square w-[min(86%,500px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(140,190,255,0.28)] shadow-[0_0_48px_rgba(0,107,255,0.30),inset_0_0_48px_rgba(0,107,255,0.16)]" />
            <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[30%] aspect-square w-[min(112%,640px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(111,174,255,0.08)]" />
            <div aria-hidden="true" className="pointer-events-none absolute bottom-[-6%] left-[8%] right-[8%] h-[22%] rounded-full bg-[radial-gradient(closest-side,rgba(0,107,255,0.40),transparent)]" />
            <div className="relative h-full [filter:drop-shadow(0_0_1px_rgba(150,200,255,0.75))_drop-shadow(0_0_10px_rgba(47,134,255,0.40))_drop-shadow(-6px_-4px_22px_rgba(0,107,255,0.22))]">
              <Image
                src="/images/danilo-hero.png"
                alt={banner.alt ?? ""}
                width={683}
                height={1057}
                priority={primeiro}
                sizes="(min-width: 1000px) 520px, 1px"
                className="block h-full w-auto max-w-none"
                style={{ maskImage: MASCARA_DA_FOTO, WebkitMaskImage: MASCARA_DA_FOTO }}
              />
            </div>
            <div className="pointer-events-none absolute bottom-[clamp(16px,4vw,44px)] left-0 right-0 z-[1] flex flex-wrap-reverse items-end justify-between gap-3">
              <div className="pointer-events-auto rounded-r-[10px] border-l-2 border-azul-vivo bg-[rgba(7,20,38,0.78)] px-3.5 py-2.5">
                <div className="font-display text-[15px] font-bold tracking-[0.02em]">Danilo Moura</div>
                <div className="mt-[3px] text-[12.5px] text-[#B4C1D3]">Fundador do Quad Concursos</div>
              </div>
              <div className="pointer-events-auto relative ml-auto rounded-2xl border border-[rgba(111,174,255,0.22)] bg-[rgba(11,28,51,0.94)] px-6 pb-5 pt-[18px] shadow-[0_30px_60px_-24px_rgba(0,0,0,0.9),0_0_0_1px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.06)]">
                <div aria-hidden="true" className="absolute left-5 right-5 top-[-1px] h-px bg-[linear-gradient(90deg,transparent,#4D9BFF,transparent)]" />
                <div className="flex items-start font-display font-extrabold leading-[0.86] tracking-[-0.05em] [font-variant-numeric:tabular-nums]">
                  <span className="mr-0.5 text-[clamp(34px,3.6vw,46px)] text-azul-vivo">+</span>
                  <span className="text-[clamp(56px,6vw,80px)] text-white">800</span>
                </div>
                <div className="mt-2.5 font-display text-[13px] font-extrabold uppercase tracking-[0.32em] text-prata-clara">Aprovados</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Celular */}
      <div className="absolute inset-0 bg-[radial-gradient(70%_45%_at_50%_70%,rgba(0,107,255,0.42),transparent_70%),linear-gradient(180deg,#071426_0%,#081830_100%)] min-[1000px]:hidden">
        <div className="relative z-[2] px-5 pt-8">
          {/* A versão de computador fica oculta (display: none) no celular: só um h1 é lido por vez. */}
          <h1 className="font-display text-[clamp(2.1rem,9vw,2.8rem)] font-extrabold leading-[1.02] tracking-[-0.04em] [text-wrap:balance]">{TITULO_PRINCIPAL}</h1>
        </div>
        <div className="absolute bottom-0 left-0 right-0 flex h-[64%] justify-center">
          <div aria-hidden="true" className="absolute left-1/2 top-[22%] aspect-square w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(170,210,255,0.28),rgba(47,134,255,0.14)_55%,transparent_100%)]" />
          <Image
            src="/images/danilo-hero.png"
            alt={banner.alt ?? ""}
            width={683}
            height={1057}
            priority={primeiro}
            sizes="(max-width: 999px) 360px, 1px"
            className="relative block h-full w-auto [filter:drop-shadow(0_0_10px_rgba(47,134,255,0.40))]"
            style={{ maskImage: "linear-gradient(180deg,#000 60%,transparent 96%)", WebkitMaskImage: "linear-gradient(180deg,#000 60%,transparent 96%)" }}
          />
        </div>
        <div className="absolute bottom-6 left-5 right-5 z-[2] flex">
          <BotaoDoBanner banner={banner} largo />
        </div>
      </div>
    </>
  );
}

// Banner com arte da designer. Sem arte cadastrada ainda, mostra só o título e o botão sobre o fundo escuro.
function SlideDeImagem({ banner, primeiro }: { banner: Banner; primeiro: boolean }) {
  const { imagem, posicao } = banner;
  const temArte = !!(imagem?.desktop || imagem?.celular);
  return (
    <div className="absolute inset-0 bg-marinho-900">
      {temArte ? (
        <picture>
          <source media="(max-width: 999px)" srcSet={imagem?.celular || imagem?.desktop} />
          <img
            src={imagem?.desktop || imagem?.celular}
            alt={banner.alt ?? ""}
            loading={primeiro ? "eager" : "lazy"}
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover max-[999px]:[object-position:var(--pos-celular)] min-[1000px]:[object-position:var(--pos-desktop)]"
            style={{ "--pos-desktop": posicao?.desktop ?? "50% 50%", "--pos-celular": posicao?.celular ?? "50% 50%" } as CSSProperties}
          />
        </picture>
      ) : (
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(50%_70%_at_75%_40%,rgba(0,107,255,0.30),transparent_70%),linear-gradient(180deg,#071426_0%,#0B1C33_100%)]" />
      )}
      {banner.escurecer !== false && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(7,20,38,0.92)_0%,rgba(7,20,38,0.55)_32%,rgba(7,20,38,0)_58%)] min-[1000px]:bg-[linear-gradient(90deg,rgba(7,20,38,0.88)_0%,rgba(7,20,38,0.6)_32%,rgba(7,20,38,0)_62%)]"
        />
      )}
      <div className="pointer-events-none absolute inset-0 flex items-end px-5 pb-6 min-[1000px]:mx-auto min-[1000px]:max-w-tela min-[1000px]:items-center min-[1000px]:px-[clamp(20px,4vw,56px)] min-[1000px]:pb-24">
        <div className="flex w-full max-w-[520px] flex-col items-start gap-5">
          {!banner.ocultarTexto && (
            <>
              {banner.titulo && (
                <h2 className="font-display text-[clamp(2.1rem,4.6vw,4.2rem)] font-extrabold leading-[1.02] tracking-[-0.04em] [text-wrap:balance]">{banner.titulo}</h2>
              )}
              {banner.descricao && <p className="text-[clamp(15px,1.4vw,18px)] leading-[1.6] text-prata-clara [text-wrap:pretty]">{banner.descricao}</p>}
            </>
          )}
          <div className="w-full min-[1000px]:w-auto [&>a]:max-[999px]:w-full">
            <BotaoDoBanner banner={banner} />
          </div>
        </div>
      </div>
    </div>
  );
}

function BotaoRedondo({ rotulo, onClick, children }: { rotulo: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={rotulo}
      onClick={onClick}
      className="grid h-10 w-10 place-items-center rounded-full border border-white/[0.16] text-[#DCE4EF] transition-colors hover:border-white/[0.32] hover:bg-white/[0.08]"
    >
      {children}
    </button>
  );
}

function Controles({ banners, atual, pausado, irPara, alternarPausa }: {
  banners: Banner[];
  atual: number;
  pausado: boolean;
  irPara: (i: number) => void;
  alternarPausa: () => void;
}) {
  return (
    <>
      <BotaoRedondo rotulo="Banner anterior" onClick={() => irPara(atual - 1)}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </BotaoRedondo>
      <div className="flex items-center">
        {banners.map((b, i) => (
          <button
            key={b.id}
            type="button"
            aria-label={`Ir para o banner ${i + 1}: ${b.nome}`}
            aria-current={i === atual ? "true" : undefined}
            onClick={() => irPara(i)}
            className="grid h-11 place-items-center px-1 min-[1000px]:h-10"
          >
            <span className={`block h-2 rounded-full transition-all duration-300 ${i === atual ? "w-[26px] bg-white" : "w-2 bg-white/[0.32]"}`} />
          </button>
        ))}
      </div>
      <BotaoRedondo rotulo="Próximo banner" onClick={() => irPara(atual + 1)}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </BotaoRedondo>
      <button
        type="button"
        aria-label={pausado ? "Retomar rotação automática" : "Pausar rotação automática"}
        aria-pressed={pausado}
        onClick={alternarPausa}
        className="grid h-10 w-10 place-items-center rounded-full text-prata hover:text-white"
      >
        {pausado ? (
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M3 1.5v9l7.5-4.5z" fill="currentColor" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <rect x="2" y="1.5" width="2.6" height="9" rx="0.6" fill="currentColor" />
            <rect x="7.4" y="1.5" width="2.6" height="9" rx="0.6" fill="currentColor" />
          </svg>
        )}
      </button>
    </>
  );
}

export default function CarrosselDeDestaques({ banners }: { banners: Banner[] }) {
  const total = banners.length;
  const [atual, setAtual] = useState(0);
  // Pausa do usuário (botão) e pausa momentânea (mouse em cima ou foco dentro).
  const [pausadoPeloUsuario, setPausadoPeloUsuario] = useState(false);
  const [emUso, setEmUso] = useState(false);
  const toque = useRef<{ x: number; y: number } | null>(null);
  const [rodada, setRodada] = useState(0);

  const irPara = useCallback(
    (i: number, manual = false) => {
      setAtual(((i % total) + total) % total);
      // Escolha manual reinicia a contagem até a próxima troca.
      if (manual) setRodada((r) => r + 1);
    },
    [total],
  );

  useEffect(() => {
    if (total < 2 || pausadoPeloUsuario || emUso) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const temporizador = setInterval(() => {
      if (document.visibilityState !== "hidden") setAtual((a) => (a + 1) % total);
    }, INTERVALO_MS);
    return () => clearInterval(temporizador);
  }, [total, pausadoPeloUsuario, emUso, rodada]);

  if (total === 0) return null;

  const controles = (
    <Controles
      banners={banners}
      atual={atual}
      pausado={pausadoPeloUsuario}
      irPara={(i) => irPara(i, true)}
      alternarPausa={() => setPausadoPeloUsuario((p) => !p)}
    />
  );

  return (
    <section
      aria-roledescription="carrossel"
      aria-label="Destaques do Quad"
      className="relative overflow-hidden bg-marinho-950 text-white"
      onMouseEnter={() => setEmUso(true)}
      onMouseLeave={() => setEmUso(false)}
      onFocus={() => setEmUso(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setEmUso(false);
      }}
      onTouchStart={(e) => (toque.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
      onTouchEnd={(e) => {
        const inicio = toque.current;
        if (!inicio) return;
        const dx = e.changedTouches[0].clientX - inicio.x;
        const dy = e.changedTouches[0].clientY - inicio.y;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) irPara(atual + (dx < 0 ? 1 : -1), true);
      }}
    >
      <div className="relative h-[max(560px,min(125vw,820px))] min-[1000px]:h-[clamp(620px,41.667vw,800px)]">
        {banners.map((b, i) => {
          const ativo = i === atual;
          return (
            <div
              key={b.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} de ${total}: ${b.nome}`}
              aria-hidden={!ativo}
              inert={!ativo}
              className={`absolute inset-0 transition-[opacity,visibility] duration-700 ${ativo ? "visible z-[1] opacity-100" : "invisible z-0 opacity-0"}`}
            >
              {b.tipo === "danilo" ? <SlideDanilo banner={b} primeiro={i === 0} /> : <SlideDeImagem banner={b} primeiro={i === 0} />}
            </div>
          );
        })}
        {total > 1 && (
          <div className="pointer-events-none absolute bottom-6 left-0 right-0 z-[3] hidden min-[1000px]:block">
            <div className="conteiner flex">
              <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/[0.09] bg-[rgba(7,20,38,0.6)] p-1">{controles}</div>
            </div>
          </div>
        )}
      </div>
      {total > 1 && <div className="flex items-center justify-center gap-1 bg-marinho-950 px-5 py-1.5 min-[1000px]:hidden">{controles}</div>}
      {/* Só anuncia a troca quando a pessoa está usando o carrossel; a rotação automática fica em silêncio. */}
      <div aria-live={emUso || pausadoPeloUsuario ? "polite" : "off"} className="sr-only">
        {total > 1 ? `Banner ${atual + 1} de ${total}: ${banners[atual].nome}` : ""}
      </div>
    </section>
  );
}
