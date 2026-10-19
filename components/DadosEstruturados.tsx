// Imprime dados estruturados (JSON-LD) para os buscadores. O "<" é escapado para um texto do conteúdo
// não conseguir fechar a tag <script> (recomendação do guia de JSON-LD do Next.js).
export default function DadosEstruturados({ dados }: { dados: object | null }) {
  if (!dados) return null;
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dados).replace(/</g, "\\u003c") }} />
  );
}
