import type { MetadataRoute } from "next";
import { URL_DO_SITE } from "@/lib/seo";
import { listarEventos, listarMateriais, listarProdutosDaLoja, listarProfessores, listarTurmas } from "@/lib/vitrine";

const PAGINAS_FIXAS = ["/", "/turmas", "/produtos", "/simulados", "/eventos", "/mentorias", "/loja", "/aprovados", "/sobre", "/contato", "/termos", "/privacidade", "/entrar", "/cadastro"];

// Igual a SEGUNDOS_DE_CACHE (lib/vitrine.ts): turmas e eventos novos entram sem precisar publicar o site de novo.
export const revalidate = 60;

// Lista das páginas públicas para os buscadores. As de detalhe seguem o mesmo filtro das próprias páginas
// (sem `detalhe`, a página responde 404). Turmas, eventos, materiais, produtos da loja e professores vêm da vitrine da API; se ela não responder, ficam de fora.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [turmas, eventos, materiais, loja, professores] = await Promise.all([listarTurmas(), listarEventos(), listarMateriais(), listarProdutosDaLoja(), listarProfessores()]);
  const caminhos = [
    ...PAGINAS_FIXAS,
    ...(turmas ?? []).map((t) => `/turmas/${t.slug}`),
    ...(materiais ?? []).map((p) => `/produtos/${p.slug}`),
    ...(eventos ?? []).map((e) => `/eventos/${e.slug}`),
    ...(loja ?? []).map((p) => `/loja/${p.id}`),
    ...(professores ?? []).map((p) => `/professores/${p.slug}`),
  ];
  return caminhos.map((caminho) => ({ url: `${URL_DO_SITE}${caminho === "/" ? "" : caminho}` }));
}
