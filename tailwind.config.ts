import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
        steel: {
          DEFAULT: "#8B95A3",
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
