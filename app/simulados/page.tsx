import PaginaEmBreve from "@/components/PaginaEmBreve";
import { NAO_INDEXAR } from "@/lib/seo";

// Central de Simulados do redesenho (Etapa 13, Bloco 3).
export const metadata = { title: "Simulados do Quad", robots: NAO_INDEXAR };

export default function SimuladosPage() {
  return (
    <PaginaEmBreve
      titulo="Simulados do Quad"
      texto="Simulados presenciais, individuais e combos, organizados por carreira. A central de simulados está chegando ao site."
      acao={{ href: "/eventos", label: "Ver a agenda de eventos" }}
    />
  );
}
