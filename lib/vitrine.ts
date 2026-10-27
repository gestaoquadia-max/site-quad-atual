// Turmas, eventos e simulados à venda, lidos da vitrine pública da API (sem login).
// Rotas e campos: docs/mapa-api-conteudo.md. O formato final pedido ao backend está em docs/contrato-api-conteudo.md;
// enquanto ele não chega, os textos de venda que a vitrine não tem (incluso, programação, professores do evento) ficam
// vazios e as páginas escondem essas seções. Turma não mostra professores (decisão de 21/10/2026).
import type { Evento, Produto, Professor, Turma } from "./data";
import type { ProdutoDaLoja } from "./conteudo";
import type { Carreira, Edicao } from "./simulados";
import { formatarHora, precoSemCentavosZerados } from "./format";
import { API_URL, lerErro } from "./http";
import {
  ehNivelDaPmba,
  horarioDoDia,
  insigniaDaTurma,
  juntarTurnos,
  lerNomeDaTurma,
  nomeDaTurma,
  ORDEM_DOS_TURNOS,
  seloDoCargoEConcurso,
  type OfertaDaTurma,
  type Turno,
  type TurmaComTurnos,
} from "./turmas";

// As páginas são refeitas no servidor no máximo a cada minuto: vagas e preços ficam atualizados sem
// consultar a API a cada visita.
export const SEGUNDOS_DE_CACHE = 60;

type TipoDeAtividade = "TURMA" | "EVENTO" | "SIMULADO";

// Resposta da vitrine em 23/10/2026 (modelo novo do banco). `preco` em CENTAVOS de reais (desde 23/10/2026; antes,
// reais inteiros), o do lote vigente; as vagas são as de quem paga em reais (cartão, PIX, boleto e diamantes).
// Os campos de Quad Coins são do app Viver o Quad e o site ignora.
type AtividadeDaVitrine = {
  tipo: TipoDeAtividade;
  id: string;
  nome: string;
  // Nasce do nome na criação e não muda mais, nem se o nome mudar. Único dentro do tipo.
  slug?: string | null;
  imagemUrl: string | null;
  preco: number | null;
  vagas: number | null;
  vendidas: number | null;
  restantes: number | null;
  lote: LoteDaVitrine | null;
  // De graça (desde 26/10/2026): preço, vagas e lote vêm nulos. Turma: matrícula direta; evento e simulado: inscrição.
  gratuita?: boolean;
  // A sequência inteira dos lotes em reais, em ordem (desde 24/10/2026); [] sem lotes.
  lotes?: LoteDaSequencia[] | null;
  detalhe: {
    // TURMA: TURMA ou ISOLADA (calendário de turma com nome próprio).
    tipo?: string | null;
    // TURMA (desde a V123): o NOME da modalidade, que é um cadastro livre ("Rondesp", "Patamo", "Bope", "Core"…);
    // nulo na turma de todas as modalidades. "Regular" e "Questões" são as legadas, das turmas antigas.
    // EVENTO e SIMULADO: PRESENCIAL ou ONLINE.
    modalidade?: string | null;
    turnos?: string[] | null;
    // Número anual na série (turma: modalidade + concurso; "Rondesp 2"). Nulo nas atividades antigas.
    edicao?: number | null;
    ano?: number | null;
    // O edital que a atividade prepara ("SD/PMBA" em `rotulo`), ou nulo (de todos os concursos). Desde 23/10/2026.
    concurso?: ConcursoDaVitrine | null;
    sala?: { id: string; nome: string } | null;
    descricao?: string | null;
    // TURMA e EVENTO: datas ("2026-07-06"). SIMULADO: horas ("08:00:00"), com a data em `data`.
    inicio?: string | null;
    fim?: string | null;
    data?: string | null;
    horaInicio?: string | null;
    horaFim?: string | null;
    // TURMA: os blocos de horário de cada dia de aula e os dias da semana (SEGUNDA…).
    horarios?: { inicio: string; fim: string }[] | null;
    dias?: string[] | null;
    // EVENTO: AULAO ou EVENTO; o parágrafo de apresentação; quem conduz.
    especie?: string | null;
    resumo?: string | null;
    professores?: ProfessorDaAtividade[] | null;
    // EVENTO presencial fora do Quad (sede EXTERNA): onde fica. Nulo no evento do Quad e no online.
    endereco?: string | null;
    // SIMULADO: os dias em que acontece (de 1 a 10) e o número de questões (0 = não informado).
    janelas?: { data: string; inicio: string; fim: string }[] | null;
    quantidadeDeQuestoes?: number | null;
  } | null;
};

type ConcursoDaVitrine = { id: string; codigo: string; nome: string; rotulo: string };

// Um professor no cartão de uma atividade: a página dele é /professores/{slug}.
type ProfessorDaAtividade = { id: string; nome: string; slug: string | null; fotoUrl: string | null };

// O lote em reais que vale agora: o preço de agora e quanto resta a esse preço. Nulo sem lotes.
type LoteDaVitrine = {
  ordem: number;
  // Já exibível: "Lote único", "Lote final", "2º lote"…
  rotulo: string;
  preco: number;
  quantidade: number;
  restantesNoLote: number;
  // Quantos lotes a oferta tem.
  total: number;
  // O preço do ÚLTIMO lote, em centavos: o preço cheio, de que o lote atual é a promoção. Pedido ao backend
  // (docs/pedidos-backend.md); enquanto não vem, o site não mostra o preço riscado.
  precoCheio?: number | null;
};

type LoteDaSequencia = { ordem: number; rotulo: string; preco: number; quantidade: number; situacao: "ESGOTADO" | "VIGENTE" | "FUTURO" };

type Pagina<T> = { conteudo: T[] };

// A API manda os preços em centavos; o site trabalha em reais (R$ 1.197 = 119700).
function emReais(centavos: number) {
  return centavos / 100;
}

// Preço promocional: o lote atual mais barato que o último. null = sem promoção (lote único, último lote ou sem o dado).
function precoCheioDa(a: { preco: number | null; lote?: LoteDaVitrine | null }) {
  const cheio = a.lote?.precoCheio;
  return cheio && a.preco !== null && cheio > a.preco ? cheio : null;
}

// Vagas no preço atual, antes de o lote virar: só faz sentido antes do último lote.
function restantesNoLoteDa(lote: LoteDaVitrine | null | undefined) {
  return lote && lote.ordem < lote.total ? lote.restantesNoLote : null;
}

// O selo de lote só faz sentido quando a oferta tem mais de um ("2º lote", "Lote final").
function rotuloDoLote(lote: LoteDaVitrine | null | undefined) {
  return lote && lote.total > 1 ? lote.rotulo : null;
}

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

// Pelo endereço da página: o slug da API ou, nos endereços antigos (nome + id), o id. A página redireciona
// o endereço antigo para o do slug.
async function buscar(tipo: TipoDeAtividade, endereco: string): Promise<AtividadeDaVitrine | null> {
  const id = idDoSlug(endereco);
  const caminho = id ? `${tipo}/${id}` : `${tipo}/slug/${encodeURIComponent(endereco)}`;
  const atividade = await lerDaVitrine<AtividadeDaVitrine>(`/api/loja/vitrine/atividades/${caminho}`);
  return atividade === NAO_ENCONTRADA ? null : atividade;
}

// ---------- Endereço das páginas ----------

// O endereço é o slug da API (/turmas/rondesp-2-soldado-pmba-manha). Até 22/10/2026 a API não tinha slug e o
// endereço era o nome seguido do id (/turmas/patamo-6c29678d-…): esses endereços ainda abrem, pelo id.
const UUID_NO_FIM = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

function slugDoNome(nome: string) {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// O slug da API; sem ele (API antiga), o nome seguido do id.
function slugDa(a: { id: string; nome: string; slug?: string | null }) {
  if (a.slug) return a.slug;
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

// Turmas antigas (modalidade REGULAR ou QUESTOES, sem nível na API): o nível sai do nome. "Patamo - CFO" → PATAMO.
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

// Modalidades legadas (inativas, só das turmas antigas): não dizem o nível, que nelas ainda sai do nome.
const MODALIDADES_LEGADAS = ["regular", "questoes"];

// MODALIDADE, EDIÇÃO, CARGO e CONCURSO da planilha, da API desde 23/10/2026: a modalidade é o nome do cadastro (em
// maiúsculas: "RONDESP", "CORE"), a edição é o número na série, e cargo e concurso saem do rótulo do concurso
// ("SD/PMBA"). Nas turmas antigas (sem edição, sem concurso, modalidade legada), o que faltar sai do nome no padrão
// "MODALIDADE EDIÇÃO - CARGO CONCURSO - TURNO".
function colunasDaTurma(a: AtividadeDaVitrine) {
  const d = a.detalhe ?? {};
  const colunas = colunasDoNome(a);
  const [cargo, orgao] = d.concurso?.rotulo?.split("/").map((p) => p.trim()) ?? [];
  const daApi = {
    ...colunas,
    edicao: d.edicao ?? colunas.edicao,
    cargo: cargo && orgao ? cargo : colunas.cargo,
    concurso: cargo && orgao ? orgao : colunas.concurso,
  };
  const modalidade = d.modalidade?.trim();
  if (modalidade && !MODALIDADES_LEGADAS.includes(slugDoNome(modalidade))) return { ...daApi, modalidade: modalidade.toUpperCase() };
  // Sem modalidade = turma de todas: o nome não pode transformá-la numa turma RONDESP, PATAMO ou BOPE.
  if (modalidade === null && ehNivelDaPmba(colunas.modalidade)) return { ...daApi, modalidade: null };
  return daApi;
}

// Os blocos de horário de um dia de aula; as atividades antigas mandavam só horaInicio/horaFim.
function horariosDa(d: NonNullable<AtividadeDaVitrine["detalhe"]>) {
  if (d.horarios?.length) return d.horarios;
  return d.horaInicio && d.horaFim ? [{ inicio: d.horaInicio, fim: d.horaFim }] : [];
}

function colunasDoNome(a: AtividadeDaVitrine) {
  const lido = lerNomeDaTurma(a.nome);
  if (lido) return lido;
  const nivel = modalidadeDoNome(a.nome);
  const edicao = nivel ? a.nome.match(new RegExp(`${nivel}\\D{0,3}(\\d+)`, "i"))?.[1] : undefined;
  // "Soldado PMBA" → cargo "Soldado", concurso "PMBA"
  const partes = concursoDaTurma(a.nome, a.detalhe?.descricao ?? "")?.split(" ") ?? [];
  return {
    modalidade: nivel ? nivel.toUpperCase() : null,
    edicao: edicao ? Number(edicao) : null,
    cargo: partes.length > 1 ? partes.slice(0, -1).join(" ") : null,
    concurso: partes.at(-1) ?? null,
    turno: null,
  };
}

function paraTurma(a: AtividadeDaVitrine): Turma {
  const d = a.detalhe ?? {};
  const colunas = colunasDaTurma(a);
  const nivel = ehNivelDaPmba(colunas.modalidade) ? (colunas.modalidade!.toLowerCase() as Turma["modalidade"]) : undefined;
  const turnos = (d.turnos ?? []).map((t) => rotulo(TURNO, t)).join(" e ");
  const meses = d.inicio && d.fim ? mesesEntre(d.inicio, d.fim) : null;
  const duracao = meses === null ? null : meses === 1 ? "1 mês" : `${meses} meses`;
  const vagas = vagasDa(a);
  const horario = horarioDoDia(horariosDa(d));

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
    horario && { label: "Horário", valor: horario },
    duracao && { label: "Duração", valor: duracao },
    vagas.vagasTotal !== undefined && {
      label: "Vagas restantes",
      valor: `${vagas.vagasTotal - vagas.vagasOcupadas} de ${vagas.vagasTotal}`,
      destaque: true,
    },
  ].filter((s): s is { label: string; valor: string; destaque?: boolean } => Boolean(s));

  return {
    slug: slugDa(a),
    // Nível (RONDESP, PATAMO, BOPE) só na PMBA; fora dela a turma não tem nível.
    modalidade: nivel,
    insignia: insigniaDaTurma(colunas.modalidade),
    modalidadeNome: colunas.modalidade ?? a.nome,
    modalidadeId: slugDoNome(colunas.modalidade ?? a.nome),
    concurso: colunas.cargo || colunas.concurso ? seloDoCargoEConcurso(colunas.cargo, colunas.concurso) : undefined,
    turno: turnos || undefined,
    horario: horario || undefined,
    edicao: colunas.edicao ?? undefined,
    dataDeInicio: d.inicio ?? undefined,
    inicio: d.inicio ? `${diaBarraMes(d.inicio)}/${d.inicio.slice(0, 4)}` : undefined,
    imagem: a.imagemUrl ?? undefined,
    // Sem o tipo da API (Regular, Nivelamento...): a planilha da coordenação não tem essa coluna (decisão de 21/10/2026).
    tag: "Turma presencial",
    // MODALIDADE + EDIÇÃO ("RONDESP 2", "INVESTIGADOR 1"); fora do padrão, o nome cadastrado.
    nome: nomeDaTurma({ ...colunas, nomeOriginal: a.nome }),
    desc: resumo.join(" · "),
    // A turma é cobrada pelo valor fechado da duração, nunca por mês (e o preço aparece sem a duração ao lado).
    preco: a.gratuita ? "Gratuito" : a.preco === null ? "Consulte" : precoEmTexto(emReais(a.preco)),
    precoCheio: precoCheioDa(a) === null ? undefined : precoEmTexto(emReais(precoCheioDa(a)!)),
    ...situacao(a, "Matrículas abertas"),
    detalhe: {
      lead: d.descricao?.trim() || "Preparação presencial do Quad com rotina estruturada e professores especialistas na banca.",
      specs,
      ...vagas,
      incluso: [],
    },
  };
}

// null = a API não respondeu. A página mostra um aviso em vez da lista.
// Em ordem de número (RONDESP 1, 2, 3…); turma sem número (dado antigo) vai para o fim, pela data de início.
export async function listarTurmas(): Promise<Turma[] | null> {
  try {
    return (await listar("TURMA"))
      .map(paraTurma)
      .sort((a, b) => (a.edicao ?? Infinity) - (b.edicao ?? Infinity) || (a.dataDeInicio ?? "9999").localeCompare(b.dataDeInicio ?? "9999"));
  } catch {
    return null;
  }
}

export async function buscarTurma(slug: string): Promise<Turma | null> {
  const atividade = await buscar("TURMA", slug);
  return atividade ? paraTurma(atividade) : null;
}

// ---------- Turma no formato da planilha (lib/turmas.ts) ----------

// Uma linha da planilha (um turno). Desde 23/10/2026 a vitrine traz todas as colunas (modalidade, edição, concurso,
// horários, lote, valor em centavos); só as turmas antigas ainda completam pelo nome (colunasDaTurma).
function paraOferta(a: AtividadeDaVitrine): OfertaDaTurma {
  const d = a.detalhe ?? {};
  const colunas = colunasDaTurma(a);
  const turno = d.turnos?.[0] ?? colunas.turno;
  return {
    id: a.id,
    slug: slugDa(a),
    modalidade: colunas.modalidade,
    edicao: colunas.edicao,
    cargo: colunas.cargo,
    concurso: colunas.concurso,
    turno: turno && ORDEM_DOS_TURNOS.includes(turno as Turno) ? (turno as Turno) : null,
    inicio: d.inicio ?? null,
    termino: d.fim ?? null,
    horarios: horariosDa(d),
    precoEmCentavos: a.gratuita ? 0 : a.preco,
    gratuita: !!a.gratuita,
    vagas: a.vagas && a.vagas > 0 ? { total: a.vagas, ocupadas: Math.min(a.vendidas ?? 0, a.vagas) } : null,
    descricao: d.descricao?.trim() || null,
    imagemUrl: a.imagemUrl,
    lote: rotuloDoLote(a.lote),
    precoCheioEmCentavos: precoCheioDa(a),
    restantesNoLote: restantesNoLoteDa(a.lote),
    loteAtual:
      a.lote && a.lote.total > 1
        ? { ordem: a.lote.ordem, total: a.lote.total, quantidade: a.lote.quantidade, restantes: a.lote.restantesNoLote }
        : null,
    // Com mais de um lote: cada um com preço e vagas, para a barra por lote.
    lotes:
      (a.lotes?.length ?? 0) > 1
        ? a.lotes!.map((l) => ({
            rotulo: l.rotulo,
            precoEmCentavos: l.preco,
            quantidade: l.quantidade,
            situacao: l.situacao,
            restantes: l.situacao === "VIGENTE" ? (a.lote?.restantesNoLote ?? l.quantidade) : l.situacao === "FUTURO" ? l.quantidade : 0,
          }))
        : null,
    nomeOriginal: a.nome,
  };
}

// A turma do endereço. Cada turma tem um turno só e o seu próprio número (decisão de 23/10/2026, como o banco
// numera: RONDESP 1 Manhã, RONDESP 2 Noite, RONDESP 3…); as outras turmas da modalidade são outras páginas.
export async function buscarTurmaComTurnos(slug: string): Promise<{ turma: TurmaComTurnos; atual: OfertaDaTurma } | null> {
  const atividade = await buscar("TURMA", slug);
  if (!atividade) return null;
  const atual = paraOferta(atividade);
  return { turma: juntarTurnos([atual]), atual };
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
  const gratuito = !!a.gratuita || a.preco === 0;
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

  // AULAO ou EVENTO (corujão, gincana, palestra); sem a espécie (API antiga), "Evento".
  const especie = simulado ? "Simulado" : d.especie === "AULAO" ? "Aulão" : "Evento";
  const desc = [especie, data && diaBarraMes(data), horario, formato].filter(Boolean).join(" · ");

  return {
    slug: slugDa(a),
    idNaApi: a.id,
    tag: [data && diaEMes(data), formato].filter(Boolean).join(" · "),
    nome: a.nome,
    desc,
    preco: gratuito ? "Gratuito" : a.preco === null ? "Consulte" : precoEmTexto(emReais(a.preco)),
    ...situacao(a, "Inscrições abertas"),
    detalhe: {
      inicio: comHora(data, horaInicio),
      fim: comHora(dataFim, horaFim),
      lead: d.resumo?.trim() || d.descricao?.trim() || desc,
      sobre: [],
      specs,
      programacao: [],
      incluso: [],
      local: online
        ? { nome: "Online", endereco: "O link de acesso fica na área do aluno de quem se inscrever." }
        : d.endereco
          ? { nome: "Fora do Quad", endereco: d.endereco }
            : {
              nome: d.sala?.nome ? `Quad Concursos — ${d.sala.nome}` : "Quad Concursos — Feira de Santana",
              endereco: "Feira de Santana — BA · Endereço completo enviado por e-mail após a inscrição",
            },
      ...vagas,
      professores: (d.professores ?? []).map((p) => ({
        iniciais: "",
        nome: p.nome,
        papel: "Professor do Quad",
        href: p.slug ? `/professores/${p.slug}` : undefined,
        fotoUrl: p.fotoUrl ?? undefined,
      })),
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
  const atividade = await buscar("EVENTO", slug);
  return atividade ? paraEvento(atividade) : null;
}

// ---------- Simulados ----------

// Na API cada edição é um simulado, e a carreira ainda não é um campo: vem do nome, no padrão
// "Simulado 77 — Soldado PMBA". Sem esse padrão, o simulado entra em "Outros simulados".
function edicaoDoSimulado(a: AtividadeDaVitrine, ordem: number): { carreira: string; edicao: Edicao } {
  const d = a.detalhe ?? {};
  // Edição e concurso vêm da API desde 23/10/2026; os simulados antigos (sem eles) ainda os tiram do nome
  // ("Simulado 77 — Soldado PMBA").
  const numero = d.edicao ?? Number(a.nome.match(/simulado\s*(?:n[ºo°]?\s*)?(\d+)/i)?.[1] ?? ordem + 1);
  const carreira = d.concurso?.nome || a.nome.split(/\s+[—–-]\s+/)[1]?.trim() || "Outros simulados";
  const online = d.modalidade === "ONLINE";
  return {
    carreira,
    edicao: {
      numero,
      // O primeiro dia (as janelas vêm em ordem); a Central de Simulados mostra uma data por edição.
      data: d.janelas?.[0]?.data ?? d.data ?? null,
      horario: d.inicio ? formatarHora(d.inicio) : null,
      local: online ? "Online" : "Quad Concursos",
      // Estar na vitrine = à venda (com preço e vagas). "Esgotado" sai das vagas restantes.
      inscricao: "abertas",
      publicado: true,
      presencial: { preco: a.gratuita ? 0 : a.preco === null ? null : emReais(a.preco), vagas: a.vagas, vagasRestantes: a.restantes, sku: a.id },
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
  // Único entre os itens; não muda se o nome mudar (V119).
  slug?: string | null;
  // MODULOS = material impresso entregue no balcão; OUTROS = produto da loja. MENTORIA e SKIN são do app.
  tipo: "MODULOS" | "EXCURSOES" | "TREINAMENTO_TAF" | "MENTORIA" | "OUTROS" | "SKIN";
  descricao: string | null;
  imagemUrl: string | null;
  preco: number | null;
  ofertadas: number | null;
  vendidas: number | null;
  restantes: number | null;
  lote?: LoteDaVitrine | null;
  variacoes: { id: string; nome: string; ofertadas: number | null; vendidas: number | null; restantes: number | null }[];
};

// Pelo endereço da página: o slug da API ou, nos endereços antigos (nome + id), o id.
async function buscarItem(endereco: string): Promise<ItemDaVitrine | null> {
  const id = idDoSlug(endereco);
  const item = await lerDaVitrine<ItemDaVitrine>(`/api/loja/vitrine/${id ?? `slug/${encodeURIComponent(endereco)}`}`);
  return item === NAO_ENCONTRADA ? null : item;
}

async function listarItens(): Promise<ItemDaVitrine[]> {
  const pagina = await lerDaVitrine<Pagina<ItemDaVitrine>>("/api/loja/vitrine?tamanho=100");
  // A vitrine lista do mais novo ao mais antigo; o site mostra na ordem do cadastro.
  return pagina === NAO_ENCONTRADA ? [] : pagina.conteudo.filter((i) => i.preco != null && i.preco > 0).reverse();
}

function paraMaterial(i: ItemDaVitrine): Produto {
  const kit = /\bkit\b|combo/i.test(i.nome);
  const esgotado = i.restantes !== null && i.restantes <= 0;
  return {
    slug: slugDa(i),
    idNaApi: i.id,
    tag: kit ? "Kit · Impresso" : "Apostila · Impresso",
    nome: i.nome,
    desc: i.descricao ?? "",
    preco: precoEmTexto(emReais(i.preco!)),
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
    id: slugDa(i),
    idNaApi: i.id,
    categoria: categoriaDoNome(i.nome),
    nome: i.nome,
    descricao: i.descricao,
    preco: i.preco === null ? null : emReais(i.preco),
    estoque: i.restantes,
    imagemUrl: i.imagemUrl,
    variacoes:
      i.variacoes.length > 0
        ? [
            {
              // A API não diz o que a variação é: em roupa é o tamanho; nos demais itens, "Opção" (cor, modelo…).
              nome: categoriaDoNome(i.nome) === "camisas" ? "Tamanho" : "Opção",
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
  const item = await buscarItem(slug);
  return item?.tipo === "MODULOS" ? paraMaterial(item) : null;
}

export async function listarProdutosDaLoja(): Promise<ProdutoDaLoja[] | null> {
  try {
    return (await listarItens()).filter((i) => i.tipo === "OUTROS").map(paraProdutoDaLoja);
  } catch {
    return null;
  }
}

export async function buscarProdutoDaLoja(slug: string): Promise<ProdutoDaLoja | null> {
  const item = await buscarItem(slug);
  return item?.tipo === "OUTROS" ? paraProdutoDaLoja(item) : null;
}

// ---------- Professores ----------

// Resposta de /api/professores/vitrine (sem login). O slug (V125, 23/10/2026) é o endereço da página e não muda.
// A minibio é a coluna `graduacao` (decisão de 23/10/2026: o campo do cadastro serve a ela).
type ProfessorDaVitrine = {
  id: string;
  nome: string;
  slug?: string | null;
  graduacao: string | null;
  materias: string[] | null;
  fotoUrl: string | null;
};

// Fotos que o site já tinha enquanto o cadastro não tem foto. A foto da API, quando houver, vale mais.
const FOTO_DO_SITE: Record<string, string> = { "Danilo Ribeiro Moura": "/images/professores/danilo.webp" };

// A minibio é a graduação do cadastro. "Sem graduação" (o padrão do console) não é minibio: o site não mostra.
// Várias linhas (uma formação por linha) viram uma frase: "Graduação em Direito · Pós em Direito Civil".
function minibioDa(graduacao: string | null) {
  const linhas = (graduacao ?? "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (linhas.length === 0 || (linhas.length === 1 && /^sem gradua/i.test(linhas[0]))) return undefined;
  return linhas.join(" · ");
}

function paraProfessor(p: ProfessorDaVitrine): Professor {
  const nome = p.nome.trim();
  return {
    slug: slugDa({ id: p.id, nome, slug: p.slug }),
    nome,
    materia: (p.materias ?? []).join(" • "),
    bio: minibioDa(p.graduacao),
    fotoUrl: p.fotoUrl ?? FOTO_DO_SITE[nome],
  };
}

// null = a API não respondeu. A seção some em vez de quebrar a página.
export async function listarProfessores(): Promise<Professor[] | null> {
  try {
    const lista = await lerDaVitrine<ProfessorDaVitrine[]>("/api/professores/vitrine");
    return lista === NAO_ENCONTRADA ? [] : lista.map(paraProfessor);
  } catch {
    return null;
  }
}

// Pelo endereço da página: o slug da API ou, nos endereços antigos (nome + id), o id. A página redireciona.
export async function buscarProfessor(slug: string): Promise<Professor | null> {
  const id = idDoSlug(slug);
  const professor = await lerDaVitrine<ProfessorDaVitrine>(`/api/professores/vitrine/${id ?? `slug/${encodeURIComponent(slug)}`}`);
  return professor === NAO_ENCONTRADA ? null : paraProfessor(professor);
}
