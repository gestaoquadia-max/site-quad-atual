import type { ReactNode } from "react";
import PageHeader from "./PageHeader";
import EmDesenvolvimento from "./EmDesenvolvimento";
import AreaEmEspera from "./AreaEmEspera";
import { EM_ESPERA, TEXTO_EM_ESPERA, type AreaDoSite } from "@/lib/em-espera";

// A página de uma área em espera (lib/em-espera.ts): o topo das páginas internas e o aviso de desenvolvimento.
function AvisoDaPagina({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <>
      <PageHeader title={titulo} />
      <section className="bg-nevoa py-[clamp(48px,6vw,88px)]">
        <div className="conteiner">
          <EmDesenvolvimento texto={texto} />
        </div>
      </section>
    </>
  );
}

// Envolve a página inteira de uma área: aberta, mostra a página; em espera, o aviso (e a página só para o
// administrador, components/AreaEmEspera.tsx).
export default function PaginaEmEspera({ area, titulo, children }: { area: AreaDoSite; titulo: string; children: ReactNode }) {
  if (!EM_ESPERA[area]) return <>{children}</>;
  return <AreaEmEspera aviso={<AvisoDaPagina titulo={titulo} texto={TEXTO_EM_ESPERA[area]} />}>{children}</AreaEmEspera>;
}
