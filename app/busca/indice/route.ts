import type { ItemDaBusca } from "@/lib/busca";
import { listarCombos, precoDoCombo } from "@/lib/combos";
import { precoSemCentavosZerados } from "@/lib/format";
import { comAsCarreirasDosExtras, listarCarreiras, listarEventos, listarExcursoes, listarMateriais, listarProdutosDaLoja, listarSimuladosExtras, listarTurmas } from "@/lib/vitrine";

// O índice da busca do menu (lib/busca.ts): tudo o que está à venda, com nome, preço e link, vindo da vitrine da API.
// Fica em cache por 60 segundos, como as páginas (SEGUNDOS_DE_CACHE em lib/vitrine.ts): a busca não chama a API a cada
// visitante. Se uma parte da API não responder, ela fica de fora e o resto continua na busca.
export const dynamic = "force-static";
export const revalidate = 60;

const emReais = (centavos: number) => precoSemCentavosZerados(centavos / 100);

export async function GET() {
  const [turmas, carreiras, extras, combos, eventos, excursoes, materiais, loja] = await Promise.all([
    listarTurmas(),
    listarCarreiras(),
    listarSimuladosExtras(),
    listarCombos(),
    listarEventos(),
    listarExcursoes(),
    listarMateriais(),
    listarProdutosDaLoja(),
  ]);

  const itens: ItemDaBusca[] = [
    ...(turmas ?? []).map((t) => ({
      tipo: "turma" as const,
      titulo: t.nome,
      detalhe: [t.turno, t.statusLabel].filter(Boolean).join(" · "),
      // A situação (matrículas abertas, encerradas…) vai no detalhe; encerrada não é "esgotada".
      preco: t.preco,
      href: `/turmas/${t.slug}`,
      termos: [t.tag, t.concurso, t.modalidadeNome, t.desc].filter(Boolean).join(" "),
    })),
    // Os simulados presenciais por carreira: a Central de Simulados já abre na carreira.
    ...comAsCarreirasDosExtras(carreiras ?? [], extras ?? [])
      .filter((c) => c.edicoes.length > 0)
      .map((c) => ({
        tipo: "simulado" as const,
        titulo: c.nome,
        detalhe: `${c.edicoes.length} ${c.edicoes.length === 1 ? "edição" : "edições"}`,
        href: `/simulados?c=${encodeURIComponent(c.id)}`,
        termos: `simulado presencial ${c.curto}`,
      })),
    ...(extras ?? []).map(({ carreira, produto }) => ({
      tipo: "simulado" as const,
      titulo: produto.nome,
      detalhe: `Simulado individual · ${carreira.nome}`,
      preco: produto.preco,
      esgotado: produto.esgotado,
      href: `/simulados?modo=individual&c=${encodeURIComponent(carreira.id)}`,
      termos: `simulado ${carreira.nome} ${produto.desc}`,
    })),
    ...(combos ?? []).map((c) => ({
      tipo: "combo" as const,
      titulo: c.nome,
      preco: emReais(precoDoCombo(c)),
      esgotado: !c.disponivel,
      href: `/combos/${c.slug}`,
      termos: `combo ${c.descricao ?? ""}`,
    })),
    ...(eventos ?? []).map((e) => ({
      tipo: "evento" as const,
      titulo: e.nome,
      detalhe: e.statusLabel,
      preco: e.preco,
      href: `/eventos/${e.slug}`,
      termos: `${e.tag} ${e.desc}`,
    })),
    ...(excursoes ?? []).map((v) => ({
      tipo: "excursao" as const,
      titulo: v.titulo,
      detalhe: v.opcoes.map((o) => o.opcao).filter(Boolean).join(" ou ") || undefined,
      preco: v.opcoes.find((o) => o.preco)?.preco ?? undefined,
      href: `/excursoes/${v.opcoes[0].slug}`,
      termos: `excursao viagem prova ${v.concurso ?? ""}`,
    })),
    ...(materiais ?? []).map((p) => ({
      tipo: "material" as const,
      titulo: p.nome,
      detalhe: p.formatos?.map((f) => (f === "digital" ? "Digital" : "Impresso")).join(" e "),
      preco: p.preco,
      esgotado: p.esgotado,
      href: `/produtos/${p.slug}`,
      termos: `${p.tag} ${p.desc} apostila material`,
    })),
    // Os planos das Mentorias são fixos (como no menu do topo), sem preço aqui: o preço fica na página delas.
    { tipo: "mentoria", titulo: "Mentoria", detalhe: "12 meses de acesso", href: "/mentorias", termos: "mentorias do quad cronograma estrategia" },
    { tipo: "mentoria", titulo: "Mentoria+", detalhe: "3 meses de acesso", href: "/mentorias", termos: "mentoria plus mentorias do quad" },
    { tipo: "mentoria", titulo: "Combo Mentoria + Mentoria Plus", detalhe: "12 meses + 3 meses Plus", href: "/mentorias", termos: "mentorias do quad" },
    ...(loja ?? []).map((p) => ({
      tipo: "loja" as const,
      titulo: p.nome,
      detalhe: p.categoria,
      preco: p.preco === null ? undefined : precoSemCentavosZerados(p.preco),
      esgotado: p.estoque === 0,
      href: `/loja/${p.id}`,
      termos: `loja ${p.descricao ?? ""}`,
    })),
  ];

  return Response.json(itens);
}
