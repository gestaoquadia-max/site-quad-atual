"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";
import { codigoNormalizado, type ConcursoDaBlack } from "@/lib/black/catalogo";
import { FIM_DA_BLACK } from "@/lib/black/periodo";
import type { MaterialDaBlack } from "@/lib/vitrine";

// Peças comuns das telas de Materiais da Black (entrega da designer de 25/11/2026): o livro em 3D, o leque de capas,
// o selo "EM PDF", o preço "de … por" e a contagem até o fim do dia.

export const emReais = (centavos: number) => (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// "-52%": só com o preço de antes vindo da API.
export function descontoEm(por: number, de: number | null) {
  return de && de > por ? Math.round((1 - por / de) * 100) : null;
}

export function doConcurso(materiais: MaterialDaBlack[], concurso: Pick<ConcursoDaBlack, "codigos">) {
  return materiais.filter((m) => m.concurso && concurso.codigos.includes(codigoNormalizado(m.concurso.codigo)));
}

export const ROTULO_LARANJA = "font-display text-[13px] font-extrabold uppercase tracking-[0.16em] text-laranja-suave";
export const BOTAO_LARANJA_BLACK =
  "btn-q h-14 w-full rounded-[14px] bg-[linear-gradient(180deg,#FF7A2E,#E5530A)] px-5 text-[17px] text-white shadow-[0_10px_26px_-8px_rgba(242,90,12,0.8)] hover:text-white disabled:cursor-not-allowed disabled:bg-none disabled:bg-[#2A221D] disabled:text-[#8A7F78] disabled:shadow-none";

export function IconePdf({ className = "h-[22px] w-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 22" aria-hidden="true" className={className}>
      <path d="M2 1h9l6 6v13a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" fill="#F25A0C" />
      <path d="M11 1v6h6" fill="#FFB27A" />
    </svg>
  );
}

// Capa em pé, girada, com o miolo das páginas à direita.
export function Livro3D({ capa, alt, altura }: { capa: string; alt: string; altura: string }) {
  return (
    <div className="[perspective:1000px]">
      <div
        className={`relative aspect-[707/1000] [transform:rotateY(-24deg)_rotateX(4deg)] [transform-style:preserve-3d] [filter:drop-shadow(0_0_30px_rgba(255,110,20,0.5))_drop-shadow(0_28px_24px_rgba(0,0,0,0.85))] ${altura}`}
      >
        <span
          aria-hidden="true"
          className="absolute -right-3 bottom-[-3px] left-[3px] top-[3px] rounded-r-[3px] bg-[#E9E2DA] shadow-[inset_-2px_0_0_#CFC6BD,inset_-4px_0_0_#F4EFE9,inset_-6px_0_0_#D8D0C8]"
        />
        <Image src={capa} alt={alt} fill sizes="300px" className="rounded-[2px_5px_5px_2px] object-cover" />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[2px_5px_5px_2px] bg-[linear-gradient(90deg,rgba(0,0,0,0.55)_0,rgba(255,255,255,0.28)_2.5%,rgba(0,0,0,0.25)_5%,transparent_9%,transparent_70%,rgba(255,255,255,0.12)_100%)]"
        />
      </div>
    </div>
  );
}

// Cinco capas em leque (as de trás mais escuras), para os cartões do Combo e dos Módulos.
// O brilho fica na imagem, e a sombra no quadro: as duas são `filter` e uma apagaria a outra no mesmo elemento.
const POSICOES_DO_LEQUE = [
  { lugar: "left-[3%] top-[13%] h-[77%] -rotate-[14deg] z-[1]", brilho: "brightness-[0.72]" },
  { lugar: "right-[3%] top-[13%] h-[77%] rotate-[14deg] z-[1]", brilho: "brightness-[0.72]" },
  { lugar: "left-[11%] top-[8%] h-[83%] -rotate-6 z-[2]", brilho: "brightness-[0.86]" },
  { lugar: "right-[11%] top-[8%] h-[83%] rotate-6 z-[2]", brilho: "brightness-[0.86]" },
  { lugar: "left-1/2 top-[2%] h-[92%] -translate-x-1/2 z-[3]", brilho: "" },
];

export function LequeDeCapas({ capas, alt }: { capas: string[]; alt: string }) {
  return (
    <div className="relative h-[260px] w-[min(100%,300px)]">
      {capas.map((c, i) => (
        <div
          key={c}
          className={`absolute aspect-[707/1000] [filter:drop-shadow(0_0_18px_rgba(255,110,20,0.35))_drop-shadow(0_20px_18px_rgba(0,0,0,0.85))] ${POSICOES_DO_LEQUE[i].lugar}`}
        >
          <Image src={c} alt={i === capas.length - 1 ? alt : ""} fill sizes="200px" className={`rounded-[2px_4px_4px_2px] object-cover ${POSICOES_DO_LEQUE[i].brilho}`} />
        </div>
      ))}
    </div>
  );
}

// O quadro da capa nas telas do Combo e dos Módulos: o livro, o selo "EM PDF", o desconto e o concurso escolhido.
export function QuadroDaCapa({ capa, alt, desconto, rotulo }: { capa: string | null; alt: string; desconto: number | null; rotulo: string }) {
  return (
    <div className="min-w-0 flex-[1_1_380px] rounded-3xl border-[1.5px] border-[#3A2E27] bg-breu-800 p-2.5">
      <div className="relative flex h-[clamp(340px,40vw,460px)] items-center justify-center overflow-hidden rounded-2xl bg-[radial-gradient(70%_60%_at_50%_40%,rgba(242,90,12,0.5),#120F0D_75%)]">
        {capa ? (
          <Livro3D capa={capa} alt={alt} altura="h-[clamp(240px,30vw,350px)]" />
        ) : (
          <span className="font-display text-[15px] font-bold text-[#A39790]">Capa em breve</span>
        )}
        <span className="absolute left-4 top-4 flex items-center gap-2 rounded-[10px] bg-white py-[7px] pl-2.5 pr-3 font-display text-[15px] font-extrabold tracking-[0.04em] text-[#B4410B] shadow-[0_8px_20px_-6px_rgba(0,0,0,0.6)]">
          <IconePdf />
          EM PDF
        </span>
        {desconto !== null && (
          <span className="absolute right-4 top-4 rounded-[10px] bg-laranja px-3 py-1.5 font-display text-[17px] font-extrabold text-white">-{desconto}%</span>
        )}
        <span className="absolute bottom-4 left-4 max-w-[calc(100%-32px)] truncate rounded-full border border-[#3A2E27] bg-[rgba(12,9,7,0.85)] px-3 py-[7px] text-sm font-semibold text-[#F3EEEA]">
          {rotulo}
        </span>
      </div>
    </div>
  );
}

// Botão de concurso com o brasão (ou a sigla num círculo). `compacto`: o quadrado de ~150 px da tela dos Módulos.
export function BotaoDoConcurso({
  concurso,
  marcado,
  semProduto,
  compacto = false,
  aoEscolher,
}: {
  concurso: ConcursoDaBlack;
  marcado: boolean;
  semProduto: boolean;
  compacto?: boolean;
  aoEscolher: () => void;
}) {
  const tamanho = compacto ? "h-[46px] w-[46px]" : "h-[38px] w-[38px]";
  return (
    <button
      type="button"
      aria-pressed={marcado}
      onClick={aoEscolher}
      className={`flex rounded-[14px] border-[1.5px] font-display font-bold text-white transition-colors ${
        compacto ? "min-h-[112px] w-[150px] flex-col items-center justify-center gap-2 px-2.5 py-3.5 text-center text-sm" : "items-center gap-3 px-3.5 py-3 text-left text-[15px]"
      } ${
        marcado
          ? "border-laranja bg-[rgba(242,90,12,0.18)] shadow-[0_0_0_1px_rgba(255,140,60,0.25),0_0_24px_-6px_rgba(242,90,12,0.7)]"
          : "border-[#3A2E27] bg-breu-800 hover:border-[#5A4536]"
      }`}
    >
      {concurso.brasao ? (
        <Image src={concurso.brasao} alt="" width={46} height={46} className={`${tamanho} flex-none object-contain`} />
      ) : (
        <span
          aria-hidden="true"
          className={`${tamanho} flex flex-none items-center justify-center rounded-full border border-[#4A3B32] bg-[#2A221D] text-[10px] font-extrabold text-laranja-suave`}
        >
          {concurso.sigla}
        </span>
      )}
      <span className="flex flex-col">
        {concurso.nome}
        {semProduto && <span className="text-[12px] font-semibold text-[#8A7F78]">Em breve</span>}
      </span>
    </button>
  );
}

// "Material em PDF", "Acesso imediato após a compra" e "Estude no celular, tablet ou computador".
export function Destaques({ itens }: { itens: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      <li className="flex items-center gap-2 rounded-full border border-[rgba(242,90,12,0.55)] bg-[rgba(242,90,12,0.16)] px-3.5 py-2 font-display text-sm font-extrabold text-white">
        <IconePdf className="h-[17px] w-[14px]" />
        Material em PDF
      </li>
      {itens.map((t) => (
        <li key={t} className="rounded-full border border-[#3A2E27] px-3.5 py-2 text-sm text-[#F3EEEA]">
          {t}
        </li>
      ))}
    </ul>
  );
}

// "~~R$ 59,90~~ por" e o preço grande. Sem preço de antes na API, só o preço.
export function PrecoDeAte({ por, de, prefixo = "por", grande = false }: { por: number; de: number | null; prefixo?: string; grande?: boolean }) {
  return (
    <span className="flex flex-col">
      <span className="whitespace-nowrap text-[15px] text-[#A39790]">
        {de && de > por ? <s>{emReais(de)}</s> : null} {prefixo}
      </span>
      <span
        className={`whitespace-nowrap font-display font-extrabold leading-none tracking-[-0.04em] text-white [font-variant-numeric:tabular-nums] ${grande ? "text-[clamp(38px,4vw,48px)]" : "text-[clamp(32px,3vw,40px)]"}`}
      >
        {emReais(por)}
      </span>
    </span>
  );
}

// Contagem até o fim da Black, 23h59 de 30/11 em Brasília ("Preço válido até 30/11 · 3d 14:59:59"): os preços valem até
// lá (pedido de 26/11/2026; antes contava até a meia-noite de cada dia). No servidor, "--:--:--".
function assinar(avisar: () => void) {
  const t = setInterval(avisar, 1000);
  return () => clearInterval(t);
}
const segundoAtual = () => Math.floor(Date.now() / 1000);
const semRelogio = () => null;
const dois = (n: number) => String(n).padStart(2, "0");

export function ContagemAteOFim() {
  const agora = useSyncExternalStore(assinar, segundoAtual, semRelogio);
  if (agora === null) return <span className="[font-variant-numeric:tabular-nums]">--:--:--</span>;
  const restante = Math.max(0, Math.floor(FIM_DA_BLACK / 1000) - agora);
  const dias = Math.floor(restante / 86_400);
  return (
    <span className="[font-variant-numeric:tabular-nums]">
      {dias > 0 && `${dias}d `}
      {dois(Math.floor(restante / 3600) % 24)}:{dois(Math.floor(restante / 60) % 60)}:{dois(restante % 60)}
    </span>
  );
}

export function SeloDaContagem({ grande = false }: { grande?: boolean }) {
  return (
    <span
      className={`flex items-center gap-2 rounded-full border-[1.5px] border-laranja font-display font-extrabold text-white ${
        grande ? "px-[18px] py-2.5 text-[15px] shadow-[0_0_24px_-4px_rgba(242,90,12,0.6)] sm:text-[16px]" : "whitespace-nowrap px-3.5 py-1.5 text-[15px]"
      }`}
    >
      <span aria-hidden="true" className="text-laranja-claro">
        ⏱
      </span>
      {/* No celular estreito, o texto e a contagem podem ir para duas linhas; cada um nunca se parte. */}
      <span className={grande ? "flex flex-wrap items-center gap-x-1.5" : "contents"}>
        {grande && <span className="whitespace-nowrap">Preço válido até 30/11 ·</span>}
        <span className="whitespace-nowrap">
          <ContagemAteOFim />
        </span>
      </span>
    </span>
  );
}

// O rodapé dos quadros de pedido: "Preço válido até 30/11" e a contagem.
export function ValidoAteOFim() {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-[#2E241E] pt-3 text-[15px] text-[#D6CCC5]">
      <span>Preço válido até 30/11</span>
      <SeloDaContagem />
    </div>
  );
}
