// Turmas, eventos e simulados à venda, lidos da vitrine pública da API (sem login).
// Rotas e campos: docs/mapa-api-conteudo.md. O formato final pedido ao backend está em docs/contrato-api-conteudo.md;
// enquanto ele não chega, os textos de venda que a vitrine não tem (incluso, programação, professores do evento) ficam
// vazios e as páginas escondem essas seções. Turma não mostra professores (decisão de 21/10/2026).
import type { Evento, Produto, Professor, Turma } from "./data";
import type { ProdutoDaLoja } from "./conteudo";
import type { Carreira, Edicao } from "./simulados";
import { formatarHora, precoSemCentavosZerados } from "./format";
import { API_URL, lerErro } from "./http";
import { agruparViagens, jaPassou, lerNomeDaExcursao, linhasDaDescricao, type Excursao, type ViagemDeExcursao } from "./excursoes";
import {
  ehNivelDaPmba,
  horarioDoDia,
  juntarTurnos,
  lerNomeDaTurma,
  nomeDaTurma,
  nomeLimpoDaTurma,
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
// reais inteiros), o do lote vigente; as vagas são as de quem paga em reais (cartão e PIX).
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
    // Versão em PDF do simulado (modalidade "PDF", só com ?comPdf=true; guia da API de 13/11/2026): o id do
    // presencial de onde ela veio e o título de cada PDF (o arquivo só vai para quem comprou).
    origemId?: string | null;
    pdfs?: { titulo: string }[] | null;
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
export const ETIQUETA_DA_VITRINE = "vitrine";

async function lerDaVitrine<T>(caminho: string): Promise<T | typeof NAO_ENCONTRADA> {
  if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL não está definida.");
  // A etiqueta deixa reservar ou liberar vagas atualizar a vitrine na hora (lib/vagas.ts), sem esperar o minuto.
  const res = await fetch(`${API_URL}${caminho}`, { next: { revalidate: SEGUNDOS_DE_CACHE, tags: [ETIQUETA_DA_VITRINE] } });
  // Id inexistente responde 404; id em formato inválido, 400.
  if (res.status === 404 || res.status === 400) return NAO_ENCONTRADA;
  if (!res.ok) throw await lerErro(res, "Não foi possível carregar a vitrine.");
  return res.json();
}

// comPdf: junto, as versões em PDF dos simulados já aplicados (só a Central de Simulados pede; sem ele, a API não as
// manda, e é isso que protege o aplicativo).
async function listar(tipo: TipoDeAtividade, comPdf = false): Promise<AtividadeDaVitrine[]> {
  const pagina = await lerDaVitrine<Pagina<AtividadeDaVitrine>>(`/api/loja/vitrine/atividades?tipo=${tipo}&tamanho=100${comPdf ? "&comPdf=true" : ""}`);
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

// Lugares já tomados: o que a API não tem mais a oferecer. O `restantes` dela desconta as vendas E as reservas em
// carrinhos (LugaresNaMoeda), o mesmo número do menu e da barra de avisos; `vendidas` sozinho ignora os carrinhos.
function ocupadasDa(a: AtividadeDaVitrine, vagas: number) {
  return a.restantes !== null ? vagas - Math.min(a.restantes, vagas) : Math.min(a.vendidas ?? 0, vagas);
}

function vagasDa(a: AtividadeDaVitrine) {
  if (a.vagas === null || a.vagas <= 0) return {};
  return { vagasTotal: a.vagas, vagasOcupadas: ocupadasDa(a, a.vagas) };
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
    // A imagem cadastrada na turma é a insígnia dela (sem imagem: a marca do Quad).
    insignia: a.imagemUrl ?? null,
    // Sem modalidade, o cartão da escolha de modalidade leva o nome limpo ("MISSÃO 1º PASSO"), sem turno nem data.
    modalidadeNome: colunas.modalidade ?? nomeLimpoDaTurma(a.nome),
    modalidadeId: slugDoNome(colunas.modalidade ?? a.nome),
    isolada: d.tipo === "ISOLADA",
    concurso: colunas.cargo || colunas.concurso ? seloDoCargoEConcurso(colunas.cargo, colunas.concurso) : undefined,
    turno: turnos || undefined,
    horario: horario || undefined,
    edicao: colunas.edicao ?? undefined,
    dataDeInicio: d.inicio ?? undefined,
    inicio: d.inicio ? `${diaBarraMes(d.inicio)}/${d.inicio.slice(0, 4)}` : undefined,
    imagem: a.imagemUrl ?? undefined,
    // Sem o tipo da API (Regular, Nivelamento...): a planilha da coordenação não tem essa coluna (decisão de 21/10/2026).
    tag: "Turma presencial",
    // MODALIDADE + dia de início ("BOPE 09/11"); sem modalidade, o nome cadastrado limpo + dia (lib/turmas.ts).
    nome: nomeDaTurma({ ...colunas, inicio: d.inicio ?? null, nomeOriginal: a.nome }),
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
    vagas: a.vagas && a.vagas > 0 ? { total: a.vagas, ocupadas: ocupadasDa(a, a.vagas) } : null,
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
    imagem: a.imagemUrl ?? undefined,
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
  // O número é o do nome ("SIMULADO 80 SD PMBA (15/11)" → 80; decisão de 10/11/2026): a "edição" da API não é
  // editável, ela só conta os simulados criados de cada concurso (1, 2, 3…), e a numeração do Quad é outra.
  // Sem número no nome, vale a edição da API; sem as duas, a ordem da lista. O concurso vem da API desde 23/10/2026.
  const doNome = a.nome.match(/simulado\s*(?:n[ºo°]?\s*)?(\d+)/i)?.[1];
  const numero = doNome ? Number(doNome) : (d.edicao ?? ordem + 1);
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

// O número da edição no nome ("SIMULADO 78 SD PMBA (PDF)" → 78).
function numeroNoNome(nome: string) {
  const n = nome.match(/simulado\s*(?:n[ºo°]?\s*)?(\d+)/i)?.[1];
  return n ? Number(n) : null;
}

// A versão em PDF e a impressa abrem "no dia seguinte ao último dia do presencial" (guia da API de 13/11/2026), e o
// presencial já saiu da vitrine: o último dia de aplicação é a véspera da abertura. "2026-10-26" → "2026-10-25".
function vesperaDe(dia: string) {
  const [a, m, d] = dia.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d - 1)).toISOString().slice(0, 10);
}

// Edição já aplicada, só para estudo (sem o presencial): nasce da versão em PDF ou da impressa.
function edicaoDeEstudo(numero: number, abreEm: string): Edicao {
  return { numero, data: vesperaDe(abreEm), horario: null, local: null, inscricao: "encerradas", publicado: true };
}

// As versões impressas dos simulados já aplicados (itens da loja). Enquanto a API não tiver a versão impressa, ela
// ignora o parâmetro e devolve os itens de sempre: só conta o item com `origem` e o impresso entre as plataformas.
async function listarVersoesImpressas(): Promise<ItemDaVitrine[]> {
  const pagina = await lerDaVitrine<Pagina<ItemDaVitrine>>("/api/loja/vitrine?versaoImpressa=SO&tamanho=100");
  if (pagina === NAO_ENCONTRADA) return [];
  return pagina.conteudo.filter((i) => i.origem?.id && i.preco != null && i.preco > 0 && (i.material?.plataformas ?? ["IMPRESSO"]).includes("IMPRESSO"));
}

export async function listarCarreiras(): Promise<Carreira[] | null> {
  try {
    const [atividades, impressas] = await Promise.all([
      listar("SIMULADO", true),
      // Sem as impressas (API fora do ar só nessa rota), a Central abre com o presencial e o PDF.
      listarVersoesImpressas().catch(() => [] as ItemDaVitrine[]),
    ]);
    const porCarreira = new Map<string, Carreira>();
    const carreiraDe = (nome: string) => {
      const id = slugDoNome(nome);
      if (!porCarreira.has(id)) porCarreira.set(id, { id, nome: `Simulado Presencial — ${nome}`, curto: nome, edicoes: [] });
      return porCarreira.get(id)!;
    };
    // A edição de estudo de cada presencial de origem, para juntar o PDF e o impresso do mesmo simulado.
    const porOrigem = new Map<string, Edicao>();
    // A edição de estudo pelo número, na carreira: a versão em PDF sem o presencial de origem cadastrado.
    const estudoDaCarreira = (c: Carreira, numero: number, abreEm: string, origem: string | null) => {
      const existente = (origem && porOrigem.get(origem)) || c.edicoes.find((e) => e.numero === numero);
      if (existente) return existente;
      const nova = edicaoDeEstudo(numero, abreEm);
      c.edicoes.push(nova);
      return nova;
    };

    const presenciais = atividades.filter((a) => a.detalhe?.modalidade !== "PDF");
    const emPdf = atividades.filter((a) => a.detalhe?.modalidade === "PDF");
    presenciais.forEach((a, i) => {
      const { carreira, edicao } = edicaoDoSimulado(a, i);
      carreiraDe(carreira).edicoes.push(edicao);
    });
    for (const a of emPdf) {
      const d = a.detalhe ?? {};
      const numero = numeroNoNome(a.nome) ?? d.edicao;
      const abreEm = d.data ?? d.janelas?.[0]?.data;
      if (numero == null || !abreEm || a.preco === null) continue;
      const c = carreiraDe(d.concurso?.nome || "Outros simulados");
      const e = estudoDaCarreira(c, numero, abreEm, d.origemId ?? null);
      if (d.origemId) porOrigem.set(d.origemId, e);
      e.pdf = { preco: a.gratuita ? 0 : emReais(a.preco), sku: a.id, disponivel: true };
    }
    for (const i of impressas) {
      const numero = numeroNoNome(i.origem!.nome) ?? numeroNoNome(i.nome) ?? i.origem!.edicao;
      if (numero == null) continue;
      const c = carreiraDe(i.material?.concurso?.nome || "Outros simulados");
      const e = estudoDaCarreira(c, numero, i.origem!.abreEm, i.origem!.id);
      porOrigem.set(i.origem!.id, e);
      const esgotado = i.restantes !== null && i.restantes <= 0;
      e.impresso = { preco: emReais(i.preco!), sku: i.id, disponivel: !esgotado, estoque: i.restantes };
    }
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
  // MATERIAL = material didático, impresso (retirada no balcão) e/ou digital (PDF baixado no site).
  // Era MODULOS até a V132 (27/10/2026): a API de produção ainda pode responder o nome antigo até ser atualizada.
  // OUTROS = produto da loja. MENTORIA e SKIN são do app.
  tipo: "MATERIAL" | "MODULOS" | "EXCURSOES" | "TREINAMENTO_TAF" | "MENTORIA" | "OUTROS" | "SKIN";
  descricao: string | null;
  // Só no material: categoria, concurso (nulo = todos) e as ofertas (API, PR #137, V144, 03/11/2026): o mesmo
  // cadastro oferece o impresso e/ou o digital. O impresso usa o preço e o estoque do topo do item; o digital tem o
  // preço dele em `digital` (sem estoque; `aVenda` falso enquanto o PDF não chegou). `plataforma` é o campo de antes
  // da V144 (um formato por item), lido só enquanto alguma API responder assim.
  material?: {
    categoria: { id: string; nome: string } | null;
    concurso: ConcursoDaVitrine | null;
    plataformas?: ("IMPRESSO" | "DIGITAL")[];
    digital?: { preco: number | null; aVenda: boolean } | null;
    plataforma?: "IMPRESSO" | "DIGITAL";
  } | null;
  imagemUrl: string | null;
  // No material, o do impresso (nulo no material só digital).
  preco: number | null;
  ofertadas: number | null;
  vendidas: number | null;
  restantes: number | null;
  lote?: LoteDaVitrine | null;
  variacoes: { id: string; nome: string; ofertadas: number | null; vendidas: number | null; restantes: number | null }[];
  // Só na versão impressa de um simulado já aplicado (só com ?versaoImpressa=JUNTO ou SO; guia da API de 13/11/2026):
  // o presencial de onde ela veio (origem.id) e o dia em que abre a venda.
  origem?: { id: string; nome: string; edicao: number | null; ano: number | null; abreEm: string } | null;
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
  // Fica de fora o que não se vende em reais (skin, mentoria). O material só digital tem o preço em `material.digital`.
  const temPreco = (i: ItemDaVitrine) => (i.preco != null && i.preco > 0) || (i.material?.digital?.preco ?? 0) > 0;
  return pagina === NAO_ENCONTRADA ? [] : pagina.conteudo.filter(temPreco).reverse();
}

const ehMaterial = (i: ItemDaVitrine) => i.tipo === "MATERIAL" || i.tipo === "MODULOS";

type FormatoDoMaterial = "digital" | "impresso";
const ORDEM_DOS_FORMATOS: FormatoDoMaterial[] = ["digital", "impresso"];

// O que um item oferece, com o preço de cada formato (em centavos; o formato sem preço em reais não se vende no site).
function ofertasDoItem(i: ItemDaVitrine): { formato: FormatoDoMaterial; preco: number; esgotado: boolean; indisponivel: boolean }[] {
  const m = i.material;
  const plataformas = m?.plataformas ?? [m?.plataforma ?? "IMPRESSO"];
  const ofertas: ReturnType<typeof ofertasDoItem> = [];
  if (plataformas.includes("DIGITAL")) {
    // Antes da V144, o preço do digital vinha no topo do item.
    const preco = m?.digital ? m.digital.preco : m?.plataformas ? null : i.preco;
    if (preco) ofertas.push({ formato: "digital", preco, esgotado: false, indisponivel: m?.digital ? !m.digital.aVenda : false });
  }
  if (plataformas.includes("IMPRESSO") && i.preco) {
    ofertas.push({ formato: "impresso", preco: i.preco, esgotado: i.restantes !== null && i.restantes <= 0, indisponivel: false });
  }
  return ofertas;
}

// "Módulo de Português - PDF" e "Módulo de Português (Impresso)" → "Módulo de Português".
function nomeSemFormato(nome: string) {
  return nome.replace(/\s*(?:[-–—]\s*|\()\s*(?:pdf|digital|impresso)\s*\)?\s*$/i, "").trim();
}

// Mesma apostila = mesmo nome (sem o formato) e mesmo concurso.
const chaveDoMaterial = (i: ItemDaVitrine) => `${slugDoNome(nomeSemFormato(i.nome))}|${i.material?.concurso?.id ?? ""}`;

// Um material do site, com o impresso e o digital à escolha (03/11/2026). Na API nova o mesmo cadastro oferece os
// dois (V144); os cadastros de antes, um por formato com o mesmo nome, também se juntam aqui (agruparMateriais).
function paraMaterial(itens: ItemDaVitrine[]): Produto {
  const porFormato = new Map<FormatoDoMaterial, { item: ItemDaVitrine; oferta: ReturnType<typeof ofertasDoItem>[number] }>();
  for (const item of itens) for (const oferta of ofertasDoItem(item)) if (!porFormato.has(oferta.formato)) porFormato.set(oferta.formato, { item, oferta });
  const formatos = ORDEM_DOS_FORMATOS.filter((f) => porFormato.has(f));
  const ofertas = Object.fromEntries(
    formatos.map((f) => {
      const { item, oferta } = porFormato.get(f)!;
      return [f, { slug: slugDa(item), idNaApi: item.id, preco: precoEmTexto(emReais(oferta.preco)), esgotado: oferta.esgotado, indisponivel: oferta.indisponivel }];
    }),
  ) as Produto["ofertas"];
  const aVenda = (f: FormatoDoMaterial) => !ofertas![f]!.esgotado && !ofertas![f]!.indisponivel;
  // O endereço do material é o do primeiro formato à venda (o do outro cadastro leva para ele).
  const primeiro = formatos.find(aVenda) ?? formatos[0];
  const principal = porFormato.get(primeiro)?.item ?? itens[0];
  const impresso = porFormato.get("impresso")?.item;
  const esgotadoDo = (i: ItemDaVitrine) => i.restantes !== null && i.restantes <= 0;
  const kit = /\bkit\b|combo/i.test(principal.nome);
  const concurso = principal.material?.concurso?.rotulo;
  const descricao = itens.map((i) => i.descricao).find(Boolean) ?? "";
  const rotuloDosFormatos = formatos.length > 1 ? "PDF ou impresso" : formatos[0] === "digital" ? "PDF" : "Impresso";
  return {
    slug: slugDa(principal),
    idNaApi: principal.id,
    tag: `${kit ? "Kit" : principal.material?.categoria?.nome ?? "Apostila"} · ${rotuloDosFormatos}`,
    nome: nomeSemFormato(principal.nome),
    desc: descricao,
    preco: primeiro ? ofertas![primeiro]!.preco : "",
    formatos,
    ofertas,
    // A imagem cadastrada (a de qualquer formato que tenha): miniatura no carrinho.
    imagem: itens.map((i) => i.imagemUrl).find(Boolean) ?? undefined,
    esgotado: !formatos.some(aVenda),
    detalhe: {
      lead: descricao,
      specs: [
        { label: "Formato", valor: formatos.map((f) => (f === "digital" ? "Digital (PDF)" : "Impresso")).join(" ou ") },
        ...(concurso ? [{ label: "Concurso", valor: concurso }] : []),
        ...(impresso && impresso.restantes !== null
          ? [{ label: "Impressos disponíveis", valor: esgotadoDo(impresso) ? "Esgotado" : String(impresso.restantes), destaque: true }]
          : []),
      ],
      sumario: [],
    },
  };
}

// Agrupa os itens de material por apostila, na ordem do primeiro de cada uma.
function agruparMateriais(itens: ItemDaVitrine[]): Produto[] {
  const grupos = new Map<string, ItemDaVitrine[]>();
  const formatosDe = (lista: ItemDaVitrine[]) => new Set(lista.flatMap((i) => ofertasDoItem(i).map((o) => o.formato)));
  for (const i of itens.filter(ehMaterial)) {
    if (ofertasDoItem(i).length === 0) continue;
    const chave = chaveDoMaterial(i);
    const grupo = grupos.get(chave) ?? [];
    // Dois cadastros com o mesmo nome e o mesmo formato não se juntam: o segundo fica como material próprio.
    const ocupados = formatosDe(grupo);
    if (ofertasDoItem(i).some((o) => ocupados.has(o.formato))) grupos.set(`${chave}|${i.id}`, [i]);
    else grupos.set(chave, [...grupo, i]);
  }
  return [...grupos.values()].map(paraMaterial);
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
    return agruparMateriais(await listarItens());
  } catch {
    return null;
  }
}

// Pelo endereço de qualquer formato (ou o id, nos endereços antigos): o material com todos os formatos.
export async function buscarMaterial(slug: string): Promise<Produto | null> {
  const item = await buscarItem(slug);
  if (!item || !ehMaterial(item)) return null;
  const materiais = agruparMateriais(await listarItens());
  return materiais.find((p) => Object.values(p.ofertas ?? {}).some((o) => o.idNaApi === item.id)) ?? paraMaterial([item]);
}

export async function listarProdutosDaLoja(): Promise<ProdutoDaLoja[] | null> {
  try {
    return (await listarItens()).filter((i) => i.tipo === "OUTROS").map(paraProdutoDaLoja);
  } catch {
    return null;
  }
}

// ---------- Excursões (itens EXCURSOES, lib/excursoes.ts) ----------

function paraExcursao(i: ItemDaVitrine): Excursao {
  const cheio = precoCheioDa(i);
  return {
    slug: slugDa(i),
    idNaApi: i.id,
    nomeCadastrado: i.nome,
    ...lerNomeDaExcursao(i.nome),
    detalhes: linhasDaDescricao(i.descricao),
    preco: i.preco === null ? null : precoEmTexto(emReais(i.preco)),
    precoCheio: cheio === null ? null : precoEmTexto(emReais(cheio)),
    lote: rotuloDoLote(i.lote),
    restantes: i.restantes,
    ofertadas: i.ofertadas,
    imagemUrl: i.imagemUrl,
  };
}

// As viagens que ainda não saíram, na ordem da data. null = a API não respondeu.
export async function listarExcursoes(): Promise<ViagemDeExcursao[] | null> {
  try {
    const excursoes = (await listarItens()).filter((i) => i.tipo === "EXCURSOES").map(paraExcursao);
    return agruparViagens(excursoes).filter((v) => !jaPassou(v.data));
  } catch {
    return null;
  }
}

// A excursão do endereço e as outras opções da mesma viagem (com e sem café).
export async function buscarExcursao(slug: string): Promise<{ atual: Excursao; viagem: ViagemDeExcursao } | null> {
  const item = await buscarItem(slug);
  if (item?.tipo !== "EXCURSOES") return null;
  const atual = paraExcursao(item);
  const todas = (await listarItens()).filter((i) => i.tipo === "EXCURSOES").map(paraExcursao);
  const viagem = agruparViagens(todas).find((v) => v.opcoes.some((o) => o.idNaApi === atual.idNaApi)) ?? {
    titulo: atual.titulo,
    concurso: atual.concurso,
    data: atual.data,
    opcoes: [atual],
  };
  return { atual, viagem };
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

// A minibio é a graduação do cadastro. "Sem graduação" (o padrão do console) não é minibio: o site não mostra.
// Várias linhas (uma formação por linha) viram uma frase: "Graduação em Direito · Pós em Direito Civil".
function minibioDa(graduacao: string | null) {
  const linhas = (graduacao ?? "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (linhas.length === 0 || (linhas.length === 1 && /^sem gradua/i.test(linhas[0]))) return undefined;
  return linhas.join(" · ");
}

function paraProfessor(p: ProfessorDaVitrine): Professor {
  const nome = p.nome.trim();
  const materias = (p.materias ?? []).map((m) => m.trim()).filter(Boolean);
  return {
    slug: slugDa({ id: p.id, nome, slug: p.slug }),
    nome,
    materia: materias[0] ?? "",
    materias,
    bio: minibioDa(p.graduacao),
    fotoUrl: p.fotoUrl ?? undefined,
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
