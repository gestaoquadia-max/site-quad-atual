import { ImageResponse } from "next/og";
import { SIMBOLO_DATA_URL } from "@/lib/marca";

// Ícone de quem salva o site na tela inicial do iPhone: o símbolo sobre o azul-marinho da marca.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0D1B2A" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse só aceita <img> */}
        <img src={SIMBOLO_DATA_URL} width={130} height={130} alt="" />
      </div>
    ),
    size,
  );
}
