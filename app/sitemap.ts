import type { MetadataRoute } from "next";
import { posts, professores } from "@/lib/data";
import { URL_DO_SITE } from "@/lib/seo";
import { listarEventos, listarMateriais, listarTurmas } from "@/lib/vitrine";

const PAGINAS_FIXAS = ["/", "/turmas", "/produtos", "/simulados", "/eventos", "/cursos", "/aprovados", "/blog", "/sobre", "/contato", "/termos", "/privacidade", "/entrar", "/cadastro"];

// Igual a SEGUNDOS_DE_CACHE (lib/vitrine.ts): turmas e eventos novos entram sem precisar publicar o site de novo.
export const revalidate = 60;

// Lista das páginas públicas para os buscadores. As de detalhe seguem o mesmo filtro das próprias páginas
// (sem `detalhe`, a página responde 404). Turmas, eventos e materiais vêm da vitrine da API; se ela não responder, ficam de fora.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [turmas, eventos, materiais] = await Promise.all([listarTurmas(), listarEventos(), listarMateriais()]);
  const caminhos = [
    ...PAGINAS_FIXAS,
    ...(turmas ?? []).map((t) => `/turmas/${t.slug}`),
    ...(materiais ?? []).map((p) => `/produtos/${p.slug}`),
    ...(eventos ?? []).map((e) => `/eventos/${e.slug}`),
    ...professores.map((p) => `/professores/${p.slug}`),
    ...posts.map((p) => `/blog/${p.slug}`),
  ];
  return caminhos.map((caminho) => ({ url: `${URL_DO_SITE}${caminho === "/" ? "" : caminho}` }));
}
