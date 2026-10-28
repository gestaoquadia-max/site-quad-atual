import type { MetadataRoute } from "next";
import { CAMINHOS_PRIVADOS, SITE_DE_TESTE, URL_DO_SITE } from "@/lib/seo";

// Buscadores podem ler o site todo, menos a área do aluno, o carrinho, o checkout e os links de senha e e-mail.
// No site de teste, nada.
export default function robots(): MetadataRoute.Robots {
  if (SITE_DE_TESTE) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: CAMINHOS_PRIVADOS },
    sitemap: `${URL_DO_SITE}/sitemap.xml`,
  };
}
