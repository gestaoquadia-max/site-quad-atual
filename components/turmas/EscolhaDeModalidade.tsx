"use client";

import Link from "next/link";
import { Moon, Sun, SunHorizon, type Icon } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import type { Turma } from "@/lib/data";
import { modalidades, type Modalidade } from "@/lib/conteudo";
import AviseMe from "../AviseMePeloWhatsApp";
import InsigniaDaTurma from "./InsigniaDaTurma";

type IdDaModalidade = Modalidade["id"];

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

function opcoesDaAba(aba: string, doCargo: Turma[], comNiveis: boolean): OpcaoDeModalidade[] {
  if (comNiveis) return modalidades.map((m) => ({ ...m }));
  const porId = new Map<string, Turma[]>();
  for (const t of doCargo) porId.set(t.modalidadeId, [...(porId.get(t.modalidadeId) ?? []), t]);
  return [...porId.values()].map((turmas) => {
    const abertas = turmas.filter((t) => t.status === "aberta").length;
    return {
      id: turmas[0].modalidadeId,
      nome: turmas[0].modalidadeNome,
      insignia: turmas[0].insignia,
      resumo: `Turma presencial para ${aba === SEM_CARGO ? "o seu concurso" : aba}. ${
        abertas === 0 ? "Sem matrículas abertas no momento." : abertas === 1 ? "1 turma com matrículas abertas." : `${abertas} turmas com matrículas abertas.`
      }`,
    };
  });
}

const PERGUNTAS: { modalidade: IdDaModalidade; rotulo: string; explicacao: string }[] = [
  {
    modalidade: "rondesp",
    rotulo: "Quero começar ou fortalecer minha base.",
    explicacao: "Você quer aprender os conteúdos desde a base, com aulas teóricas e questões de fixação.",
  },
  {
    modalidade: "patamo",
    rotulo: "Já estudei e preciso consolidar os assuntos.",
    explicacao: "Você já tem algum conhecimento e quer consolidar os conteúdos, equilibrando teoria e resolução de questões.",
  },
  {
    modalidade: "bope",
    rotulo: "Tenho uma boa base e quero focar em questões.",
    explicacao:
      "Você já tem uma base e quer intensificar o treino com resolução de questões, revisão e aprimoramento do desempenho.",
  },
];

const SITUACAO: Record<Turma["status"], { rotulo: string; cor: string }> = {
  aberta: { rotulo: "Matrículas abertas", cor: "bg-[#E3F5EA] text-[#17663F]" },
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

function SetaParaDireita() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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

// Cada turno com cor e ícone próprios: turmas iguais em turnos diferentes se distinguem de relance.
const ESTILO_DO_TURNO: Record<string, { icone: Icon; cor: string }> = {
  Manhã: { icone: Sun, cor: "bg-[#FFF4D6] text-[#7A5A00]" },
  Tarde: { icone: SunHorizon, cor: "bg-[#FFE9DA] text-[#94400A]" },
  Noite: { icone: Moon, cor: "bg-[#E9EAFF] text-[#3B3FA8]" },
  Integral: { icone: Sun, cor: "bg-azul-palido text-azul-forte" },
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

function CartaoDaTurma({ turma, titulo }: { turma: Turma; titulo: string }) {
  const situacao = SITUACAO[turma.status];
  const campos = [
    ["Início", turma.inicio],
    ["Horário", undefined],
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
          <span className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-ardosia">Valor</span>
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
    <div role="group" aria-label={rotulo} className="flex flex-wrap gap-1.5">
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
// As da PMBA aparecem sempre e têm níveis (RONDESP, PATAMO, BOPE); as outras surgem conforme as turmas cadastradas.
const ABAS_FIXAS = ["SD • PMBA", "CFO • PMBA"];
const SEM_CARGO = "Outras";

function abaDa(t: Turma) {
  return t.concurso ?? SEM_CARGO;
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
  const outras = cadastradas.filter((a) => !ABAS_FIXAS.includes(a) && a !== SEM_CARGO).sort((a, b) => Number(ehDaPmba(b)) - Number(ehDaPmba(a)) || a.localeCompare(b));
  return [...ABAS_FIXAS, ...outras, ...(cadastradas.includes(SEM_CARGO) ? [SEM_CARGO] : [])];
}

// Turmas de um cargo sem níveis (fora da PMBA, ou da PMBA sem nível): filtro de turno e a lista.
function TurmasDoCargo({ turmas, aba }: { turmas: Turma[]; aba: string }) {
  const [turno, setTurno] = useState<string | null>(null);
  const turnos = [...new Set(turmas.map((t) => t.turno).filter((t): t is string => !!t))];
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
  const [resposta, setResposta] = useState<number | null>(null);
  const [turno, setTurno] = useState<string | null>(null);
  const secaoDasTurmas = useRef<HTMLElement>(null);
  const topo = useRef<HTMLElement>(null);

  const comNiveis = ehDaPmba(aba);
  const doCargo = (turmas ?? []).filter((t) => abaDa(t) === aba);
  const opcoes = opcoesDaAba(aba, doCargo, comNiveis);
  const sugerida = resposta === null ? null : opcoes.find((m) => m.id === PERGUNTAS[resposta].modalidade) ?? null;
  // Aba sem níveis com uma modalidade só: ela já vem escolhida.
  const atual = opcoes.find((m) => m.id === selecionada) ?? (!comNiveis && opcoes.length === 1 ? opcoes[0] : null);
  const daModalidade = doCargo.filter((t) => atual && t.modalidadeId === atual.id);
  const turnos = [...new Set(daModalidade.map((t) => t.turno).filter((t): t is string => !!t))];
  const visiveis = daModalidade.filter((t) => !turno || t.turno === turno);
  // Turma da PMBA que não tem nível no nome: aparece embaixo, para não sumir.
  const doCargoSemNivel = comNiveis ? doCargo.filter((t) => !t.modalidade) : [];

  // Endereço compartilhável: /turmas?cargo=ipc-pcba abre já na aba.
  function trocarAba(nova: string) {
    setAba(nova);
    setTurno(null);
    const url = new URL(window.location.href);
    url.searchParams.set("cargo", idDaAba(nova));
    // Os níveis valem para as duas abas da PMBA; a modalidade de outro cargo, não.
    if (ehDaPmba(nova) && ehDaPmba(aba) && selecionada) url.searchParams.set("m", selecionada);
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
              <div role="group" aria-label="Cargo" className="sem-barra -mx-1 mb-7 flex max-w-full gap-1.5 overflow-x-auto px-1 py-1">
                {abas.map((a) => {
                  const ligada = aba === a;
                  return (
                    <button
                      key={a}
                      type="button"
                      aria-pressed={ligada}
                      onClick={() => trocarAba(a)}
                      className={`h-11 flex-none whitespace-nowrap rounded-[10px] border px-4 font-display text-[15px] font-bold transition-colors ${
                        ligada ? "border-white bg-white text-marinho-950" : "border-white/15 bg-white/[0.04] text-white hover:border-azul-ceu"
                      }`}
                    >
                      {a}
                    </button>
                  );
                })}
              </div>
              <h1 className="mb-[18px] font-display text-[clamp(2.4rem,5vw,4.2rem)] font-extrabold leading-[1.02] tracking-[-0.04em] [text-wrap:balance]">
                {comNiveis ? "Escolha o seu nível de preparação" : aba === SEM_CARGO ? "Outras turmas presenciais" : `Turmas ${aba}`}
              </h1>
              <p className="max-w-[520px] text-[clamp(16px,1.4vw,18px)] leading-[1.6] text-[#B4C1D3] [text-wrap:pretty]">
                {comNiveis
                  ? `Para ${aba}: três modalidades de preparação, cada uma pensada para um momento diferente dos seus estudos.`
                  : "Turma presencial com rotina estruturada, simulados nos moldes da banca e acompanhamento do seu desempenho."}
              </p>
            </div>

            {comNiveis && (
            <div className="relative rounded-[18px] border border-[rgba(111,174,255,0.2)] bg-[rgba(11,28,51,0.9)] p-[clamp(22px,2.4vw,30px)] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.05)]">
              <h2 id="pergunta-modalidade" className="mb-4 font-display text-xl font-extrabold tracking-[-0.02em]">
                Qual preparação combina com você?
              </h2>
              <div role="radiogroup" aria-labelledby="pergunta-modalidade" className="flex flex-col gap-2">
                {PERGUNTAS.map((p, i) => {
                  const marcada = resposta === i;
                  return (
                    <button
                      key={p.modalidade}
                      type="button"
                      role="radio"
                      aria-checked={marcada}
                      onClick={() => setResposta(i)}
                      className={`flex min-h-[52px] items-center gap-3 rounded-[11px] px-4 py-3 text-left text-[15px] font-medium transition-colors ${
                        marcada ? "border border-azul-vivo bg-azul/[0.18] text-white" : "border border-white/10 bg-white/[0.03] text-[#DCE4EF] hover:border-white/25"
                      }`}
                    >
                      <span className={`h-[18px] w-[18px] flex-none rounded-full transition-all ${marcada ? "border-[5px] border-azul-vivo bg-white" : "border-[1.5px] border-[#6B7C94]"}`} />
                      <span>{p.rotulo}</span>
                    </button>
                  );
                })}
              </div>
              {sugerida && resposta !== null && (
                <>
                  <div className="mt-4 grid animate-[q-surgir_240ms_ease_both] grid-cols-[72px_minmax(0,1fr)] items-center gap-4 rounded-[14px] border border-[rgba(111,174,255,0.28)] bg-[linear-gradient(135deg,rgba(0,107,255,0.16),rgba(0,107,255,0.04))] p-4">
                    <InsigniaDaTurma insignia={sugerida.insignia} tamanho={72} sizes="72px" className="h-[72px] w-[72px]" />
                    <div className="flex flex-col gap-1.5" aria-live="polite">
                      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-azul-ceu">Modalidade sugerida</span>
                      <span className="font-display text-[22px] font-extrabold tracking-[-0.01em]">{sugerida.nome}</span>
                      <span className="text-sm leading-[1.5] text-prata-clara [text-wrap:pretty]">{PERGUNTAS[resposta].explicacao}</span>
                      <button type="button" onClick={() => escolher(sugerida.id, true)} className="btn-q btn-q-azul mt-1 h-10 self-start rounded-[9px] px-4 text-sm">
                        Ver turmas {sugerida.nome}
                        <SetaParaDireita />
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-[12.5px] text-[#8FA0B8]">A sugestão ajuda na escolha, mas você pode conhecer e selecionar qualquer modalidade.</p>
                </>
              )}
            </div>
            )}
          </div>

          {opcoes.length > 0 && (
          // Com uma ou duas modalidades, os cartões ficam do tamanho dos da PMBA (um terço da largura), sem esticar.
          <div
            className={`mt-[clamp(40px,5vw,72px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,250px),1fr))] gap-[clamp(16px,1.6vw,24px)] ${
              opcoes.length === 1 ? "max-w-[440px]" : opcoes.length === 2 ? "max-w-[900px]" : ""
            }`}
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
                  {sugerida?.id === m.id && (
                    <span className="absolute right-4 top-4 whitespace-nowrap rounded-full bg-azul px-2.5 py-[5px] text-[11px] font-bold uppercase tracking-[0.1em]">Sugerida para você</span>
                  )}
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
          </div>
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
                    <span className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-azul-ceu">{atual.nivel ?? aba}</span>
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
                  visiveis.map((t) => <CartaoDaTurma key={t.slug} turma={t} titulo={t.nome} />)
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
