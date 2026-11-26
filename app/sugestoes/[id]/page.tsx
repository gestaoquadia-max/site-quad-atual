import type { Metadata } from "next";
import PaginaDaSugestao from "@/components/sugestoes/PaginaDaSugestao";
import { NAO_INDEXAR } from "@/lib/seo";

export const metadata: Metadata = { title: "Sugestão para você", description: "Uma sugestão do Quad Concursos para a sua preparação.", robots: NAO_INDEXAR };

// /sugestoes/{id}: o destino do link do e-mail de sugestão (enviado pela API). A sugestão muda por aluno, então é lida
// no navegador; fica fora do sitemap e dos buscadores.
export default async function SugestaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PaginaDaSugestao id={id} />;
}
