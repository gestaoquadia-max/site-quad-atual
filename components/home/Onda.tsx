import { useId } from "react";

// Dobra em ondas entre uma seção clara e uma escura (entrega da designer, 11/11/2026). Desde a mesma data, em SVG
// vetorial (antes, a PNG transicao-ondas.png, que borrava em telas acima de 1586 pixels): nítida em qualquer tela.
// O desenho é claro em cima (#D7E0EB, o "nevoa" das seções claras) e escuro embaixo (COR_ESCURA_DA_ONDA); virado
// (scale(-1,-1)), serve para a passagem do escuro para o claro. Ocupa a largura toda e estica até a altura
// clamp(48px, 10.7vw, 190px). No celular (abaixo de 640px), a versão de curvas mais longas da designer.
// Os degradês ganham um prefixo único por onda: a mesma página tem várias, e algumas ficam escondidas (a do rodapé nas
// páginas que terminam no escuro, a versão do celular no computador); um id repetido apontaria para uma escondida.
export const COR_ESCURA_DA_ONDA = "#151A24";
// Fundo das seções escuras da Home: começa e termina na cor da onda.
export const FUNDO_ESCURO_DA_HOME = "linear-gradient(180deg,#151A24 0%,#0B1A36 18%,#081530 82%,#151A24 100%)";

const CURVAS = {
  computador: {
    faixaDeTras: "M0 130C150 80 260 56 380 55C560 54 720 116 860 118C1000 120 1150 56 1300 53C1450 50 1530 84 1586 116V170H0Z",
    faixaDoMeio: "M0 133C130 105 220 92 330 91C520 90 700 118 860 120C1000 122 1220 80 1380 78C1500 76 1560 100 1586 119V170H0Z",
    escuro: "M0 132C110 106 200 94 300 93C480 92 680 137 820 137C960 137 1220 76 1380 75C1500 74 1560 100 1586 118V170H0Z",
  },
  celular: {
    faixaDeTras: "M0 104C360 30 820 28 1150 62C1350 82 1480 100 1586 112V170H0Z",
    faixaDoMeio: "M0 120C380 62 840 54 1170 84C1360 100 1490 114 1586 122V170H0Z",
    escuro: "M0 128C420 88 880 70 1200 98C1380 112 1500 124 1586 128V170H0Z",
  },
};

function Desenho({ prefixo, curvas, virada, className }: { prefixo: string; curvas: (typeof CURVAS)["computador"]; virada: boolean; className: string }) {
  const id = (nome: string) => `${prefixo}-${nome}`;
  return (
    <svg
      viewBox="0 0 1586 170"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className={`block h-[clamp(48px,10.7vw,190px)] w-full ${virada ? "[transform:scale(-1,-1)]" : ""} ${className}`}
    >
      <defs>
        <linearGradient id={id("fundo-claro")} x1="0" y1="0" x2="0" y2="170" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#D7E0EB" />
          <stop offset=".3" stopColor="#C6D9EF" />
          <stop offset=".6" stopColor="#9DBDE2" />
          <stop offset="1" stopColor="#7EA8D8" />
        </linearGradient>
        <linearGradient id={id("faixa-de-tras")} x1="0" y1="50" x2="0" y2="130" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6E97CB" stopOpacity=".55" />
          <stop offset=".25" stopColor="#6690C6" stopOpacity=".9" />
          <stop offset="1" stopColor="#4A79B6" />
        </linearGradient>
        <linearGradient id={id("faixa-do-meio")} x1="0" y1="64" x2="0" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4A78B4" stopOpacity=".7" />
          <stop offset=".3" stopColor="#3D6CAA" />
          <stop offset="1" stopColor="#2C5791" />
        </linearGradient>
        <linearGradient id={id("escuro")} x1="0" y1="75" x2="0" y2="170" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0F1A2C" />
          <stop offset=".6" stopColor="#121A29" />
          <stop offset="1" stopColor="#151A24" />
        </linearGradient>
      </defs>
      <path fill={`url(#${id("fundo-claro")})`} d="M0 0H1586V170H0Z" />
      <path fill={`url(#${id("faixa-de-tras")})`} d={curvas.faixaDeTras} />
      <path fill={`url(#${id("faixa-do-meio")})`} d={curvas.faixaDoMeio} />
      <path fill={`url(#${id("escuro")})`} d={curvas.escuro} />
    </svg>
  );
}

export default function Onda({ para }: { para: "escuro" | "claro" }) {
  const prefixo = `onda${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const virada = para === "claro";
  return (
    <div
      aria-hidden="true"
      data-onda={para}
      className={`relative z-[1] -my-px leading-[0] ${
        para === "escuro" ? "bg-[linear-gradient(180deg,#D7E0EB_50%,#151A24_50%)]" : "bg-[linear-gradient(180deg,#151A24_50%,#D7E0EB_50%)]"
      }`}
    >
      <Desenho prefixo={`${prefixo}-c`} curvas={CURVAS.celular} virada={virada} className="sm:hidden" />
      <Desenho prefixo={`${prefixo}-p`} curvas={CURVAS.computador} virada={virada} className="hidden sm:block" />
    </div>
  );
}
