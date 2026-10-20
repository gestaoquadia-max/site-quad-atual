// Turmas, eventos e simulados à venda, lidos da vitrine pública da API (sem login).
// Rotas e campos: docs/mapa-api-conteudo.md. O formato final pedido ao backend está em docs/contrato-api-conteudo.md;
// enquanto ele não chega, os textos de venda que a vitrine não tem (incluso, programação, professores) ficam vazios
// e as páginas escondem essas seções.
import type { Evento, Produto, Turma } from "./data";
import type { ProdutoDaLoja } from "./conteudo";
import type { Carreira, Edicao } from "./simulados";
import { formatarHora, precoSemCentavosZerados } from "./format";
import { API_URL, lerErro } from "./http";

// As páginas são refeitas no servidor no máximo a cada minuto: vagas e preços ficam atualizados sem
// consultar a API a cada visita.
export const SEGUNDOS_DE_CACHE = 60;

type TipoDeAtividade = "TURMA" | "EVENTO" | "SIMULADO";

// Resposta da vitrine em 19/10/2026. `preco` em reais; as vagas são as de quem paga em reais (cartão, PIX,
// boleto e diamantes). Os campos de Quad Coins são do app Viver o Quad e o site ignora.
type AtividadeDaVitrine = {
  tipo: TipoDeAtividade;
  id: string;
  nome: string;
  imagemUrl: string | null;
  preco: number | null;
  vagas: number | null;
  vendidas: number | null;
  restantes: number | null;
  detalhe: {
    // TURMA: NIVELAMENTO, REGULAR, QUESTOES ou ISOLADAS. EVENTO e SIMULADO: PRESENCIAL ou ONLINE.
    modalidade?: string | null;
    turnos?: string[] | null;
    descricao?: string | null;
    // TURMA e EVENTO: datas ("2026-07-06"). SIMULADO: horas ("08:00:00"), com a data em `data`.
    inicio?: string | null;
    fim?: string | null;
    data?: string | null;
    horaInicio?: string | null;
    horaFim?: string | null;
  } | null;
};

type Pagina<T> = { conteudo: T[] };

const NAO_ENCONTRADA = "nao-encontrada";

async function lerDaVitrine<T>(caminho: string): Promise<T | typeof NAO_ENCONTRADA> {
  if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL não está definida.");
  const res = await fetch(`${API_URL}${caminho}`, { next: { revalidate: SEGUNDOS_DE_CACHE } });
  // Id inexistente responde 404; id em formato inválido, 400.
  if (res.status === 404 || res.status === 400) return NAO_ENCONTRADA;
  if (!res.ok) throw await lerErro(res, "Não foi possível carregar a vitrine.");
  return res.json();
}

async function listar(tipo: TipoDeAtividade): Promise<AtividadeDaVitrine[]> {
  const pagina = await lerDaVitrine<Pagina<AtividadeDaVitrine>>(`/api/loja/vitrine/atividades?tipo=${tipo}&tamanho=100`);
  return pagina === NAO_ENCONTRADA ? [] : pagina.conteudo;
}

async function buscar(tipo: TipoDeAtividade, id: string): Promise<AtividadeDaVitrine | null> {
  const atividade = await lerDaVitrine<AtividadeDaVitrine>(`/api/loja/vitrine/atividades/${tipo}/${id}`);
  return atividade === NAO_ENCONTRADA ? null : atividade;
}

// ---------- Endereço das páginas ----------

// A API ainda não tem slug (pedido no contrato, item 1). Até lá, o endereço é o nome seguido do id:
// /turmas/patamo-6c29678d-31d5-4a62-b4a7-2cbf21650cff. Só o id importa para achar a atividade.
const UUID_NO_FIM = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

function slugDoNome(nome: string) {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function slugDa(a: AtividadeDaVitrine) {
  const nome = slugDoNome(a.nome);
  return nome ? `${nome}-${a.id}` : a.id;
}

function idDoSlug(slug: string) {
  return slug.match(UUID_NO_FIM)?.[1]?.toLowerCase() ?? null;
}

// ---------- Textos ----------

const MESES = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

// "2026-07-06" → "06 JUL"
function diaEMes(iso: string) {
  const [, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia} ${MESES[Number(mes) - 1]}`;
}

// "2026-07-06" → "06/07"
function diaBarraMes(iso: string) {
  const [, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia}/${mes}`;
}

const precoEmTexto = precoSemCentavosZerados;

function mesesEntre(inicio: string, fim: string) {
  const dias = (Date.parse(fim) - Date.parse(inicio)) / 86_400_000;
  return Math.max(1, Math.round(dias / 30.44));
}

const TIPO_DE_TURMA: Record<string, string> = {
  NIVELAMENTO: "Nivelamento",
  REGULAR: "Regular",
  QUESTOES: "Questões",
  ISOLADAS: "Isoladas",
};

// Etiqueta do cartão ("Turma de questões · Presencial").
const ETIQUETA_DA_TURMA: Record<string, string> = {
  NIVELAMENTO: "Turma de nivelamento",
  REGULAR: "Turma regular",
  QUESTOES: "Turma de questões",
  ISOLADAS: "Aulas isoladas",
};

const TURNO: Record<string, string> = { MANHA: "Manhã", TARDE: "Tarde", NOITE: "Noite", INTEGRAL: "Integral" };

const FORMATO: Record<string, string> = { PRESENCIAL: "Presencial", ONLINE: "Online", HIBRIDO: "Híbrido" };

function rotulo(mapa: Record<string, string>, valor: string | null | undefined) {
  if (!valor) return "";
  return mapa[valor] ?? valor.charAt(0) + valor.slice(1).toLowerCase();
}

function situacao(a: AtividadeDaVitrine, abertaLabel: string): Pick<Turma, "status" | "statusLabel"> {
  // A vitrine só traz o que está à venda: "em breve" e "encerrada" dependem do campo `situacao` pedido no contrato.
  if (a.restantes !== null && a.restantes <= 0) return { status: "encerrada", statusLabel: "Esgotada" };
  if (a.restantes !== null) {
    return { status: "aberta", statusLabel: a.restantes === 1 ? "1 vaga restante" : `${a.restantes} vagas restantes` };
  }
  return { status: "aberta", statusLabel: abertaLabel };
}

function vagasDa(a: AtividadeDaVitrine) {
  if (a.vagas === null || a.vagas <= 0) return {};
  return { vagasTotal: a.vagas, vagasOcupadas: Math.min(a.vendidas ?? 0, a.vagas) };
}

// ---------- Turmas ----------

// Enquanto a API não traz a modalidade (pedido no contrato), ela sai do nome: "Patamo - CFO" → PATAMO.
function modalidadeDoNome(nome: string): Turma["modalidade"] {
  const n = slugDoNome(nome);
  if (n.includes("rondesp")) return "rondesp";
  if (n.includes("patamo")) return "patamo";
  if (n.includes("bope")) return "bope";
  return undefined;
}

// O nome do concurso só sai da API com login (docs/mapa-api-conteudo.md). Até lá, vem do nome e da descrição.
function concursoDaTurma(nome: string, descricao: string) {
  const texto = slugDoNome(`${nome} ${descricao}`);
  if (/\bcfo\b|oficia/.test(texto)) return "CFO PMBA";
  if (/\binvestigador\b|\bpcba\b|\bpc-ba\b/.test(texto)) return "Investigador PCBA";
  if (/\bsd\b|soldado|\bcfp\b/.test(texto)) return "Soldado PMBA";
  return undefined;
}

function paraTurma(a: AtividadeDaVitrine): Turma {
  const d = a.detalhe ?? {};
  const tipo = rotulo(TIPO_DE_TURMA, d.modalidade);
  const turnos = (d.turnos ?? []).map((t) => rotulo(TURNO, t)).join(" e ");
  const meses = d.inicio && d.fim ? mesesEntre(d.inicio, d.fim) : null;
  const duracao = meses === null ? null : meses === 1 ? "1 mês" : `${meses} meses`;
  const vagas = vagasDa(a);

  const resumo = [
    turnos,
    d.inicio && `Início ${diaBarraMes(d.inicio)}`,
    duracao,
    vagas.vagasTotal && `${vagas.vagasTotal} vagas`,
  ].filter(Boolean);

  const specs = [
    d.inicio && { label: "Início", valor: diaEMes(d.inicio) },
    d.fim && { label: "Término", valor: diaEMes(d.fim) },
    turnos && { label: "Turno", valor: turnos },
    duracao && { label: "Duração", valor: duracao },
    tipo && { label: "Tipo de turma", valor: tipo },
    vagas.vagasTotal !== undefined && {
      label: "Vagas restantes",
      valor: `${vagas.vagasTotal - vagas.vagasOcupadas} de ${vagas.vagasTotal}`,
      destaque: true,
    },
  ].filter((s): s is { label: string; valor: string; destaque?: boolean } => Boolean(s));

  return {
    slug: slugDa(a),
    modalidade: modalidadeDoNome(a.nome),
    concurso: concursoDaTurma(a.nome, d.descricao ?? ""),
    turno: turnos || undefined,
    inicio: d.inicio ? `${diaBarraMes(d.inicio)}/${d.inicio.slice(0, 4)}` : undefined,
    imagem: a.imagemUrl ?? undefined,
    tag: [d.modalidade && (ETIQUETA_DA_TURMA[d.modalidade] ?? `Turma ${tipo.toLowerCase()}`), "Presencial"]
      .filter(Boolean)
      .join(" · "),
    nome: a.nome,
    desc: resumo.join(" · "),
    preco: a.preco === null ? "Consulte" : precoEmTexto(a.preco),
    // A turma é cobrada pelo valor fechado da duração, nunca por mês.
    precoSufixo: duracao ? ` / ${duracao}` : undefined,
    ...situacao(a, "Matrículas abertas"),
    detalhe: {
      lead: d.descricao?.trim() || "Preparação presencial do Quad com rotina estruturada e professores especialistas na banca.",
      specs,
      ...vagas,
      incluso: [],
      professores: [],
    },
  };
}

// null = a API não respondeu. A página mostra um aviso em vez da lista.
export async function listarTurmas(): Promise<Turma[] | null> {
  try {
    return (await listar("TURMA")).map(paraTurma);
  } catch {
    return null;
  }
}

export async function buscarTurma(slug: string): Promise<Turma | null> {
  const id = idDoSlug(slug);
  if (!id) return null;
  const atividade = await buscar("TURMA", id);
  return atividade ? paraTurma(atividade) : null;
}

// ---------- Eventos e simulados ----------

function paraEvento(a: AtividadeDaVitrine): Evento {
  const d = a.detalhe ?? {};
  const simulado = a.tipo === "SIMULADO";
  // Simulado: data em `data`, horas em `inicio`/`fim`. Evento: datas em `inicio`/`fim`, horas em `horaInicio`/`horaFim`.
  const data = (simulado ? d.data : d.inicio) ?? null;
  const horaInicio = (simulado ? d.inicio : d.horaInicio) ?? null;
  const horaFim = (simulado ? d.fim : d.horaFim) ?? null;
  const dataFim = (simulado ? d.data : d.fim) ?? data;
  const formato = rotulo(FORMATO, d.modalidade) || "Presencial";
  const online = d.modalidade === "ONLINE";
  const horario = horaInicio ? [formatarHora(horaInicio), horaFim && formatarHora(horaFim)].filter(Boolean).join("–") : "";
  const gratuito = a.preco === 0;
  const vagas = vagasDa(a);
  const comHora = (dia: string | null, hora: string | null) => (dia && hora ? `${dia.slice(0, 10)}T${hora.slice(0, 5)}:00-03:00` : undefined);

  const specs = [
    data && { label: "Data", valor: diaEMes(data) },
    horario && { label: "Horário", valor: horario },
    { label: "Formato", valor: formato },
    vagas.vagasTotal !== undefined
      ? { label: "Vagas restantes", valor: `${vagas.vagasTotal - vagas.vagasOcupadas} de ${vagas.vagasTotal}`, destaque: true }
      : gratuito && { label: "Inscrição", valor: "Gratuita", destaque: true },
  ].filter((s): s is { label: string; valor: string; destaque?: boolean } => Boolean(s));

  const desc = [simulado ? "Simulado" : "Evento", data && diaBarraMes(data), horario, formato].filter(Boolean).join(" · ");

  return {
    slug: slugDa(a),
    tag: [data && diaEMes(data), formato].filter(Boolean).join(" · "),
    nome: a.nome,
    desc,
    preco: a.preco === null ? "Consulte" : gratuito ? "Gratuito" : precoEmTexto(a.preco),
    ...situacao(a, "Inscrições abertas"),
    detalhe: {
      inicio: comHora(data, horaInicio),
      fim: comHora(dataFim, horaFim),
      lead: d.descricao?.trim() || desc,
      sobre: [],
      specs,
      programacao: [],
      incluso: [],
      local: online
        ? { nome: "Online", endereco: "O link de acesso fica na área do aluno de quem se inscrever." }
        : { nome: "Quad Concursos — Feira de Santana", endereco: "Feira de Santana — BA · Endereço completo enviado por e-mail após a inscrição" },
      ...vagas,
    },
  };
}

// Agenda: só os eventos, do mais próximo ao mais distante. Os simulados ficam na Central de Simulados (listarCarreiras).
export async function listarEventos(): Promise<Evento[] | null> {
  try {
    return (await listar("EVENTO"))
      .map(paraEvento)
      .sort((a, b) => (a.detalhe?.inicio ?? "9999").localeCompare(b.detalhe?.inicio ?? "9999"));
  } catch {
    return null;
  }
}

export async function buscarEvento(slug: string): Promise<Evento | null> {
  const id = idDoSlug(slug);
  if (!id) return null;
  const atividade = await buscar("EVENTO", id);
  return atividade ? paraEvento(atividade) : null;
}

// ---------- Simulados ----------

// Na API cada edição é um simulado, e a carreira ainda não é um campo: vem do nome, no padrão
// "Simulado 77 — Soldado PMBA". Sem esse padrão, o simulado entra em "Outros simulados".
function edicaoDoSimulado(a: AtividadeDaVitrine, ordem: number): { carreira: string; edicao: Edicao } {
  const d = a.detalhe ?? {};
  const numero = Number(a.nome.match(/simulado\s*(?:n[ºo°]?\s*)?(\d+)/i)?.[1] ?? ordem + 1);
  const carreira = a.nome.split(/\s+[—–-]\s+/)[1]?.trim() || "Outros simulados";
  const online = d.modalidade === "ONLINE";
  return {
    carreira,
    edicao: {
      numero,
      data: d.data ?? null,
      horario: d.inicio ? formatarHora(d.inicio) : null,
      local: online ? "Online" : "Quad Concursos",
      // Estar na vitrine = à venda (com preço e vagas). "Esgotado" sai das vagas restantes.
      inscricao: "abertas",
      publicado: true,
      presencial: { preco: a.preco, vagas: a.vagas, vagasRestantes: a.restantes, sku: a.id },
    },
  };
}

export async function listarCarreiras(): Promise<Carreira[] | null> {
  try {
    const porCarreira = new Map<string, Carreira>();
    (await listar("SIMULADO")).forEach((a, i) => {
      const { carreira, edicao } = edicaoDoSimulado(a, i);
      const id = slugDoNome(carreira);
      if (!porCarreira.has(id)) porCarreira.set(id, { id, nome: `Simulado Presencial — ${carreira}`, curto: carreira, edicoes: [] });
      porCarreira.get(id)!.edicoes.push(edicao);
    });
    return [...porCarreira.values()];
  } catch {
    return null;
  }
}

// ---------- Itens: materiais impressos (MODULOS) e Loja (OUTROS) ----------

type ItemDaVitrine = {
  id: string;
  nome: string;
  // MODULOS = material impresso entregue no balcão; OUTROS = produto da loja. MENTORIA e SKIN são do app.
  tipo: "MODULOS" | "EXCURSOES" | "TREINAMENTO_TAF" | "MENTORIA" | "OUTROS" | "SKIN";
  descricao: string | null;
  imagemUrl: string | null;
  preco: number | null;
  ofertadas: number | null;
  vendidas: number | null;
  restantes: number | null;
  variacoes: { id: string; nome: string; ofertadas: number | null; vendidas: number | null; restantes: number | null }[];
};

async function listarItens(): Promise<ItemDaVitrine[]> {
  const pagina = await lerDaVitrine<Pagina<ItemDaVitrine>>("/api/loja/vitrine?tamanho=100");
  // A vitrine lista do mais novo ao mais antigo; o site mostra na ordem do cadastro.
  return pagina === NAO_ENCONTRADA ? [] : pagina.conteudo.filter((i) => i.preco != null && i.preco > 0).reverse();
}

function paraMaterial(i: ItemDaVitrine): Produto {
  const kit = /\bkit\b|combo/i.test(i.nome);
  const esgotado = i.restantes !== null && i.restantes <= 0;
  return {
    slug: slugDa({ ...i, tipo: "TURMA" } as unknown as AtividadeDaVitrine),
    tag: kit ? "Kit · Impresso" : "Apostila · Impresso",
    nome: i.nome,
    desc: i.descricao ?? "",
    preco: precoEmTexto(i.preco!),
    // A API ainda não vende a versão digital (PDF): o material sai impresso, retirado no Quad.
    formatos: ["impresso"],
    esgotado,
    detalhe: {
      lead: i.descricao ?? "",
      specs: [
        { label: "Formato", valor: "Impresso" },
        { label: "Entrega", valor: "Retirada no Quad" },
        ...(i.restantes !== null ? [{ label: "Disponíveis", valor: esgotado ? "Esgotado" : String(i.restantes), destaque: true }] : []),
      ],
      sumario: [],
    },
  };
}

function categoriaDoNome(nome: string) {
  const n = slugDoNome(nome);
  if (n.includes("camisa") || n.includes("camiseta")) return "camisas";
  if (n.includes("caneca")) return "canecas";
  if (n.includes("garrafa")) return "garrafas";
  return "outros";
}

function paraProdutoDaLoja(i: ItemDaVitrine): ProdutoDaLoja {
  return {
    id: slugDa({ ...i, tipo: "TURMA" } as unknown as AtividadeDaVitrine),
    idNaApi: i.id,
    categoria: categoriaDoNome(i.nome),
    nome: i.nome,
    descricao: i.descricao,
    preco: i.preco,
    estoque: i.restantes,
    imagemUrl: i.imagemUrl,
    variacoes:
      i.variacoes.length > 0
        ? [
            {
              nome: "Tamanho",
              opcoes: i.variacoes.map((v) => v.nome),
              esgotadas: i.variacoes.filter((v) => v.restantes !== null && v.restantes <= 0).map((v) => v.nome),
              ids: Object.fromEntries(i.variacoes.map((v) => [v.nome, v.id])),
            },
          ]
        : [],
  };
}

export async function listarMateriais(): Promise<Produto[] | null> {
  try {
    return (await listarItens()).filter((i) => i.tipo === "MODULOS").map(paraMaterial);
  } catch {
    return null;
  }
}

export async function buscarMaterial(slug: string): Promise<Produto | null> {
  const id = idDoSlug(slug);
  if (!id) return null;
  const item = await lerDaVitrine<ItemDaVitrine>(`/api/loja/vitrine/${id}`);
  return item === NAO_ENCONTRADA || item.tipo !== "MODULOS" ? null : paraMaterial(item);
}

export async function listarProdutosDaLoja(): Promise<ProdutoDaLoja[] | null> {
  try {
    return (await listarItens()).filter((i) => i.tipo === "OUTROS").map(paraProdutoDaLoja);
  } catch {
    return null;
  }
}

export async function buscarProdutoDaLoja(slug: string): Promise<ProdutoDaLoja | null> {
  const id = idDoSlug(slug);
  if (!id) return null;
  const item = await lerDaVitrine<ItemDaVitrine>(`/api/loja/vitrine/${id}`);
  return item === NAO_ENCONTRADA || item.tipo !== "OUTROS" ? null : paraProdutoDaLoja(item);
}
