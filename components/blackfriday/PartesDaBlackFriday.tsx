import Image from "next/image";
import { Russo_One } from "next/font/google";
import type { ReactNode } from "react";
import Trilha from "@/components/Trilha";
import ContagemDaBlackFriday from "./ContagemDaBlackFriday";
import PrecoDigitando from "./PrecoDigitando";

// Partes das páginas da Black Friday (27/11/2026), feitas a partir do modelo da campanha (preto e laranja): a abertura
// com o preço digitando e a contagem, as faixas "BLACK FRIDAY" e o convite do Grupo VIP. Usadas em /mentorias e em
// /produtos (lib/black-friday.ts). Topo, menu em cápsula e rodapé continuam os do site; data-tema="black" troca as
// cores deles nessas páginas (components/Navbar.tsx e app/globals.css).

// Fonte das faixas "BLACK FRIDAY" e do "GRUPO VIP" do modelo; só as páginas da campanha a carregam.
const fonteDaCampanha = Russo_One({ weight: "400", subsets: ["latin"], variable: "--font-campanha" });
// Classe que carrega a fonte num trecho fora das páginas da campanha (o bloco da Black Friday na Home).
export const VARIAVEL_DA_FONTE_DA_CAMPANHA = fonteDaCampanha.variable;
export const FONTE_DA_CAMPANHA = "font-[family-name:var(--font-campanha)]";

export const ABERTURA_DAS_OFERTAS = "2026-11-27T00:00:00-03:00";
export const GRUPO_VIP = "https://chat.whatsapp.com/EmN0ss6uR7A0Q7USITlHbL";

export const BOTAO_LARANJA =
  "btn-q btn-q-laranja h-[58px] rounded-[11px] px-[30px] text-[16.5px] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_18px_40px_-16px_rgba(242,90,12,0.9)] hover:-translate-y-0.5";
const BOTAO_CONTORNO =
  "btn-q h-[58px] rounded-[11px] border-[1.5px] border-white/[0.22] px-7 text-[16.5px] text-white hover:border-laranja-claro hover:bg-laranja/[0.08] hover:text-white";

export const NOVA_ABA = <span className="sr-only"> (abre em nova aba)</span>;

export function SetaParaFora() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M5 11L11 5M6 5h5v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="flex-none text-laranja-claro">
      <path d="M3 8.5l3.2 3L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconeWhatsApp() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z" />
    </svg>
  );
}

// A página inteira: o preto da campanha, a fonte das faixas e o tema do rodapé.
export function PaginaDaBlackFriday({ children }: { children: ReactNode }) {
  return (
    <div data-tema="black" className={`${fonteDaCampanha.variable} overflow-x-clip bg-breu text-[#F3EEEA]`}>
      {children}
    </div>
  );
}

// Abertura: o título com o preço digitando, o texto, a contagem até 27/11 e os dois caminhos (o Grupo VIP e o
// segundo botão de cada página).
export function AberturaDaBlackFriday({
  area,
  titulo,
  preco,
  descricao,
  segundoBotao,
}: {
  area: string;
  titulo: string;
  preco: string;
  descricao: ReactNode;
  segundoBotao: { rotulo: string; href: string; externo?: boolean };
}) {
  return (
    // A abertura sobe por trás do menu flutuante (o espaço de 106/110px que app/globals.css reserva no topo da página,
    // `.com-menu-flutuante`): o degradê dela começa atrás da cápsula, e não numa faixa de outra cor acima dela.
    <section className="relative -mt-[106px] overflow-hidden pb-[clamp(88px,9vw,136px)] pt-[calc(106px+clamp(28px,3vw,40px))] min-[1220px]:-mt-[110px] min-[1220px]:pt-[calc(110px+clamp(28px,3vw,40px))]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[image:radial-gradient(60%_55%_at_50%_62%,rgba(242,90,12,0.26),transparent_70%),linear-gradient(180deg,#1C1714_0%,#120F0D_55%,#0A0908_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[image:linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[length:96px_44px] opacity-35"
      />
      <div className="conteiner relative">
        <Trilha itens={[{ rotulo: "Início", href: "/" }, { rotulo: area }]} className="mb-[clamp(40px,5vw,72px)] !text-[#8A7F78] [&_a]:text-[#B5AAA2]" />
        <div className="mx-auto flex max-w-[980px] flex-col items-center text-center">
          <h1 className="font-display text-[clamp(2.8rem,6.2vw,5.6rem)] font-extrabold leading-[0.95] tracking-[-0.05em] [text-wrap:balance]">
            {titulo} <PrecoDigitando texto={preco} className="bg-[linear-gradient(100deg,#FFB27A_0%,#FF6A1A_45%,#E5530A_100%)] bg-clip-text text-transparent" />
          </h1>
          <p className="mt-6 max-w-[640px] text-[clamp(17px,1.5vw,20px)] leading-[1.6] text-[#CFC5BE] [text-wrap:pretty]">{descricao}</p>

          <ContagemDaBlackFriday alvo={ABERTURA_DAS_OFERTAS} dataPorExtenso="27 de novembro" />

          <div className="mt-[clamp(36px,4vw,52px)] flex flex-wrap justify-center gap-3.5">
            <a href={GRUPO_VIP} target="_blank" rel="noopener" className={BOTAO_LARANJA}>
              Entrar no Grupo VIP
              <SetaParaFora />
              {NOVA_ABA}
            </a>
            {segundoBotao.externo ? (
              <a href={segundoBotao.href} target="_blank" rel="noopener" className={BOTAO_CONTORNO}>
                {segundoBotao.rotulo}
                {NOVA_ABA}
              </a>
            ) : (
              <a href={segundoBotao.href} className={BOTAO_CONTORNO}>
                {segundoBotao.rotulo}
              </a>
            )}
          </div>
          <p className="mt-4 text-sm text-[#A39790]">Quem está no Grupo VIP recebe o aviso da liberação das ofertas em primeira mão.</p>
        </div>
      </div>
    </section>
  );
}

// Faixa inclinada com "BLACK FRIDAY" repetido (decorativa, parada; 11/11/2026: a que rolava deixava a borda serrilhada
// no Chrome). `[backface-visibility:hidden]` e o contorno transparente suavizam a borda da faixa girada.
export function Faixa({ className, tom, comData = false }: { className: string; tom: "laranja" | "grafite"; comData?: boolean }) {
  const cores =
    tom === "laranja" ? "bg-[linear-gradient(180deg,#FF7A2E,#E5530A)] text-breu-800" : "bg-[linear-gradient(180deg,#3A3533,#1D1A18)] text-[#E8E2DD]";
  const itens = Array.from({ length: 20 }, (_, i) => (
    <span key={i} className="inline-flex items-center gap-[18px]">
      {comData ? <span className="text-white">BLACK FRIDAY</span> : "BLACK FRIDAY"}
      {comData && <span className="text-breu-800">27/11</span>}
    </span>
  ));
  return (
    <div
      aria-hidden="true"
      className={`absolute flex items-center overflow-hidden whitespace-nowrap border-t border-white/[0.22] shadow-[0_8px_22px_rgba(0,0,0,0.6)] outline outline-1 outline-transparent [backface-visibility:hidden] italic ${FONTE_DA_CAMPANHA} ${cores} ${className}`}
    >
      <div className="flex w-max gap-[clamp(18px,2vw,32px)] pl-5">{itens}</div>
    </div>
  );
}

// Faixa laranja entre a abertura e a seção seguinte.
export function FaixaDaData() {
  return (
    <div aria-hidden="true" className="relative z-[2] h-0">
      <Faixa tom="laranja" comData className="-left-[5%] -right-[5%] -top-[26px] h-[52px] -rotate-[1.6deg] text-[22px]" />
    </div>
  );
}

const VANTAGENS_DO_GRUPO = [
  {
    texto: "Novidades",
    icone: (
      <>
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </>
    ),
  },
  {
    texto: "Condições especiais",
    icone: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M15 9l-6 6" />
        <circle cx="9.5" cy="9.5" r="0.6" />
        <circle cx="14.5" cy="14.5" r="0.6" />
      </>
    ),
  },
  {
    texto: "Avisos em primeira mão",
    icone: (
      <>
        <path d="M3 11v2a1 1 0 0 0 1 1h3l5 4V6L7 10H4a1 1 0 0 0-1 1z" />
        <path d="M16 9a4 4 0 0 1 0 6" />
        <path d="M19 6a8 8 0 0 1 0 12" />
      </>
    ),
  },
];

// Grupo VIP: o convite para o grupo do WhatsApp, entre as faixas da campanha.
export function GrupoVip() {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(55%_60%_at_50%_48%,#2A221D_0%,#151110_60%,#0E0C0B_100%)] pb-[clamp(190px,16vw,240px)] pt-[clamp(96px,10vw,150px)] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[image:linear-gradient(rgba(0,0,0,0.6)_2px,transparent_2px),linear-gradient(90deg,rgba(0,0,0,0.6)_2px,transparent_2px)] bg-[length:96px_40px] opacity-50"
      />
      <Faixa tom="grafite" className="-left-[10%] top-16 h-[clamp(36px,3.4vw,50px)] w-[120%] rotate-[5deg] text-[clamp(16px,1.6vw,22px)]" />
      <Faixa tom="laranja" className="-left-[10%] top-5 h-[clamp(36px,3.4vw,50px)] w-[120%] -rotate-3 text-[clamp(16px,1.6vw,22px)]" />
      <Faixa tom="laranja" className="-left-[10%] bottom-16 h-[clamp(36px,3.4vw,50px)] w-[120%] -rotate-[4deg] text-[clamp(16px,1.6vw,22px)]" />
      <Faixa tom="grafite" className="-left-[10%] bottom-[18px] h-[clamp(36px,3.4vw,50px)] w-[120%] rotate-[2.5deg] text-[clamp(16px,1.6vw,22px)]" />

      <div className="conteiner relative z-[1]">
        <div className="mx-auto flex max-w-[900px] flex-col items-center text-center">
          <h2 className="mt-[clamp(18px,2vw,28px)] flex flex-col items-center font-normal">
            <span
              className={`bg-[linear-gradient(180deg,#FFFFFF_0%,#C9C3BE_55%,#8E8782_100%)] bg-clip-text text-[clamp(4.6rem,13vw,11rem)] leading-[0.85] text-transparent ${FONTE_DA_CAMPANHA}`}
            >
              GRUPO
            </span>
            <span className={`text-[clamp(7rem,21vw,18rem)] leading-[0.8] text-laranja [text-shadow:0_0_60px_rgba(242,90,12,0.35)] ${FONTE_DA_CAMPANHA}`}>
              VIP
            </span>
          </h2>
          <div
            aria-hidden="true"
            className="relative mt-[clamp(-96px,-7vw,-48px)] flex h-[clamp(130px,16vw,200px)] w-[clamp(240px,30vw,380px)] flex-col items-center rounded-t-[36px] border-[8px] border-b-0 border-[#2A2522] bg-[linear-gradient(180deg,#0B0908,#16110E)] shadow-[0_0_0_3px_#FF6A1A,0_0_50px_rgba(242,90,12,0.55)]"
          >
            <span className="mt-1.5 h-4 w-[32%] rounded-b-xl bg-[#2A2522]" />
            <svg
              viewBox="0 0 64 40"
              fill="none"
              stroke="#FF8A3D"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-2.5 w-[56%] [filter:drop-shadow(0_0_8px_rgba(255,106,26,0.9))]"
            >
              <path d="M24 9l4 4 4-7 4 7 4-4-2 8H26z" />
              <circle cx="32" cy="22" r="5" />
              <path d="M22 38c0-6 4.5-9 10-9s10 3 10 9" />
              <circle cx="16" cy="25" r="4" />
              <path d="M8 38c0-4.5 3.5-7 8-7" />
              <circle cx="48" cy="25" r="4" />
              <path d="M56 38c0-4.5-3.5-7-8-7" />
            </svg>
          </div>
          <p className="mt-[clamp(18px,2vw,26px)] leading-none">
            <span className="block font-display text-[clamp(20px,2.6vw,34px)] font-semibold uppercase tracking-[-0.01em] text-[#E8E2DD]">
              Entre no grupo e receba
            </span>
            <span className={`mt-1.5 block text-[clamp(28px,4vw,52px)] text-[#FF6A1A] ${FONTE_DA_CAMPANHA}`}>ACESSO ANTECIPADO</span>
          </p>
          <ul className="mt-[clamp(22px,2.6vw,34px)] flex w-[min(100%,640px)] gap-2 rounded-2xl border-[2.5px] border-laranja bg-[rgba(10,9,8,0.85)] px-2.5 py-[clamp(16px,2vw,24px)]">
            {VANTAGENS_DO_GRUPO.map((v, i) => (
              <li key={v.texto} className={`flex min-w-0 flex-1 flex-col items-center gap-3 px-1.5 py-1 text-center ${i > 0 ? "border-l border-laranja" : ""}`}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FF6A1A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="h-[clamp(30px,3vw,40px)] w-[clamp(30px,3vw,40px)]"
                >
                  {v.icone}
                </svg>
                <span className="max-w-[12ch] font-display text-[clamp(12px,1.1vw,14px)] font-bold uppercase leading-[1.25] tracking-[0.08em] text-[#E8E2DD]">
                  {v.texto}
                </span>
              </li>
            ))}
          </ul>
          <a href={GRUPO_VIP} target="_blank" rel="noopener" className={`${BOTAO_LARANJA} mt-[clamp(28px,3vw,40px)] h-[62px] gap-3 px-[34px] text-[17px]`}>
            <IconeWhatsApp />
            Entrar no Grupo VIP
            {NOVA_ABA}
          </a>
          <Image
            src="/images/quad-logo-branco.png"
            alt="Quad Concursos"
            width={236}
            height={88}
            className="relative z-[2] mt-[clamp(36px,4vw,56px)] h-auto w-[clamp(120px,12vw,160px)]"
          />
        </div>
      </div>
    </section>
  );
}
