"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import type { Turma } from "@/lib/data";
import { modalidades, type Modalidade } from "@/lib/conteudo";
import AviseMe from "../AviseMePeloWhatsApp";

type IdDaModalidade = Modalidade["id"];

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
      <span className="flex justify-between text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[#8FA0B8]">
        <span>Teoria</span>
        <span>Questões</span>
      </span>
      <span className="flex h-1.5 overflow-hidden rounded-md bg-white/10" role="img" aria-label={`${teoria}% teoria e ${100 - teoria}% questões`}>
        <span className="block rounded-md bg-[linear-gradient(90deg,#2F86FF,#6FAEFF)]" style={{ width: `${teoria}%` }} />
      </span>
    </span>
  );
}

function CartaoDaTurma({ turma, titulo }: { turma: Turma; titulo: string }) {
  const situacao = SITUACAO[turma.status];
  const campos = [
    ["Turno", turma.turno],
    ["Horário", undefined],
    ["Início", turma.inicio],
    ["Valor", turma.preco === "Consulte" ? undefined : `${turma.preco}${turma.precoSufixo ?? ""}`],
  ] as const;
  return (
    <article className="grid animate-[q-surgir_220ms_ease_both] grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))] items-center gap-x-6 gap-y-4 rounded-2xl border border-linha bg-white p-[clamp(18px,2vw,24px)] shadow-[0_1px_2px_rgba(16,27,45,0.04),0_18px_36px_-28px_rgba(16,27,45,0.3)]">
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex flex-wrap gap-1.5">
          <span className={`inline-flex h-6 items-center whitespace-nowrap rounded-full px-[9px] text-[11px] font-bold uppercase tracking-[0.06em] ${situacao.cor}`}>
            {turma.status === "aberta" && turma.statusLabel !== "Matrículas abertas" ? turma.statusLabel : situacao.rotulo}
          </span>
        </div>
        <h4 className="font-display text-[19px] font-extrabold leading-[1.2] tracking-[-0.01em]">{titulo}</h4>
      </div>
      <dl className="grid grid-cols-2 gap-x-[18px] gap-y-2.5 text-sm">
        {campos.map(([rotulo, valor]) => (
          <div key={rotulo} className="flex min-w-0 flex-col gap-0.5">
            <dt className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-ardosia">{rotulo}</dt>
            <dd className={`font-semibold ${valor ? "text-tinta" : "text-ardosia"}`}>{valor ?? A_CONFIRMAR}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-col items-stretch gap-1.5">
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
            rotulo={turma.status === "encerrada" ? "Lista de espera pelo WhatsApp" : "Avise-me pelo WhatsApp"}
          />
        )}
      </div>
    </article>
  );
}

// Turmas agrupadas por concurso. O título é o nome da turma: duas turmas da mesma modalidade e concurso
// (ex.: Patamo e Patamo II) ficariam iguais no formato "MODALIDADE — Concurso" do protótipo.
function ListaDeTurmas({ turmas }: { turmas: Turma[] }) {
  const concursos = [...new Set(turmas.map((t) => t.concurso ?? "Concurso a confirmar"))];
  return (
    <>
      {concursos.map((concurso) => (
        <div key={concurso} className="flex flex-col gap-3">
          <h3 className="mt-2 font-display text-[17px] font-extrabold">{concurso}</h3>
          {turmas
            .filter((t) => (t.concurso ?? "Concurso a confirmar") === concurso)
            .map((t) => (
              <CartaoDaTurma key={t.slug} turma={t} titulo={t.nome} />
            ))}
        </div>
      ))}
    </>
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

type Area = Turma["area"];

const AREAS: { id: Area; nome: string; detalhe: string }[] = [
  { id: "pmba", nome: "Polícia Militar da Bahia", detalhe: "Soldado e CFO · escolha o seu nível" },
  { id: "outros", nome: "Outros concursos", detalhe: "Polícia Civil, Bombeiros e outros estados" },
];

// Turmas de outros concursos (sem nível): filtros de concurso e turno e a lista agrupada por concurso.
function TurmasDeOutrosConcursos({ turmas }: { turmas: Turma[] }) {
  const [concurso, setConcurso] = useState<string | null>(null);
  const [turno, setTurno] = useState<string | null>(null);
  const concursos = [...new Set(turmas.map((t) => t.concurso).filter((c): c is string => !!c))];
  const turnos = [...new Set(turmas.map((t) => t.turno).filter((t): t is string => !!t))];
  const visiveis = turmas.filter((t) => (!concurso || t.concurso === concurso) && (!turno || t.turno === turno));
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex-auto">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-azul-forte">Turmas</span>
          <h2 className="mt-2 font-display text-[clamp(1.8rem,3vw,2.5rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">Outros concursos</h2>
        </div>
        {(concursos.length > 1 || turnos.length > 1) && (
          <div className="flex flex-wrap gap-4">
            <Filtro rotulo="Concurso" opcoes={concursos} atual={concurso} onEscolher={setConcurso} todos="Todos os concursos" />
            <Filtro rotulo="Turno" opcoes={turnos} atual={turno} onEscolher={setTurno} todos="Todos os turnos" />
          </div>
        )}
      </div>
      {visiveis.length > 0 ? (
        <ListaDeTurmas turmas={visiveis} />
      ) : (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-linha bg-white p-[clamp(24px,3vw,36px)]">
          <span className="inline-flex h-[26px] items-center rounded-full bg-[#EEF2F7] px-2.5 text-xs font-bold uppercase tracking-[0.06em] text-[#4A5A70]">Sem oferta no momento</span>
          <span className="font-display text-xl font-extrabold">Não há turmas abertas para outros concursos agora</span>
          <span className="max-w-[560px] text-[15px] leading-[1.55] text-[#3E4A5E] [text-wrap:pretty]">
            Avisamos pelo WhatsApp quando abrir uma turma para o seu concurso.
          </span>
          <AviseMe assunto="turma para outros concursos" destaque />
        </div>
      )}
    </div>
  );
}

export default function EscolhaDeModalidade({
  turmas,
  inicial,
  areaInicial = "pmba",
}: {
  turmas: Turma[] | null;
  inicial: IdDaModalidade | null;
  areaInicial?: Area;
}) {
  const [area, setArea] = useState<Area>(areaInicial);
  const [selecionada, setSelecionada] = useState<IdDaModalidade | null>(inicial);
  const [resposta, setResposta] = useState<number | null>(null);
  const [concurso, setConcurso] = useState<string | null>(null);
  const [turno, setTurno] = useState<string | null>(null);
  const secaoDasTurmas = useRef<HTMLElement>(null);
  const topo = useRef<HTMLElement>(null);

  const sugerida = resposta === null ? null : modalidades.find((m) => m.id === PERGUNTAS[resposta].modalidade) ?? null;
  const atual = modalidades.find((m) => m.id === selecionada) ?? null;
  const daModalidade = (turmas ?? []).filter((t) => atual && t.modalidade === atual.id);
  const concursos = [...new Set(daModalidade.map((t) => t.concurso).filter((c): c is string => !!c))];
  const turnos = [...new Set(daModalidade.map((t) => t.turno).filter((t): t is string => !!t))];
  const visiveis = daModalidade.filter((t) => (!concurso || t.concurso === concurso) && (!turno || t.turno === turno));
  const deOutrosConcursos = (turmas ?? []).filter((t) => t.area === "outros");

  // Endereço compartilhável: /turmas?area=outros abre já em "Outros concursos".
  function trocarArea(nova: Area) {
    setArea(nova);
    const url = new URL(window.location.href);
    if (nova === "outros") {
      url.searchParams.set("area", "outros");
      url.searchParams.delete("m");
    } else {
      url.searchParams.delete("area");
      if (selecionada) url.searchParams.set("m", selecionada);
    }
    window.history.replaceState(null, "", url);
  }

  function escolher(id: IdDaModalidade, rolar: boolean) {
    setSelecionada(id);
    setConcurso(null);
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
              <div role="group" aria-label="Concurso" className="mb-7 inline-grid max-w-full grid-cols-2 gap-1 rounded-[14px] border border-white/10 bg-white/[0.04] p-1">
                {AREAS.map((a) => {
                  const ligada = area === a.id;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      aria-pressed={ligada}
                      onClick={() => trocarArea(a.id)}
                      className={`flex flex-col items-start rounded-[10px] px-4 py-2.5 text-left transition-colors ${
                        ligada ? "bg-white text-marinho-950" : "text-white hover:bg-white/[0.06]"
                      }`}
                    >
                      <span className="font-display text-[15px] font-bold leading-tight">{a.nome}</span>
                      <span className={`mt-0.5 text-[12px] leading-tight ${ligada ? "text-ardosia" : "text-prata"}`}>{a.detalhe}</span>
                    </button>
                  );
                })}
              </div>
              <h1 className="mb-[18px] font-display text-[clamp(2.4rem,5vw,4.2rem)] font-extrabold leading-[1.02] tracking-[-0.04em] [text-wrap:balance]">
                {area === "pmba" ? "Escolha o seu nível de preparação" : "Turmas para outros concursos"}
              </h1>
              <p className="max-w-[520px] text-[clamp(16px,1.4vw,18px)] leading-[1.6] text-[#B4C1D3] [text-wrap:pretty]">
                {area === "pmba"
                  ? "Para os concursos da PM-BA (Soldado e CFO): três modalidades de preparação, cada uma pensada para um momento diferente dos seus estudos."
                  : "Polícia Civil, Bombeiros e concursos de outros estados. Cada concurso tem a sua turma presencial, com edições e turnos."}
              </p>
            </div>

            {area === "pmba" && (
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
                    <Image src={sugerida.insignia} alt="" width={72} height={72} className="h-[72px] w-[72px] object-contain [filter:drop-shadow(0_6px_14px_rgba(0,0,0,0.5))]" />
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

          {area === "pmba" && (
          <div className="mt-[clamp(40px,5vw,72px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,250px),1fr))] gap-[clamp(16px,1.6vw,24px)]">
            {modalidades.map((m) => {
              const ligada = selecionada === m.id;
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
                  <Image
                    src={m.insignia}
                    alt={`Insígnia ${m.nome}`}
                    width={240}
                    height={240}
                    priority
                    className="relative mx-auto mb-5 mt-1 block aspect-square h-auto w-[clamp(170px,15vw,230px)] object-contain [filter:drop-shadow(0_18px_28px_rgba(0,0,0,0.6))_drop-shadow(0_0_1px_rgba(170,210,255,0.5))]"
                  />
                  <span className="relative flex flex-wrap items-baseline justify-between gap-3">
                    <span className="font-display text-[clamp(24px,2vw,28px)] font-extrabold tracking-[0.02em]">{m.nome}</span>
                    <span className="whitespace-nowrap text-xs font-bold uppercase tracking-[0.14em] text-azul-ceu">{m.nivel}</span>
                  </span>
                  <span className="relative mb-5 mt-2.5 block flex-1 text-[15px] leading-[1.55] text-[#B4C1D3] [text-wrap:pretty]">{m.perfil}</span>
                  <BarraDoMetodo teoria={m.teoria} />
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
          {area === "outros" ? (
            <TurmasDeOutrosConcursos turmas={deOutrosConcursos} />
          ) : !atual ? (
            <div className="flex flex-col items-center gap-2.5 rounded-[18px] border-[1.5px] border-dashed border-[#C9D3E0] px-5 py-[clamp(40px,5vw,64px)] text-center text-[#3E4A5E]">
              <span className="font-display text-[22px] font-extrabold text-tinta">Selecione uma modalidade</span>
              <span className="max-w-[440px] text-[15px] [text-wrap:pretty]">As turmas disponíveis aparecem aqui, organizadas por concurso e turno.</span>
            </div>
          ) : (
            <div className="flex flex-wrap items-start gap-[clamp(28px,3vw,48px)]">
              <aside className="flex max-w-[440px] flex-[1_1_320px] flex-col gap-5 rounded-[18px] bg-marinho-900 p-[clamp(22px,2.4vw,30px)] text-white shadow-[0_30px_60px_-36px_rgba(7,20,38,0.7)] min-[900px]:sticky min-[900px]:top-[124px]">
                <div className="flex items-center gap-4">
                  <Image src={atual.insignia} alt="" width={84} height={84} className="h-[84px] w-[84px] flex-none object-contain [filter:drop-shadow(0_8px_16px_rgba(0,0,0,0.5))]" />
                  <div className="flex flex-col gap-1">
                    <span className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-azul-ceu">{atual.nivel}</span>
                    <span className="font-display text-[28px] font-extrabold tracking-[0.02em]">{atual.nome}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-[#8FA0B8]">Perfil indicado</span>
                  <p className="text-[15px] leading-[1.55] text-[#DCE4EF] [text-wrap:pretty]">{atual.perfil}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-[#8FA0B8]">Metodologia</span>
                  <p className="text-[15px] leading-[1.55] text-[#DCE4EF] [text-wrap:pretty]">{atual.metodo}</p>
                </div>
                <BarraDoMetodo teoria={atual.teoria} />
                <div className="flex flex-wrap gap-1.5 border-t border-white/[0.08] pt-4">
                  {modalidades.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      aria-pressed={selecionada === m.id}
                      onClick={() => escolher(m.id, false)}
                      className={`h-[34px] rounded-lg border px-3 font-display text-[12.5px] font-bold tracking-[0.06em] ${
                        selecionada === m.id ? "border-azul bg-azul text-white" : "border-white/[0.14] text-prata hover:text-white"
                      }`}
                    >
                      {m.nome}
                    </button>
                  ))}
                </div>
              </aside>

              <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-5">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div className="flex-auto">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-azul-forte">Turmas</span>
                    <h2 className="mt-2 font-display text-[clamp(1.8rem,3vw,2.5rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">Turmas {atual.nome}</h2>
                  </div>
                  {(concursos.length > 1 || turnos.length > 1) && (
                    <div className="flex flex-wrap gap-4">
                      <Filtro rotulo="Concurso" opcoes={concursos} atual={concurso} onEscolher={setConcurso} todos="Todos os concursos" />
                      <Filtro rotulo="Turno" opcoes={turnos} atual={turno} onEscolher={setTurno} todos="Todos os turnos" />
                    </div>
                  )}
                </div>

                {visiveis.length > 0 ? (
                  <ListaDeTurmas turmas={visiveis} />
                ) : (
                  <div className="flex flex-col items-start gap-3 rounded-2xl border border-linha bg-white p-[clamp(24px,3vw,36px)]">
                    <span className="inline-flex h-[26px] items-center rounded-full bg-[#EEF2F7] px-2.5 text-xs font-bold uppercase tracking-[0.06em] text-[#4A5A70]">Sem oferta no momento</span>
                    <span className="font-display text-xl font-extrabold">Não há turmas {atual.nome} abertas agora</span>
                    <span className="max-w-[560px] text-[15px] leading-[1.55] text-[#3E4A5E] [text-wrap:pretty]">
                      {atual.perfil} {atual.metodo}
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-2.5">
                      <AviseMe assunto={`turma ${atual.nome}`} destaque />
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

          {/* Na PMBA, um atalho para quem procura outro concurso (as turmas sem nível ficam na outra área). */}
          {area === "pmba" && deOutrosConcursos.length > 0 && (
            <p className="mt-[clamp(32px,4vw,56px)] text-center text-[15px] text-ardosia">
              Procurando Polícia Civil, Bombeiros ou outro estado?{" "}
              <button type="button" onClick={() => trocarArea("outros")} className="font-semibold text-azul-forte underline underline-offset-2 hover:text-azul">
                Ver turmas de outros concursos
              </button>
            </p>
          )}
        </div>
      </section>
    </>
  );
}
