// Sugestões de venda (pedido do Samuel de 25/11/2026, docs da API "pedido-sugestoes-de-venda"): o up-sell ("Mais
// completo"), o cross-sell ("Leve junto") e o down-sell ("Mais em conta") cadastrados no Painel. A API decide o que
// sugerir para cada produto (o gatilho) e já tira o que não está à venda e o que o aluno tem; o site só mostra.
// A leitura é no navegador, depois da página: a resposta muda por aluno, então não pode entrar no cache das páginas.
import { fetchAutenticado, temSessao } from "./auth";
import type { CartItem } from "./cart";
import { EM_ESPERA, type AreaDoSite } from "./em-espera";
import { API_URL } from "./http";
import { alvoDoItem, idDoItem } from "./itens";
import { emReais, type Alvo, type Fechamento } from "./loja";

// Uma chave por lugar: false tira as sugestões daquele lugar do ar sem desfazer o resto.
export const SUGESTOES_NO_SITE = {
  // Na página do produto à venda: "Mais completo" e "Leve junto".
  produto: true,
  // Na página do produto esgotado: "Mais em conta".
  esgotado: true,
  carrinho: true,
  // Desligado até a reserva do item novo, com o cupom mantido, estar provada contra a API (lib/usePedido.ts).
  checkout: false,
  pixVencido: true,
};

export type LugarDaSugestao = keyof typeof SUGESTOES_NO_SITE;
export type TipoDeSugestao = "UP_SELL" | "CROSS_SELL" | "DOWN_SELL";
type TipoDoAlvo = "ITEM" | "TURMA" | "EVENTO" | "SIMULADO";
type Plataforma = "IMPRESSO" | "DIGITAL";

export type VariacaoSugerida = { id: string; nome: string; restantes?: number | null; precoEmCentavos?: number | null };

export type SugestaoDaVitrine = {
  id: string;
  tipo: TipoDeSugestao;
  chamada: string | null;
  gatilho: { tipo: TipoDoAlvo; id: string; plataforma: Plataforma | null };
  // null quando o sugerido é um combo.
  produto: {
    tipo: TipoDoAlvo;
    id: string;
    nome: string;
    slug: string | null;
    imagemUrl: string | null;
    precoEmCentavos: number | null;
    aVenda: boolean;
    // No simulado: a inscrição presencial (true) ou a versão de estudo (false).
    presencial: boolean | null;
    // No item: MATERIAL, MODULOS, EXCURSOES, OUTROS…
    tipoDeItem: string | null;
    plataforma: Plataforma | null;
    variacoes: VariacaoSugerida[] | null;
  } | null;
  combo: {
    id: string;
    nome: string;
    slug: string | null;
    imagemUrl: string | null;
    aPagarEmCentavos: number;
    precoCheioEmCentavos: number | null;
    economiaEmCentavos: number | null;
  } | null;
};

// "TURMA:<id>", "ITEM:<id>:DIGITAL": o alvo como a API recebe em ?alvo=.
export function alvoEmTexto(alvo: Alvo): string | null {
  if (alvo.atividade) return `${alvo.atividade.tipo}:${alvo.atividade.id}`;
  if (alvo.itemId) return `ITEM:${alvo.itemId}${alvo.plataforma ? `:${alvo.plataforma}` : ""}`;
  return null;
}

// Os alvos dos itens do carrinho, sem repetir.
export function alvosDoCarrinho(itens: CartItem[]): string[] {
  const alvos = itens.map((i) => alvoDoItem(i)).map((a) => (a ? alvoEmTexto(a) : null));
  return [...new Set(alvos.filter((a): a is string => !!a))];
}

const MAXIMO_DE_ALVOS = 20;

async function lerDaApi(caminho: string): Promise<Response> {
  // Com sessão, a API tira o que o aluno já tem; sem sessão, a mesma rota responde para todos.
  if (temSessao()) return fetchAutenticado(caminho, { cache: "no-store" });
  return fetch(`${API_URL}${caminho}`, { cache: "no-store", credentials: "include" });
}

// null = falhou (o bloco simplesmente não aparece).
export async function listarSugestoes(alvos: string[]): Promise<SugestaoDaVitrine[] | null> {
  const lista = [...new Set(alvos)].slice(0, MAXIMO_DE_ALVOS);
  if (lista.length === 0) return [];
  try {
    const res = await lerDaApi(`/api/loja/vitrine/sugestoes?${lista.map((a) => `alvo=${encodeURIComponent(a)}`).join("&")}`);
    if (!res.ok) return null;
    const corpo = await res.json();
    return Array.isArray(corpo) ? corpo : null;
  } catch {
    return null;
  }
}

// "nao-encontrada" = a sugestão saiu ou nunca existiu; null = falhou.
export async function buscarSugestao(id: string): Promise<SugestaoDaVitrine | "nao-encontrada" | null> {
  try {
    const res = await lerDaApi(`/api/loja/vitrine/sugestoes/${encodeURIComponent(id)}`);
    // 400: o código do link nem é um id válido (link cortado ou digitado errado); para o aluno, é o mesmo aviso.
    if (res.status === 404 || res.status === 400) return "nao-encontrada";
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

const ehMaterial = (p: NonNullable<SugestaoDaVitrine["produto"]>) => p.tipoDeItem === "MATERIAL" || p.tipoDeItem === "MODULOS" || !!p.plataforma;

// A área do site em que o sugerido mora (para não mostrar o que está em espera, lib/em-espera.ts).
function areaDo(s: SugestaoDaVitrine): AreaDoSite | null {
  const p = s.produto;
  if (!p || p.tipo !== "ITEM") return null;
  if (ehMaterial(p)) return "materiais";
  if (p.tipoDeItem === "MENTORIA") return "mentorias";
  if (p.tipoDeItem === "OUTROS") return "loja";
  return null;
}

export function emAreaEmEspera(s: SugestaoDaVitrine) {
  const area = areaDo(s);
  return area !== null && EM_ESPERA[area];
}

// O endereço do sugerido no site (as rotas que já existem). null = não tem página própria.
export function paginaDoSugerido(s: SugestaoDaVitrine): string | null {
  if (s.combo) return s.combo.slug ? `/combos/${s.combo.slug}` : null;
  const p = s.produto;
  if (!p) return null;
  if (p.tipo === "SIMULADO") return "/simulados";
  if (!p.slug) return null;
  if (p.tipo === "TURMA") return `/turmas/${p.slug}`;
  if (p.tipo === "EVENTO") return `/eventos/${p.slug}`;
  if (ehMaterial(p)) return `/produtos/${p.slug}`;
  if (p.tipoDeItem === "EXCURSOES") return `/excursoes/${p.slug}`;
  if (p.tipoDeItem === "OUTROS") return `/loja/${p.slug}`;
  return null;
}

// O que reservar para o sugerido, sempre explícito (não depende do formato do id do carrinho).
export function alvoDaSugestao(s: SugestaoDaVitrine, variacaoId?: string): Alvo | null {
  const p = s.produto;
  if (!p) return null;
  if (p.tipo === "ITEM") return { itemId: p.id, ...(p.plataforma ? { plataforma: p.plataforma } : {}), ...(variacaoId ? { variacaoId } : {}) };
  return { atividade: { tipo: p.tipo, id: p.id }, ...(variacaoId ? { variacaoId } : {}) };
}

// As variações que ainda têm estoque (a mesma regra da compra na loja).
export function variacoesAVenda(s: SugestaoDaVitrine): VariacaoSugerida[] {
  return (s.produto?.variacoes ?? []).filter((v) => v.restantes == null || v.restantes > 0);
}

export function precoDaSugestao(s: SugestaoDaVitrine, variacao?: VariacaoSugerida): number | null {
  if (s.combo) return s.combo.aPagarEmCentavos;
  return variacao?.precoEmCentavos ?? s.produto?.precoEmCentavos ?? null;
}

// O item do carrinho do sugerido, com o mesmo id que a página do produto usa: o mesmo produto não vira duas linhas.
export function itemDaSugestao(s: SugestaoDaVitrine, variacao?: VariacaoSugerida): Omit<CartItem, "quantidade"> | null {
  const p = s.produto;
  const alvo = alvoDaSugestao(s, variacao?.id);
  const centavos = precoDaSugestao(s, variacao);
  if (!p || !alvo || centavos === null) return null;
  const chave = p.slug ?? p.id;
  const preco = emReais(centavos);
  const imagem = p.imagemUrl ?? undefined;
  const nomeComVariacao = variacao ? `${p.nome} (${variacao.nome})` : p.nome;
  switch (p.tipo) {
    case "TURMA":
      return { id: idDoItem("turma", chave), tipo: "turma", nome: p.nome, preco, alvo, imagem };
    case "EVENTO":
      return { id: idDoItem("evento", chave), tipo: "evento", nome: nomeComVariacao, preco, alvo, imagem };
    case "SIMULADO":
      // A Central monta o id pela carreira e pela edição, que a sugestão não traz: o id aqui é o do simulado na API.
      return {
        id: `simulado:${p.id}:${p.presencial ? "presencial" : "pdf"}`,
        tipo: "simulado",
        nome: p.presencial ? `${p.nome} — Inscrição presencial` : `${p.nome} — PDF`,
        tag: p.presencial ? "Inscrição presencial" : "PDF · Download na área do aluno",
        preco,
        alvo,
        imagem,
      };
    case "ITEM":
      if (ehMaterial(p)) {
        const impresso = p.plataforma === "IMPRESSO";
        return {
          id: `${idDoItem("produto", chave)}${impresso ? ":impresso" : ""}`,
          tipo: "produto",
          nome: p.nome,
          tag: impresso ? "Impresso · Retirar no Quad" : "PDF · Download na área do aluno",
          preco,
          formato: impresso ? "impresso" : "digital",
          alvo,
          imagem,
        };
      }
      if (p.tipoDeItem === "EXCURSOES") return { id: idDoItem("excursao", chave), tipo: "excursao", nome: p.nome, tag: "Embarque no Quad", preco, alvo, imagem };
      return {
        id: `loja:${chave}${variacao ? `:${variacao.nome}` : ""}`,
        tipo: "loja",
        nome: nomeComVariacao,
        tag: [variacao?.nome, "Retirar no Quad"].filter(Boolean).join(" · "),
        preco,
        alvo,
        imagem,
      };
  }
}

// O alvo do sugerido em texto, para saber se ele já está no carrinho (e então não sugerir de novo).
export function alvoDoSugeridoEmTexto(s: SugestaoDaVitrine): string | null {
  const a = alvoDaSugestao(s);
  return a ? alvoEmTexto(a) : null;
}

const TIPOS_DE_ALVO: TipoDoAlvo[] = ["TURMA", "EVENTO", "SIMULADO"];

// Os alvos das compras de um fechamento (item.id é o id do alvo; item.tipo diz se é turma, evento ou simulado; o
// resto é item da loja, com a plataforma no material).
export function alvosDasCompras(f: Pick<Fechamento, "compras">): string[] {
  const alvos = f.compras.map(({ item }) => {
    if (!item.id) return null;
    const tipo = (item.tipo ?? "").toUpperCase() as TipoDoAlvo;
    if (TIPOS_DE_ALVO.includes(tipo)) return `${tipo}:${item.id}`;
    return `ITEM:${item.id}${item.plataforma ? `:${item.plataforma}` : ""}`;
  });
  return [...new Set(alvos.filter((a): a is string => !!a))];
}

// Os itens do carrinho do site que um fechamento pago já comprou (ex.: as partes do combo): saem do carrinho, para o
// aluno não comprar de novo o avulso que o combo cobriu.
export function idsJaComprados(itens: CartItem[], f: Pick<Fechamento, "compras">): string[] {
  const pagos = new Set(alvosDasCompras(f));
  // No material, a compra pode vir sem a plataforma: vale o item inteiro.
  const semPlataforma = new Set([...pagos].filter((a) => a.split(":").length === 2));
  return itens
    .filter((i) => {
      const a = alvoDoItem(i);
      const texto = a ? alvoEmTexto(a) : null;
      if (!texto) return false;
      return pagos.has(texto) || semPlataforma.has(texto.split(":").slice(0, 2).join(":"));
    })
    .map((i) => i.id);
}
