import { ImageResponse } from "next/og";
import { institucional } from "@/lib/institucional";
import { SIMBOLO_DATA_URL } from "@/lib/marca";

// Imagem que aparece quando alguém compartilha um link do site (WhatsApp, Instagram, Facebook, LinkedIn).
// Vale para todas as páginas. Provisória até a arte oficial: troque este arquivo por um opengraph-image.png de 1200×630.
export const alt = "Quad Concursos — Preparação para concursos militares em Feira de Santana, Bahia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 90px",
          gap: 70,
          background: "linear-gradient(135deg, #091320 0%, #0D1B2A 55%, #14263A 100%)",
          color: "#F5F3EE",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse só aceita <img> */}
        <img src={SIMBOLO_DATA_URL} width={330} height={330} alt="" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 30, letterSpacing: 6, color: "#4C8DFF", fontWeight: 700 }}>QUAD CONCURSOS</div>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05, marginTop: 18, maxWidth: 640 }}>
            Sua aprovação começa com a preparação certa
          </div>
          <div style={{ fontSize: 28, color: "#B8C0CC", marginTop: 28 }}>
            Turmas presenciais · Materiais · Simulados
          </div>
          <div style={{ fontSize: 24, color: "#8B95A3", marginTop: 10 }}>
            {/* Um texto só: o ImageResponse não aceita dois nós dentro de um div sem display flex. */}
            {`Feira de Santana · Bahia${institucional.anoDeFundacao ? ` · desde ${institucional.anoDeFundacao}` : ""}`}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
