"use client";

import { useEffect, useRef, useState } from "react";

// Aprovados na Home (entrega da designer, 11/11/2026): os vídeos verticais dos alunos aprovados passando em faixa
// contínua (a lista vai duas vezes e a faixa anda metade da largura, para emendar sem salto). Sem som, em repetição.
// A faixa para só com o mouse em cima; no toque do celular ela segue andando. Com "reduzir movimento", fica parada e
// rola com o dedo ou a barra.
const VIDEOS = [
  "/videos/aprovados/aprovados-sd.mp4",
  "/videos/aprovados/aprovadas-cfo.mp4",
  "/videos/aprovados/aprovadas-sd.mp4",
  "/videos/aprovados/aprovados-cfo.mp4",
];

export default function AprovadosEmVideo() {
  const faixa = useRef<HTMLDivElement>(null);
  const [pausada, setPausada] = useState(false);

  // Alguns navegadores ignoram o atributo `muted` e não deixam o vídeo tocar sozinho: o mudo vai também pelo código.
  useEffect(() => {
    faixa.current?.querySelectorAll("video").forEach((v) => {
      v.muted = true;
      v.defaultMuted = true;
      v.play().catch(() => {});
    });
  }, []);

  return (
    <div className="-mx-[clamp(20px,4vw,56px)] overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)] motion-reduce:overflow-x-auto">
      <div
        ref={faixa}
        onPointerEnter={(e) => e.pointerType === "mouse" && setPausada(true)}
        onPointerLeave={() => setPausada(false)}
        style={{ animationPlayState: pausada ? "paused" : "running" }}
        className="flex w-max animate-[q-aprovados_36s_linear_infinite] gap-5 motion-reduce:animate-none"
      >
        {[...VIDEOS, ...VIDEOS].map((src, i) => (
          <div
            key={i}
            aria-hidden={i >= VIDEOS.length ? true : undefined}
            className="relative aspect-[9/16] w-[clamp(250px,25vw,330px)] flex-none overflow-hidden rounded-[18px] bg-marinho-900 shadow-[0_24px_40px_-24px_rgba(15,23,42,0.6)]"
          >
            <video
              src={src}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label={i < VIDEOS.length ? "Vídeo de alunos do Quad aprovados" : undefined}
              className="absolute left-0 top-[-1%] block h-[103%] w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
