import type { MetadataRoute } from "next";
import { CAMINHOS_PRIVADOS, URL_DO_SITE } from "@/lib/seo";

// Buscadores podem ler o site todo, menos a área do aluno, o carrinho, o checkout e os links de senha e e-mail.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: CAMINHOS_PRIVADOS },
    sitemap: `${URL_DO_SITE}/sitemap.xml`,
  };
}
