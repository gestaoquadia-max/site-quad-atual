import PaginaEmBreve from "@/components/PaginaEmBreve";
import { LINK_DAS_MENTORIAS } from "@/lib/conteudo";
import { NAO_INDEXAR } from "@/lib/seo";

// Página nova do redesenho (Etapa 13, Bloco 8). Enquanto não fica pronta, leva à landing das Mentorias.
export const metadata = { title: "Mentorias do Quad", robots: NAO_INDEXAR };

export default function MentoriasPage() {
  return (
    <PaginaEmBreve
      titulo="Mentorias do Quad"
      texto="A página das Mentorias está chegando ao site. Enquanto isso, conheça os planos na página oficial das Mentorias."
      acao={{ href: LINK_DAS_MENTORIAS, label: "Conhecer as Mentorias" }}
    />
  );
}
