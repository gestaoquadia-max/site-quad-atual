import type { Config } from "tailwindcss";

// Cor do tema lida de uma variável CSS com os canais RGB ("0 107 255"), para as opacidades do Tailwind (bg-azul/10).
const cor = (nome: string) => `rgb(var(--c-${nome}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Novo visual (entrega da designer, out/2026). Desde 11/11/2026 as cores do tema saem de variáveis CSS
        // (app/globals.css): o azul de sempre em :root e o laranja e preto da Black Friday em html[data-tema-site="black"]
        // (chave BLACK_FRIDAY.site em lib/black-friday.ts). Os valores azuis originais estão em app/globals.css.
        marinho: { 950: cor("marinho-950"), 900: cor("marinho-900"), 800: cor("marinho-800"), 700: cor("marinho-700"), 600: cor("marinho-600") },
        azul: { DEFAULT: cor("azul"), forte: cor("azul-forte"), vivo: cor("azul-vivo"), ceu: cor("azul-ceu"), palido: cor("azul-palido"), gelo: cor("azul-gelo") },
        tinta: cor("tinta"),
        // Sem fundo branco no site (06/11/2026): a página em azul-acinzentado, as seções que eram brancas um tom acima
        // e os cartões em "superficie" (gelo), destacados pela sombra "cartao". "nevoa-clara" é igual ao DEFAULT.
        nevoa: { DEFAULT: cor("nevoa"), clara: cor("nevoa") },
        superficie: cor("superficie"),
        linha: { DEFAULT: cor("linha"), forte: cor("linha-forte") },
        // Textos secundários: "ardosia" em fundo claro, "prata" em fundo escuro (contraste AA nos dois).
        ardosia: { DEFAULT: cor("ardosia"), escura: cor("ardosia-escura") },
        prata: { DEFAULT: cor("prata"), clara: cor("prata-clara"), escura: cor("prata-escura") },
        vinho: {
          DEFAULT: "#8E1B2E",
          forte: "#A51E36",
          rosa: "#F3A3B1",
          950: "#1E070D",
        },
        // Black Friday das Mentorias (11/2026): preto quente e laranja, do modelo da campanha.
        laranja: {
          DEFAULT: "#F25A0C",
          claro: "#FF7A2E",
          suave: "#FF9A5C",
          escuro: "#C94A08",
        },
        breu: {
          DEFAULT: "#0E0C0B",
          900: "#141110",
          800: "#17120F",
        },
        sucesso: { DEFAULT: cor("sucesso"), fundo: cor("sucesso-fundo") },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      maxWidth: {
        tela: "1440px",
      },
      boxShadow: {
        // Cartões sobre o fundo claro: um contorno curto e uma sombra azulada longa; "cartao-alto" no hover e nos painéis.
        cartao: "0 1px 2px rgba(11,28,51,0.06), 0 14px 32px -16px rgba(11,28,51,0.28)",
        "cartao-alto": "0 2px 4px rgba(11,28,51,0.07), 0 24px 48px -20px rgba(11,28,51,0.38)",
      },
    },
  },
  plugins: [],
};
export default config;
