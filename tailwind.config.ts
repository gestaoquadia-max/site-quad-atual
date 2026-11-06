import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Novo visual (entrega da designer, out/2026).
        marinho: {
          950: "#071426",
          900: "#0B1C33",
          800: "#102641",
          700: "#14304F",
          600: "#1B3A63",
        },
        azul: {
          DEFAULT: "#006BFF",
          forte: "#144AFF",
          vivo: "#2F86FF",
          ceu: "#6FAEFF",
          palido: "#E8F1FF",
          gelo: "#F2F7FF",
        },
        tinta: "#101B2D",
        // Sem fundo branco no site (06/11/2026): a página em azul-acinzentado, as seções que eram brancas um tom acima
        // e os cartões em "superficie" (gelo), destacados pela sombra "cartao".
        nevoa: {
          DEFAULT: "#E6ECF4",
          clara: "#EDF1F7",
        },
        superficie: "#F3F6FB",
        linha: {
          DEFAULT: "#D5DEEA",
          forte: "#C4CFDD",
        },
        // Textos secundários: "ardosia" em fundo claro, "prata" em fundo escuro (contraste AA nos dois).
        ardosia: {
          DEFAULT: "#5A6B82",
          escura: "#2B3647",
        },
        prata: {
          DEFAULT: "#A9B6C8",
          clara: "#C9D5E5",
          escura: "#8696AC",
        },
        vinho: {
          DEFAULT: "#8E1B2E",
          forte: "#A51E36",
          rosa: "#F3A3B1",
          950: "#1E070D",
        },
        sucesso: { DEFAULT: "#13774A", fundo: "#E3F3EA" },
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
