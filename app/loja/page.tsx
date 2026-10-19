import PaginaEmBreve from "@/components/PaginaEmBreve";
import { NAO_INDEXAR } from "@/lib/seo";

// Página nova do redesenho (Etapa 13, Bloco 8).
export const metadata = { title: "Loja Quad", robots: NAO_INDEXAR };

export default function LojaPage() {
  return (
    <PaginaEmBreve
      titulo="Loja Quad"
      texto="Camisas, canecas e outros produtos do Quad, com retirada na sede. A loja está chegando ao site."
      acao={{ href: "/contato", label: "Fale com a gente" }}
    />
  );
}
