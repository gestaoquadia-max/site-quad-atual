// Busca do site (18/11/2026): a lupa do menu do topo (components/BuscaDoSite.tsx) procura em tudo o que está à venda.
// O índice é montado no servidor a partir da vitrine da API (app/busca/indice/route.ts, em cache como as páginas) e
// baixado só quando o visitante abre a busca; a procura roda no navegador, sem chamar a API a cada letra.
// Sem acento e sem diferenciar maiúsculas ("portugues" acha "Português"), e cada palavra digitada precisa aparecer
// ("simulado pmba" acha o que tem as duas).

export type TipoNaBusca = "turma" | "simulado" | "combo" | "evento" | "excursao" | "material" | "mentoria" | "loja";

export type ItemDaBusca = {
  tipo: TipoNaBusca;
  titulo: string;
  // Uma linha curta abaixo do título (concurso, turno, data, formato…).
  detalhe?: string;
  // Já em texto ("R$ 129", "Gratuito"); sem preço cadastrado, não aparece.
  preco?: string;
  esgotado?: boolean;
  href: string;
  // Texto extra onde também se procura (descrição, concurso), sem aparecer na tela.
  termos?: string;
};

// Ordem dos grupos na lista de resultados.
export const GRUPOS_DA_BUSCA: { tipo: TipoNaBusca; rotulo: string }[] = [
  { tipo: "turma", rotulo: "Turmas presenciais" },
  { tipo: "simulado", rotulo: "Simulados" },
  { tipo: "combo", rotulo: "Combos" },
  { tipo: "evento", rotulo: "Eventos" },
  { tipo: "excursao", rotulo: "Excursões" },
  { tipo: "material", rotulo: "Materiais" },
  { tipo: "mentoria", rotulo: "Mentorias do Quad" },
  { tipo: "loja", rotulo: "Loja" },
];

export function normalizarParaBusca(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Os resultados na ordem dos grupos; dentro de cada grupo, primeiro o que tem a busca no título (e, entre esses, o que
// começa por ela).
export function procurar(indice: ItemDaBusca[], busca: string): ItemDaBusca[] {
  const termo = normalizarParaBusca(busca);
  if (!termo) return [];
  const palavras = termo.split(" ");
  const pontuados = indice.flatMap((item) => {
    const titulo = normalizarParaBusca(item.titulo);
    const tudo = `${titulo} ${normalizarParaBusca(`${item.detalhe ?? ""} ${item.termos ?? ""}`)}`;
    if (!palavras.every((p) => tudo.includes(p))) return [];
    const pontos = titulo.startsWith(termo) ? 0 : titulo.includes(termo) ? 1 : palavras.every((p) => titulo.includes(p)) ? 2 : 3;
    return [{ item, pontos }];
  });
  const ordemDoGrupo = (t: TipoNaBusca) => GRUPOS_DA_BUSCA.findIndex((g) => g.tipo === t);
  return pontuados
    .sort((a, b) => ordemDoGrupo(a.item.tipo) - ordemDoGrupo(b.item.tipo) || a.pontos - b.pontos || a.item.titulo.localeCompare(b.item.titulo, "pt-BR"))
    .map((p) => p.item);
}
