import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Novo visual (entrega da designer, out/2026). As cores antigas abaixo seguem até todas as páginas migrarem.
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
        nevoa: "#F4F7FB",
        linha: {
          DEFAULT: "#DFE6EF",
          forte: "#CFD8E3",
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
        navy: {
          DEFAULT: "#0D1B2A",
          deep: "#091320",
          mid: "#14263A",
        },
        blue: {
          DEFAULT: "#4C8DFF",
          dark: "#2F63C4",
        },
        offwhite: "#F5F3EE",
        // Contraste mínimo de 4,5 (WCAG AA): steel é o cinza de texto secundário em fundo claro;
        // em fundo escuro use steel-dim (ou steel-light).
        steel: {
          DEFAULT: "#5A6472",
          dim: "#8B95A3",
          light: "#B8C0CC",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      borderColor: {
        dark: "rgba(255,255,255,0.1)",
        light: "#E2DFD6",
      },
      padding: {
        header: "56px",
        section: "72px",
      },
      maxWidth: {
        tela: "1440px",
        site: "1120px",
        narrow: "760px",
        form: "920px",
      },
      fontSize: {
        display: ["clamp(2.375rem, 6vw, 3.625rem)", { lineHeight: "1.08" }],
        h1: ["2.5rem", { lineHeight: "1.1" }],
        "h1-sm": ["2rem", { lineHeight: "1.15" }],
        h2: ["2.125rem", { lineHeight: "1.2" }],
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(9,19,32,0.06)",
        DEFAULT: "0 4px 16px -4px rgba(9,19,32,0.12)",
        md: "0 8px 28px -6px rgba(9,19,32,0.22)",
      },
    },
  },
  plugins: [],
};
export default config;
