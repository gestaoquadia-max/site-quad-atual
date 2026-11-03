"use client";

import Image from "next/image";
import Link from "next/link";
import { Moon, Sun, SunHorizon, type Icon } from "@phosphor-icons/react";
import { Children, useCallback, useEffect, useRef, useState } from "react";
import type { Turma } from "@/lib/data";
import { modalidades } from "@/lib/conteudo";
import { insigniaDaModalidade } from "@/lib/turmas";
import { brasaoDoConcurso } from "@/lib/brasoes";
import AviseMe from "../AviseMePeloWhatsApp";
import InsigniaDaTurma from "./InsigniaDaTurma";


// Cartão de modalidade da aba: na PMBA, os três níveis (com perfil, método e barra teoria/questões); nas outras abas,
// as modalidades das turmas daquele cargo ("INVESTIGADOR"), só com insígnia, nome e resumo.
type OpcaoDeModalidade = {
  id: string;
  nome: string;
  insignia: string | null;
  nivel?: string;
  perfil?: string;
  metodo?: string;
  teoria?: number;
  resumo?: string;
};

function opcoesDaAba(aba: string, doCargo: Turma[], comNiveis: boolean, todas: Turma[] | null): OpcaoDeModalidade[] {
  // Os três níveis da PMBA, com a insígnia tirada de uma turma deles cadastrada na API (de qualquer concurso).
  const niveisDaPmba = () => modalidades.map((m) => ({ ...m, insignia: insigniaDaModalidade(todas, m.id) }));
  if (comNiveis) return niveisDaPmba();
  // "Todos os concursos": os três níveis da PMBA e, depois, as modalidades dos outros concursos.
  if (aba === TODOS) {
    const niveis = modalidades.map((m) => m.id as string);
    return [...niveisDaPmba(), ...opcoesDaAba(SEM_CARGO, doCargo.filter((t) => !niveis.includes(t.modalidadeId)), false, todas)];
  }
  const porId = new Map<string, Turma[]>();
  for (const t of doCargo) porId.set(t.modalidadeId, [...(porId.get(t.modalidadeId) ?? []), t]);
  return [...porId.values()].map((turmas) => {
    const abertas = turmas.filter((t) => t.status === "aberta").length;
    const concurso = aba === SEM_CARGO ? turmas[0].concurso : aba;
    return {
      id: turmas[0].modalidadeId,
      nome: turmas[0].modalidadeNome,
      insignia: turmas[0].insignia,
      resumo: `Turma presencial para ${concurso ?? "o seu concurso"}. ${
        abertas === 0 ? "Sem matrículas abertas no momento." : abertas === 1 ? "1 turma com matrículas abertas." : `${abertas} turmas com matrículas abertas.`
      }`,
    };
  });
}

// Nome por extenso e órgão de cada concurso, para a caixa "Para qual concurso". Concurso fora da lista aparece com o rótulo.
const DESCRICAO_DO_CONCURSO: Record<string, { titulo: string; subtitulo: string }> = {
  Todos: { titulo: "Todos os concursos", subtitulo: "Todas as turmas presenciais" },
  "SD • PMBA": { titulo: "Soldado PMBA", subtitulo: "Polícia Militar da Bahia" },
  "CFO • PMBA": { titulo: "CFO PMBA", subtitulo: "Curso de Formação de Oficiais" },
  "CFS • PMBA": { titulo: "Sargento PMBA", subtitulo: "Curso de Formação de Sargentos" },
  "SGT • PMBA": { titulo: "Sargento PMBA", subtitulo: "Curso de Formação de Sargentos" },
  "SD • BMBA": { titulo: "Soldado BMBA", subtitulo: "Corpo de Bombeiros Militar" },
  "SD • CBMBA": { titulo: "Soldado BMBA", subtitulo: "Corpo de Bombeiros Militar" },
  "IPC • PCBA": { titulo: "Investigador PCBA", subtitulo: "Polícia Civil da Bahia" },
  Outras: { titulo: "Outros concursos", subtitulo: "Demais turmas presenciais" },
};

// Brasão de cada concurso (lib/brasoes.ts), pelo id da aba ("sd-pmba"). Sem brasão, o espaço mostra as iniciais.
function ImagemDoConcurso({ aba }: { aba: string }) {
  const imagem = brasaoDoConcurso(idDaAba(aba));
  if (imagem) return <Image src={imagem} alt="" width={48} height={48} className="h-12 w-12 flex-none object-contain" />;
  // "Todos os concursos" e "Outros concursos" não têm brasão: o cartão fica só com o texto.
  if (aba === TODOS || aba === SEM_CARGO) return null;
  return (
    <span aria-hidden="true" className="grid h-12 w-12 flex-none place-items-center rounded-full border border-white/15 bg-white/[0.06] font-display text-[13px] font-extrabold tracking-[0.02em] text-azul-ceu">
      {aba.split(" • ")[0].slice(0, 3)}
    </span>
  );
}

const SITUACAO: Record<Turma["status"], { rotulo: string; cor: string }> = {
  aberta: { rotulo: "Matrículas abertas", cor: "bg-[#EEF2F7] text-[#4A5A70]" },
  breve: { rotulo: "Em breve", cor: "bg-[#E6ECFF] text-[#1238C4]" },
  encerrada: { rotulo: "Turma lotada", cor: "bg-[#FFF0D9] text-[#8A4B00]" },
};

const A_CONFIRMAR = "A confirmar";

function SetaParaBaixo() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ESPACO_ENTRE_CARTOES = 24;
const INTERVALO_DA_FAIXA_MS = 5000;

function SetaDaFaixa({ direcao }: { direcao: "anterior" | "proximo" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d={direcao === "anterior" ? "M10 3L5 8l5 5" : "M6 3l5 5-5 5"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const DURACAO_DO_DESLIZE_MS = 650;

// Leva a faixa até `alvo` quadro a quadro, com aceleração no começo e freio no fim. Feito à mão porque o navegador
// ignora o "smooth" quando o sistema pede menos movimento, e a decisão de 29/10/2026 é que a faixa deslize sempre.
// O encaixe dos cartões (snap) fica desligado durante o deslize, senão ele puxaria a faixa de volta a cada quadro.
function deslizar(el: HTMLElement, alvo: number) {
  const inicio = el.scrollLeft;
  const distancia = alvo - inicio;
  if (Math.abs(distancia) < 1) return;
  const comeco = performance.now();
  el.style.scrollSnapType = "none";
  const passo = (agora: number) => {
    const t = Math.min(1, (agora - comeco) / DURACAO_DO_DESLIZE_MS);
    const suave = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    el.scrollLeft = inicio + distancia * suave;
    if (t < 1) requestAnimationFrame(passo);
    else el.style.scrollSnapType = "";
  };
  requestAnimationFrame(passo);
}

// Os cartões de modalidade: até três, em grade; com mais, numa faixa que rola para o lado (três por vez no computador,
// um e pouco no celular), com setas e passagem automática a cada 5 s. A passagem para com o mouse ou o foco em cima
// e com a aba escondida; no fim da faixa, volta ao começo.
function FaixaDeModalidades({ rolavel, className, children }: { rolavel: boolean; className: string; children: React.ReactNode }) {
  const faixa = useRef<HTMLDivElement>(null);
  const [emUso, setEmUso] = useState(false);
  const [limites, setLimites] = useState({ inicio: true, fim: false });

  const medir = useCallback(() => {
    const el = faixa.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setLimites((l) => {
      const novo = { inicio: el.scrollLeft <= 8, fim: el.scrollLeft >= max - 8 };
      return l.inicio === novo.inicio && l.fim === novo.fim ? l : novo;
    });
  }, []);

  const rolar = useCallback((direcao: 1 | -1, voltarAoComeco = false) => {
    const el = faixa.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const cartao = el.firstElementChild?.getBoundingClientRect().width ?? 300;
    const alvo =
      voltarAoComeco && el.scrollLeft >= max - 8 ? 0 : Math.max(0, Math.min(max, el.scrollLeft + direcao * (cartao + ESPACO_ENTRE_CARTOES)));
    deslizar(el, alvo);
  }, []);

  useEffect(() => {
    const el = faixa.current;
    if (!rolavel || !el) return;
    medir();
    el.addEventListener("scroll", medir, { passive: true });
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => {
      el.removeEventListener("scroll", medir);
      observador.disconnect();
    };
  }, [rolavel, medir]);

  useEffect(() => {
    // Passa também com "menos movimento" no sistema (como a barra de avisos, decisão de 29/10/2026).
    if (!rolavel || emUso) return;
    const temporizador = setInterval(() => {
      if (document.visibilityState !== "hidden") rolar(1, true);
    }, INTERVALO_DA_FAIXA_MS);
    return () => clearInterval(temporizador);
  }, [rolavel, emUso, rolar]);

  if (!rolavel) {
    return <div className={`grid grid-cols-[repeat(auto-fit,minmax(min(100%,250px),1fr))] gap-[clamp(16px,1.6vw,24px)] ${className}`}>{children}</div>;
  }

  const classeDaSeta = (desativada: boolean) =>
    `grid h-11 w-11 place-items-center rounded-xl border border-white/20 text-white transition-colors hover:border-azul-ceu hover:bg-azul/[0.12] ${desativada ? "pointer-events-none opacity-35" : ""}`;

  return (
    <div
      className={className}
      onMouseEnter={() => setEmUso(true)}
      onMouseLeave={() => setEmUso(false)}
      onFocus={() => setEmUso(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setEmUso(false);
      }}
      onTouchStart={() => setEmUso(true)}
    >
      <div className="mb-4 flex justify-end gap-2">
        <button type="button" aria-label="Modalidades anteriores" disabled={limites.inicio} onClick={() => rolar(-1)} className={classeDaSeta(limites.inicio)}>
          <SetaDaFaixa direcao="anterior" />
        </button>
        <button type="button" aria-label="Próximas modalidades" disabled={limites.fim} onClick={() => rolar(1)} className={classeDaSeta(limites.fim)}>
          <SetaDaFaixa direcao="proximo" />
        </button>
      </div>
      {/* Respiro em volta: o cartão sobe 3 px ao passar o mouse e o escolhido tem um anel de 4 px, que o corte da faixa esconderia. */}
      <div
        ref={faixa}
        role="region"
        aria-label="Modalidades das turmas"
        tabIndex={0}
        className="sem-barra -m-2 grid snap-x snap-mandatory grid-flow-col items-stretch overflow-x-auto overscroll-x-contain p-2 [scroll-padding-inline:8px]"
        style={{ gridAutoColumns: `min(86%, calc((100% - ${2 * ESPACO_ENTRE_CARTOES}px) / 3))`, gap: ESPACO_ENTRE_CARTOES }}
      >
        {Children.map(children, (cartao) => (
          <div className="flex min-w-0 snap-start [&>*]:flex-1">{cartao}</div>
        ))}
      </div>
    </div>
  );
}

// Proporção entre teoria e questões no método da modalidade.
function BarraDoMetodo({ teoria }: { teoria: number }) {
  return (
    <span className="relative flex flex-col gap-[7px]">
      <span className="flex justify-between text-[11.5px] font-semibold uppercase tracking-[0.08em]">
        <span className="text-[#6FAEFF]">Teoria</span>
        <span className="text-[#F5B83D]">Questões</span>
      </span>
      {/* Teoria em azul, questões em âmbar: as duas partes aparecem, com um respiro entre elas. */}
      <span className="flex h-1.5 gap-[3px]" role="img" aria-label={`${teoria}% teoria e ${100 - teoria}% questões`}>
        <span className="block rounded-md bg-[linear-gradient(90deg,#2F86FF,#6FAEFF)]" style={{ width: `${teoria}%` }} />
        <span className="block flex-1 rounded-md bg-[linear-gradient(90deg,#F5B83D,#FFD27A)]" />
      </span>
    </span>
  );
}

// Cada turno com ícone e um tom da mesma escala de azul, do mais claro (manhã) ao mais escuro (noite):
// turmas iguais em turnos diferentes se distinguem de relance.
const ESTILO_DO_TURNO: Record<string, { icone: Icon; cor: string }> = {
  Manhã: { icone: Sun, cor: "bg-azul-palido text-azul-forte" },
  Tarde: { icone: SunHorizon, cor: "bg-[#BCD5FF] text-[#0C3594]" },
  Noite: { icone: Moon, cor: "bg-marinho-700 text-[#D6E6FF]" },
  Integral: { icone: Sun, cor: "bg-[#D6E5FF] text-[#123E9C]" },
};

function EtiquetaDoTurno({ turno }: { turno: string }) {
  const estilo = ESTILO_DO_TURNO[turno] ?? ESTILO_DO_TURNO.Integral;
  const Icone = estilo.icone;
  return (
    <span className={`inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-[13px] font-bold ${estilo.cor}`}>
      <Icone size={16} weight="fill" aria-hidden="true" />
      {turno}
    </span>
  );
}

// Os turnos das turmas, na ordem do dia (Manhã, Tarde, Noite), para os filtros da lista.
const ORDEM_DO_DIA = ["Manhã", "Tarde", "Noite", "Integral"];
function turnosEmOrdem(turmas: Turma[]) {
  const presentes = new Set(turmas.map((t) => t.turno).filter((t): t is string => !!t));
  return [...presentes].sort((a, b) => (ORDEM_DO_DIA.indexOf(a) + 1 || 99) - (ORDEM_DO_DIA.indexOf(b) + 1 || 99));
}

// `concurso`: só em "Todos os concursos", onde a mesma modalidade junta turmas de concursos diferentes.
function CartaoDaTurma({ turma, titulo, concurso }: { turma: Turma; titulo: string; concurso?: string | null }) {
  const situacao = SITUACAO[turma.status];
  const campos = [
    ["Início", turma.inicio],
    ["Horário", turma.horario],
  ] as const;
  const preco = turma.preco === "Consulte" ? undefined : turma.preco;
  return (
    <article className="grid animate-[q-surgir_220ms_ease_both] grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))] items-center gap-x-6 gap-y-4 rounded-2xl border border-linha bg-white p-[clamp(18px,2vw,24px)] shadow-[0_1px_2px_rgba(16,27,45,0.04),0_18px_36px_-28px_rgba(16,27,45,0.3)]">
      <div className="flex min-w-0 items-center gap-4">
        <InsigniaDaTurma insignia={turma.insignia} tamanho={64} sizes="64px" className="h-16 w-16 flex-none" />
        <div className="flex min-w-0 flex-col gap-2">
        <div className="flex flex-wrap gap-1.5">
          <span className={`inline-flex h-6 items-center whitespace-nowrap rounded-full px-[9px] text-[11px] font-bold uppercase tracking-[0.06em] ${situacao.cor}`}>
            {turma.status === "aberta" && turma.statusLabel !== "Matrículas abertas" ? turma.statusLabel : situacao.rotulo}
          </span>
          {concurso && (
            <span className="inline-flex h-6 items-center whitespace-nowrap rounded-full bg-azul-palido px-[9px] text-[11px] font-bold uppercase tracking-[0.06em] text-azul-forte">
              {concurso}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-display text-[19px] font-extrabold leading-[1.2] tracking-[-0.01em]">{titulo}</h4>
          {turma.turno && <EtiquetaDoTurno turno={turma.turno} />}
        </div>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-x-[18px] gap-y-2.5 text-sm">
        {campos.map(([rotulo, valor]) => (
          <div key={rotulo} className="flex min-w-0 flex-col gap-0.5">
            <dt className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-ardosia">{rotulo}</dt>
            <dd className={`font-semibold ${valor ? "text-tinta" : "text-ardosia"}`}>{valor ?? A_CONFIRMAR}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-col items-stretch gap-2.5">
        <div className="flex items-baseline justify-between gap-3">
          {/* Preço promocional (lote atual mais barato que o último): o cheio vem riscado no lugar do rótulo. */}
          {preco && turma.precoCheio ? (
            <span className="text-[13px] text-ardosia">
              De <s>{turma.precoCheio}</s> por
            </span>
          ) : (
            <span className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-ardosia">Valor</span>
          )}
          <span className={`font-display font-extrabold tracking-[-0.02em] ${preco ? "text-[26px] leading-none text-tinta" : "text-base text-ardosia"}`}>{preco ?? A_CONFIRMAR}</span>
        </div>
        {turma.status === "aberta" ? (
          <Link
            href={`/turmas/${turma.slug}`}
            className="btn-q btn-q-azul h-12 px-[18px] text-[15px] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_12px_24px_-14px_rgba(0,107,255,1)]"
          >
            Conhecer e matricular
          </Link>
        ) : (
          <AviseMe
            assunto={`vaga na turma ${turma.nome}`}
            rotulo={turma.status === "encerrada" ? "Lista de espera pelo WhatsApp" : "Entrar na lista de interesses"}
          />
        )}
      </div>
    </article>
  );
}

function Filtro({ rotulo, opcoes, atual, onEscolher, todos }: {
  rotulo: string;
  opcoes: string[];
  atual: string | null;
  onEscolher: (v: string | null) => void;
  todos: string;
}) {
  const chip = (ligado: boolean) =>
    `h-9 whitespace-nowrap rounded-full border px-3.5 text-[13.5px] font-semibold transition-colors ${
      ligado ? "border-marinho-900 bg-marinho-900 text-white" : "border-[#D3DCE7] bg-white text-ardosia-escura hover:border-azul"
    }`;
  return (
    // No celular, numa linha só que rola para o lado (sem sobrar um filtro sozinho embaixo).
    <div role="group" aria-label={rotulo} className="sem-barra -mx-1 flex max-w-full gap-1.5 overflow-x-auto px-1 py-0.5 sm:flex-wrap sm:overflow-visible">
      <button type="button" aria-pressed={atual === null} onClick={() => onEscolher(null)} className={chip(atual === null)}>
        {todos}
      </button>
      {opcoes.map((o) => (
        <button key={o} type="button" aria-pressed={atual === o} onClick={() => onEscolher(o)} className={chip(atual === o)}>
          {o}
        </button>
      ))}
    </div>
  );
}

// Uma aba por cargo ("SD • PMBA", "CFO • PMBA", "IPC • PCBA"…), no formato do selo da página da turma.
// Decisão de 29/10/2026: os três principais (Soldado e CFO da PMBA e Investigador da PCBA) e "Outros concursos"
// aparecem sempre; os demais só com turma cadastrada, nesta ordem e depois os desconhecidos. Sem turma, a aba
// oferece a lista de interesse.
// As da PMBA têm níveis (RONDESP, PATAMO, BOPE).
const ABAS_FIXAS = ["SD • PMBA", "CFO • PMBA", "IPC • PCBA"];
const ORDEM_DAS_ABAS = ["SD • PMBA", "CFO • PMBA", "CFS • PMBA", "SD • BMBA", "IPC • PCBA"];
const SEM_CARGO = "Outras";
// Primeira aba, aberta ao entrar na página: as modalidades e turmas de todos os concursos juntas.
const TODOS = "Todos";

// Outros jeitos de cadastrar o mesmo concurso caem na aba fixa dele, sem criar um cartão repetido.
const MESMA_ABA: Record<string, string> = {
  "SGT • PMBA": "CFS • PMBA",
  "SARGENTO • PMBA": "CFS • PMBA",
  "SD • CBMBA": "SD • BMBA",
  "INVESTIGADOR • PCBA": "IPC • PCBA",
};

function abaDa(t: Turma) {
  return t.concurso ? (MESMA_ABA[t.concurso] ?? t.concurso) : SEM_CARGO;
}

function ehDaPmba(aba: string) {
  return aba.endsWith("PMBA");
}

// "IPC • PCBA" → "ipc-pcba" (para o endereço /turmas?cargo=ipc-pcba)
export function idDaAba(aba: string) {
  return aba
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function abasDasTurmas(turmas: Turma[] | null) {
  const cadastradas = [...new Set((turmas ?? []).map(abaDa))];
  const conhecidas = ORDEM_DAS_ABAS.filter((a) => ABAS_FIXAS.includes(a) || cadastradas.includes(a));
  const outras = cadastradas.filter((a) => !ORDEM_DAS_ABAS.includes(a) && a !== SEM_CARGO).sort((a, b) => Number(ehDaPmba(b)) - Number(ehDaPmba(a)) || a.localeCompare(b));
  // "Todos os concursos" vem primeiro. Decisão de 29/10/2026: sem aba "Outros concursos"; as turmas sem concurso
  // aparecem só em "Todos".
  return [TODOS, ...conhecidas, ...outras];
}

// Turmas de um cargo sem níveis (fora da PMBA, ou da PMBA sem nível): filtro de turno e a lista.
function TurmasDoCargo({ turmas, aba }: { turmas: Turma[]; aba: string }) {
  const [turno, setTurno] = useState<string | null>(null);
  const turnos = turnosEmOrdem(turmas);
  const visiveis = turmas.filter((t) => !turno || t.turno === turno);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="flex-auto text-xs font-semibold uppercase tracking-[0.14em] text-azul-forte">Turmas</h2>
        {turnos.length > 1 && <Filtro rotulo="Turno" opcoes={turnos} atual={turno} onEscolher={setTurno} todos="Todos os turnos" />}
      </div>
      {visiveis.length > 0 ? (
        visiveis.map((t) => <CartaoDaTurma key={t.slug} turma={t} titulo={t.nome} />)
      ) : (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-linha bg-white p-[clamp(24px,3vw,36px)]">
          <span className="inline-flex h-[26px] items-center rounded-full bg-[#EEF2F7] px-2.5 text-xs font-bold uppercase tracking-[0.06em] text-[#4A5A70]">Sem oferta no momento</span>
          <span className="font-display text-xl font-extrabold">Ainda não há turmas abertas para este cargo</span>
          <span className="max-w-[560px] text-[15px] leading-[1.55] text-[#3E4A5E] [text-wrap:pretty]">Avisamos pelo WhatsApp quando abrir uma turma.</span>
          <AviseMe assunto={`turma ${aba}`} destaque />
        </div>
      )}
    </div>
  );
}

export default function EscolhaDeModalidade({
  turmas,
  inicial,
  cargoInicial = null,
}: {
  turmas: Turma[] | null;
  // ?m= do endereço: um nível da PMBA ("rondesp") ou a modalidade de outro cargo ("investigador")
  inicial: string | null;
  // id da aba no endereço (?cargo=ipc-pcba)
  cargoInicial?: string | null;
}) {
  const abas = abasDasTurmas(turmas);
  const [aba, setAba] = useState<string>(() => abas.find((a) => idDaAba(a) === cargoInicial) ?? abas[0]);
  const [selecionada, setSelecionada] = useState<string | null>(inicial);
  const [turno, setTurno] = useState<string | null>(null);
  const secaoDasTurmas = useRef<HTMLElement>(null);
  const topo = useRef<HTMLElement>(null);

  const comNiveis = ehDaPmba(aba);
  const doCargo = (turmas ?? []).filter((t) => aba === TODOS || abaDa(t) === aba);
  const opcoes = opcoesDaAba(aba, doCargo, comNiveis, turmas);
  // Aba sem níveis com uma modalidade só: ela já vem escolhida.
  const atual = opcoes.find((m) => m.id === selecionada) ?? (!comNiveis && opcoes.length === 1 ? opcoes[0] : null);
  const daModalidade = doCargo.filter((t) => atual && t.modalidadeId === atual.id);
  const turnos = turnosEmOrdem(daModalidade);
  const visiveis = daModalidade.filter((t) => !turno || t.turno === turno);
  // Turma da PMBA que não tem nível no nome: aparece embaixo, para não sumir.
  const doCargoSemNivel = comNiveis ? doCargo.filter((t) => !t.modalidade) : [];

  // Endereço compartilhável: /turmas?cargo=ipc-pcba abre já na aba.
  function trocarAba(nova: string) {
    setAba(nova);
    setTurno(null);
    const url = new URL(window.location.href);
    // "Todos os concursos" é a página sem ?cargo=.
    if (nova === TODOS) url.searchParams.delete("cargo");
    else url.searchParams.set("cargo", idDaAba(nova));
    // Os níveis valem para as abas da PMBA e para "Todos"; a modalidade de outro cargo, não.
    const comOsNiveis = (a: string) => a === TODOS || ehDaPmba(a);
    if (comOsNiveis(nova) && comOsNiveis(aba) && selecionada) url.searchParams.set("m", selecionada);
    else {
      url.searchParams.delete("m");
      setSelecionada(null);
    }
    window.history.replaceState(null, "", url);
  }

  function escolher(id: string, rolar: boolean) {
    setSelecionada(id);
    setTurno(null);
    // Endereço compartilhável: /turmas?m=patamo abre já na modalidade.
    const url = new URL(window.location.href);
    url.searchParams.set("m", id);
    window.history.replaceState(null, "", url);
    if (rolar) {
      const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      requestAnimationFrame(() => secaoDasTurmas.current?.scrollIntoView({ behavior: reduzir ? "auto" : "smooth", block: "start" }));
    }
  }

  return (
    <>
      <section ref={topo} className="relative overflow-hidden bg-marinho-950 pb-[clamp(56px,6vw,96px)] pt-[clamp(48px,6vw,88px)] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_60%_at_80%_0%,rgba(0,107,255,0.28),transparent_70%),radial-gradient(35%_50%_at_0%_100%,rgba(20,74,255,0.14),transparent_70%)]" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[length:64px_64px]"
          style={{ maskImage: "radial-gradient(60% 70% at 75% 20%, #000, transparent 75%)", WebkitMaskImage: "radial-gradient(60% 70% at 75% 20%, #000, transparent 75%)" }}
        />
        <div className="conteiner relative">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-center gap-x-[clamp(32px,5vw,80px)] gap-y-10">
            <div>
              <nav aria-label="Trilha" className="mb-5 flex gap-2 text-[13px] text-[#7F90A8]">
                <Link href="/" className="text-prata hover:text-white">
                  Início
                </Link>
                <span aria-hidden="true">/</span>
                <span aria-current="page" className="text-[#DCE4EF]">
                  Turmas presenciais
                </span>
              </nav>
              <h1 className="mb-[18px] font-display text-[clamp(2.4rem,5vw,4.2rem)] font-extrabold leading-[1.02] tracking-[-0.04em] [text-wrap:balance]">
                {comNiveis || aba === TODOS ? "Escolha o seu nível de preparação" : aba === SEM_CARGO ? "Outras turmas presenciais" : `Turmas ${DESCRICAO_DO_CONCURSO[aba]?.titulo ?? aba}`}
              </h1>
              <p className="max-w-[520px] text-[clamp(16px,1.4vw,18px)] leading-[1.6] text-[#B4C1D3] [text-wrap:pretty]">
                {aba === TODOS
                  ? "As modalidades de todos os concursos, cada uma pensada para um momento diferente dos seus estudos."
                  : comNiveis
                  ? `Três modalidades, cada uma pensada para um momento diferente dos seus estudos.`
                  : "Turma presencial com rotina estruturada, simulados nos moldes da banca e acompanhamento do seu desempenho."}
              </p>
            </div>

            {/* Escolha do concurso: cada um com o seu brasão (ou as iniciais), nome por extenso e órgão. */}
            <div className="relative rounded-[18px] border border-[rgba(111,174,255,0.2)] bg-[rgba(11,28,51,0.9)] p-[clamp(22px,2.4vw,30px)] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.05)]">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-azul-ceu">Turmas presenciais</span>
              <h2 id="escolha-do-concurso" className="mb-5 mt-1.5 font-display text-[clamp(20px,1.8vw,24px)] font-extrabold leading-[1.15] tracking-[-0.02em]">
                Para qual concurso você quer se preparar?
              </h2>
              <div role="group" aria-labelledby="escolha-do-concurso" className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,200px),1fr))] gap-2.5">
                {abas.map((a) => {
                  const ligada = aba === a;
                  const descricao = DESCRICAO_DO_CONCURSO[a];
                  return (
                    <button
                      key={a}
                      type="button"
                      aria-pressed={ligada}
                      onClick={() => trocarAba(a)}
                      // Sem brasão ("Outros concursos"), o texto fica centralizado no cartão.
                      className={`flex min-h-[76px] items-center gap-3 rounded-[12px] border px-3.5 py-3 transition-colors ${
                        a === TODOS || a === SEM_CARGO ? "justify-center text-center" : "text-left"
                      } ${
                        ligada ? "border-azul-vivo bg-azul/[0.18] shadow-[0_0_0_3px_rgba(0,107,255,0.16)]" : "border-white/10 bg-white/[0.03] hover:border-white/25"
                      }`}
                    >
                      <ImagemDoConcurso aba={a} />
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="font-display text-[16.5px] font-extrabold leading-tight text-white">{descricao?.titulo ?? a}</span>
                        {descricao && <span className="text-[12.5px] leading-snug text-[#9FB0C7]">{descricao.subtitulo}</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {opcoes.length > 0 && (
          // Com uma ou duas modalidades, os cartões ficam do tamanho dos da PMBA (um terço da largura), sem esticar.
          // Com mais de três, rolam para o lado (FaixaDeModalidades), três por vez.
          <FaixaDeModalidades
            rolavel={opcoes.length > 3}
            className={`mt-[clamp(40px,5vw,72px)] ${opcoes.length === 1 ? "max-w-[440px]" : opcoes.length === 2 ? "max-w-[900px]" : ""}`}
          >
            {opcoes.map((m) => {
              const ligada = atual?.id === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={ligada}
                  aria-controls="turmas-modalidade"
                  onClick={() => escolher(m.id, true)}
                  className={`relative flex flex-col overflow-hidden rounded-[20px] p-[clamp(22px,2.2vw,30px)] text-left text-white transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-[3px] hover:border-[rgba(111,174,255,0.5)] ${
                    ligada
                      ? "border-[1.5px] border-azul-vivo bg-[linear-gradient(180deg,#12305A,#0B1C33_70%)] shadow-[0_0_0_4px_rgba(0,107,255,0.18),0_30px_60px_-30px_rgba(0,0,0,0.9)]"
                      : "border border-white/[0.09] bg-[linear-gradient(180deg,#0F2645,#0B1C33_70%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_24px_50px_-32px_rgba(0,0,0,0.9)]"
                  }`}
                >
                  <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[clamp(110px,10vw,140px)] aspect-square w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(47,134,255,0.34),rgba(0,107,255,0.10)_60%,transparent)]" />
                  <InsigniaDaTurma
                    insignia={m.insignia}
                    tamanho={240}
                    sizes="230px"
                    priority
                    className="relative mx-auto mb-5 mt-1 block aspect-square h-auto w-[clamp(170px,15vw,230px)] [filter:drop-shadow(0_18px_28px_rgba(0,0,0,0.6))_drop-shadow(0_0_1px_rgba(170,210,255,0.5))]"
                  />
                  <span className="relative flex flex-wrap items-baseline justify-between gap-3">
                    <span className="font-display text-[clamp(24px,2vw,28px)] font-extrabold tracking-[0.02em]">{m.nome}</span>
                    {m.nivel && <span className="whitespace-nowrap text-xs font-bold uppercase tracking-[0.14em] text-azul-ceu">{m.nivel}</span>}
                  </span>
                  <span className="relative mb-5 mt-2.5 block flex-1 text-[15px] leading-[1.55] text-[#B4C1D3] [text-wrap:pretty]">{m.perfil ?? m.resumo}</span>
                  {m.teoria !== undefined && <BarraDoMetodo teoria={m.teoria} />}
                  <span className={`relative mt-[22px] inline-flex h-[46px] items-center justify-center gap-2 rounded-[10px] font-display text-[15px] font-bold ${ligada ? "bg-white/[0.08]" : "bg-azul"}`}>
                    {ligada ? "Turmas exibidas abaixo" : "Ver turmas"}
                    <SetaParaBaixo />
                  </span>
                </button>
              );
            })}
          </FaixaDeModalidades>
          )}
        </div>
      </section>

      <section id="turmas-modalidade" ref={secaoDasTurmas} className="scroll-mt-[110px] bg-nevoa py-[clamp(56px,7vw,104px)]">
        <div className="conteiner">
          {turmas === null && (
            <div role="alert" className="mb-8 rounded-2xl border border-[#9B3535]/30 bg-[#9B3535]/[0.06] p-6 text-center text-sm text-[#9B3535]">
              Não foi possível carregar as turmas agora. Tente novamente em instantes.
            </div>
          )}
          {opcoes.length === 0 ? (
            <TurmasDoCargo key={aba} turmas={doCargo} aba={aba} />
          ) : !atual ? (
            <div className="flex flex-col items-center gap-2.5 rounded-[18px] border-[1.5px] border-dashed border-[#C9D3E0] px-5 py-[clamp(40px,5vw,64px)] text-center text-[#3E4A5E]">
              <span className="font-display text-[22px] font-extrabold text-tinta">Selecione uma modalidade</span>
              <span className="max-w-[440px] text-[15px] [text-wrap:pretty]">As turmas disponíveis aparecem aqui, organizadas por concurso e turno.</span>
            </div>
          ) : (
            <div className="flex flex-wrap items-start gap-[clamp(28px,3vw,48px)]">
              <aside className="flex max-w-[440px] flex-[1_1_320px] flex-col gap-5 rounded-[18px] bg-marinho-900 p-[clamp(22px,2.4vw,30px)] text-white shadow-[0_30px_60px_-36px_rgba(7,20,38,0.7)] min-[900px]:sticky min-[900px]:top-[124px]">
                <div className="flex items-center gap-4">
                  <InsigniaDaTurma insignia={atual.insignia} tamanho={84} sizes="84px" className="h-[84px] w-[84px] flex-none" />
                  <div className="flex flex-col gap-1">
                    <span className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-azul-ceu">{atual.nivel ?? (aba === TODOS ? "Turma presencial" : aba)}</span>
                    <span className="font-display text-[28px] font-extrabold tracking-[0.02em]">{atual.nome}</span>
                  </div>
                </div>
                {atual.perfil ? (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-[#8FA0B8]">Perfil indicado</span>
                      <p className="text-[15px] leading-[1.55] text-[#DCE4EF] [text-wrap:pretty]">{atual.perfil}</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-[#8FA0B8]">Metodologia</span>
                      <p className="text-[15px] leading-[1.55] text-[#DCE4EF] [text-wrap:pretty]">{atual.metodo}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-[15px] leading-[1.55] text-[#DCE4EF] [text-wrap:pretty]">{atual.resumo}</p>
                )}
                {atual.teoria !== undefined && <BarraDoMetodo teoria={atual.teoria} />}
                {opcoes.length > 1 && (
                  <div className="flex flex-wrap gap-1.5 border-t border-white/[0.08] pt-4">
                    {opcoes.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        aria-pressed={atual.id === m.id}
                        onClick={() => escolher(m.id, false)}
                        className={`h-[34px] rounded-lg border px-3 font-display text-[12.5px] font-bold tracking-[0.06em] ${
                          atual.id === m.id ? "border-azul bg-azul text-white" : "border-white/[0.14] text-prata hover:text-white"
                        }`}
                      >
                        {m.nome}
                      </button>
                    ))}
                  </div>
                )}
              </aside>

              <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="flex-auto text-xs font-semibold uppercase tracking-[0.14em] text-azul-forte">Turmas</h2>
                  {turnos.length > 1 && <Filtro rotulo="Turno" opcoes={turnos} atual={turno} onEscolher={setTurno} todos="Todos os turnos" />}
                </div>

                {visiveis.length > 0 ? (
                  visiveis.map((t) => <CartaoDaTurma key={t.slug} turma={t} titulo={t.nome} concurso={aba === TODOS ? t.concurso : undefined} />)
                ) : (
                  <div className="flex flex-col items-start gap-3 rounded-2xl border border-linha bg-white p-[clamp(24px,3vw,36px)]">
                    <span className="inline-flex h-[26px] items-center rounded-full bg-[#EEF2F7] px-2.5 text-xs font-bold uppercase tracking-[0.06em] text-[#4A5A70]">Sem oferta no momento</span>
                    <span className="font-display text-xl font-extrabold">
                      Ainda não há turmas abertas nesta modalidade
                    </span>
                    <span className="max-w-[560px] text-[15px] leading-[1.55] text-[#3E4A5E] [text-wrap:pretty]">
                      {atual.perfil ? `${atual.perfil} ${atual.metodo}` : "Avisamos pelo WhatsApp quando abrir uma turma."}
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-2.5">
                      <AviseMe assunto={`turma ${atual.nome} ${aba}`} destaque />
                      <button
                        type="button"
                        onClick={() => topo.current?.scrollIntoView({ behavior: "smooth" })}
                        className="btn-q btn-q-contorno h-12 px-[18px] text-[15px]"
                      >
                        Conhecer outras modalidades
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Turma da PMBA cadastrada sem nível no nome: continua à venda, embaixo. */}
          {comNiveis && doCargoSemNivel.length > 0 && (
            <div className="mt-[clamp(48px,6vw,80px)]">
              <TurmasDoCargo turmas={doCargoSemNivel} aba={aba} />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
