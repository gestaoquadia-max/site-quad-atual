import type { Metadata } from "next";

export const NOME_DO_SITE = "Quad Concursos";

// Endereço público do site, base dos links absolutos (compartilhamento, sitemap e endereço canônico).
export const URL_DO_SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://quadconcursos.com.br").replace(/\/$/, "");

export const DESCRICAO_DO_SITE =
  "Cursos presenciais, materiais e treinamento direto ao ponto para quem quer entrar nas forças de segurança. Feira de Santana, Bahia.";

// Fora dos buscadores: bloqueados no robots.txt e marcados com NAO_INDEXAR nas próprias páginas.
export const CAMINHOS_PRIVADOS = ["/aluno", "/carrinho", "/checkout", "/esqueci-senha", "/redefinir-senha", "/confirmar-email"];

export const NAO_INDEXAR: Metadata["robots"] = { index: false, follow: false };

// Buscadores mostram por volta de 155 caracteres; corta na última palavra inteira.
export function resumir(texto: string, limite = 155) {
  const limpo = texto.replace(/\s+/g, " ").trim();
  if (limpo.length <= limite) return limpo;
  return limpo.slice(0, limite - 1).replace(/\s+\S*$/, "") + "…";
}

// Gerada por app/opengraph-image.tsx.
const IMAGEM_DE_COMPARTILHAMENTO = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Quad Concursos — Preparação para concursos militares em Feira de Santana, Bahia",
};

// Metadados de uma página pública. `titulo` sem o nome do site: o layout acrescenta " — Quad Concursos".
// O Open Graph é repetido por inteiro, com a imagem, porque o da página substitui o do layout (não é mesclado).
export function metadadosDaPagina({
  titulo,
  descricao,
  caminho,
}: {
  titulo: string;
  descricao: string;
  caminho: string;
}): Metadata {
  const description = resumir(descricao);
  return {
    title: titulo,
    description,
    alternates: { canonical: caminho },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: NOME_DO_SITE,
      title: `${titulo} — ${NOME_DO_SITE}`,
      description,
      url: caminho,
      images: [IMAGEM_DE_COMPARTILHAMENTO],
    },
    twitter: { card: "summary_large_image", images: [IMAGEM_DE_COMPARTILHAMENTO] },
  };
}
