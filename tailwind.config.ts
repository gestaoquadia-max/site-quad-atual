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
        // Site escuro, em tons de azul-marinho (06/11/2026, pedido do usuário; antes, fundos claros). Os nomes ficaram
        // e os valores viraram: "tinta" é o texto principal (claro), "nevoa" o fundo da página, "nevoa-clara" a seção
        // alternada, "superficie" os cartões e campos, "linha" as bordas e "ardosia" o texto secundário (prateado).
        tinta: "#E8EEF6",
        nevoa: {
          DEFAULT: "#071426",
          clara: "#0B1C33",
        },
        superficie: "#102641",
        linha: {
          DEFAULT: "#1F3A5E",
          forte: "#2B4B75",
        },
        // Contraste sobre os três fundos (medido): tinta 13:1 a 16:1, ardosia 7,4:1 a 9:1, ardosia-escura 10:1 a 12:1.
        ardosia: {
          DEFAULT: "#A9B6C8",
          escura: "#C9D5E5",
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
        sucesso: { DEFAULT: "#5FD39A", fundo: "#0E3A2B" },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      maxWidth: {
        tela: "1440px",
      },
      boxShadow: {
        // Cartões sobre o fundo escuro: um brilho fino no alto e uma sombra preta longa; "cartao-alto" no hover.
        cartao: "inset 0 1px 0 rgba(255,255,255,0.05), 0 18px 40px -18px rgba(0,0,0,0.75)",
        "cartao-alto": "inset 0 1px 0 rgba(255,255,255,0.07), 0 28px 56px -20px rgba(0,0,0,0.85), 0 0 0 1px rgba(111,174,255,0.18)",
      },
    },
  },
  plugins: [],
};
export default config;
