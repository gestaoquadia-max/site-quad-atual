import Carrinho from "@/components/compra/Carrinho";
import { listarCarreiras, listarEventosComOpcoes, listarExcursoes, listarMateriais, listarProdutosDaLoja } from "@/lib/vitrine";
import { idDoItem } from "@/lib/itens";
import { CARTAO_DOS_SIMULADOS } from "@/lib/eventos";

export const revalidate = 60;

// As edições de simulado vêm da API para conferir se o que está no carrinho ainda está à venda.
// As imagens (12/11/2026): a miniatura de cada item, pelo id dele no carrinho, saída do cadastro na API (arte do evento
// e da excursão, capa do material, foto do produto da loja). Assim vale também para o que já estava no carrinho.
export default async function CarrinhoPage() {
  const [carreiras, eventos, viagens, materiais, loja] = await Promise.all([
    listarCarreiras(),
    listarEventosComOpcoes(),
    listarExcursoes(),
    listarMateriais(),
    listarProdutosDaLoja(),
  ]);

  const imagens: Record<string, string> = {};
  const guardar = (id: string, imagem: string | null | undefined) => {
    if (imagem) imagens[id] = imagem;
  };
  for (const e of eventos ?? []) guardar(idDoItem("evento", e.slug), e.imagem);
  for (const v of viagens ?? []) for (const o of v.opcoes) guardar(idDoItem("excursao", o.slug), o.imagemUrl);
  for (const p of materiais ?? []) {
    guardar(idDoItem("produto", p.slug), p.imagem);
    for (const oferta of Object.values(p.ofertas ?? {})) if (oferta) guardar(idDoItem("produto", oferta.slug), p.imagem);
  }
  for (const p of loja ?? []) guardar(`loja:${p.id}`, p.imagemUrl);

  return <Carrinho carreiras={carreiras} imagens={imagens} capaDosSimulados={CARTAO_DOS_SIMULADOS.imagem} />;
}
