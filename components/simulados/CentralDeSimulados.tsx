"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import {
  carreiras,
  combos,
  comboAVenda,
  dataCurta,
  formatosDa,
  hojeEmBrasilia,
  precoOuACadastrar,
  ROTULO_DO_FORMATO,
  situacaoDa,
  validarCompra,
  type Carreira,
  type Edicao,
  type FormatoDeEstudo,
  type Situacao,
} from "@/lib/simulados";

export type Modo = "presenciais" | "individuais" | "combos";

const ABAS: { modo: Modo; numero: string; titulo: string; legenda: string }[] = [
  { modo: "presenciais", numero: "01", titulo: "Presenciais", legenda: "Inscrição na aplicação" },
  { modo: "individuais", numero: "02", titulo: "Individuais", legenda: "PDF, plataforma ou impresso" },
  { modo: "combos", numero: "03", titulo: "Combos", legenda: "Pacotes de edições" },
];

type EdicaoComSituacao = Edicao & { st: Situacao };

const SELOS = {
  abertas: "bg-sucesso-fundo text-sucesso",
  breve: "bg-[#EEF2F7] text-[#4A5A70]",
  esgotado: "bg-[#FFF0D9] text-[#8A4B00]",
  estudo: "bg-azul-palido text-azul-forte",
};

function Selo({ tom, children }: { tom: keyof typeof SELOS; children: React.ReactNode }) {
  return <span className={`inline-flex h-[22px] items-center whitespace-nowrap rounded-full px-2 text-[11.5px] font-semibold ${SELOS[tom]}`}>{children}</span>;
}

// Texto explicativo atrás do (i): abre ao clicar ou tocar, fecha com Esc, clique fora ou novo clique.
function Dica({ id, aberta, onAlternar, children }: { id: string; aberta: boolean; onAlternar: () => void; children: React.ReactNode }) {
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label="Mais informações"
        aria-expanded={aberta}
        aria-controls={id}
        data-dica=""
        onClick={onAlternar}
        className="grid h-[26px] w-[26px] place-items-center rounded-full border border-linha-forte bg-white font-display text-[13px] font-bold text-ardosia-escura hover:border-azul hover:text-azul"
      >
        i
      </button>
      {aberta && (
        <span
          id={id}
          role="note"
          data-dica=""
          className="absolute left-0 top-[calc(100%+8px)] z-20 w-[min(320px,80vw)] animate-[q-surgir_160ms_ease_both] rounded-xl bg-marinho-950 p-3.5 text-[13.5px] font-normal leading-[1.5] tracking-normal text-[#DCE4EF] shadow-[0_20px_40px_-16px_rgba(0,0,0,0.6)]"
        >
          {children}
        </span>
      )}
    </span>
  );
}

function Numero({ n, destaque }: { n: number; destaque: boolean }) {
  return (
    <span className={`grid h-[60px] w-[60px] flex-none place-items-center rounded-xl leading-none ${destaque ? "bg-white/10 text-white" : "bg-azul-gelo text-azul-forte"}`}>
      <span className="text-center">
        <span className="block text-[10px] font-bold tracking-[0.1em]">Nº</span>
        <span className="font-display text-[22px] font-extrabold">{n}</span>
      </span>
    </span>
  );
}

function LinhaDaEdicao({ e, selecionada, onSelecionar, tipo, acao }: {
  e: EdicaoComSituacao;
  selecionada: boolean;
  onSelecionar: () => void;
  tipo: "aberta" | "breve" | "anterior";
  acao?: React.ReactNode;
}) {
  const formatos = formatosDa(e).filter((f) => f.oferta.disponivel).map((f) => ROTULO_DO_FORMATO[f.formato].curto);
  const pres = e.presencial;
  const linha =
    tipo === "anterior"
      ? [e.data && `Aplicado em ${dataCurta(e.data)}`, ...formatos].filter(Boolean).join(" · ")
      : e.st.confirmada
        ? [dataCurta(e.data!), e.horario, e.local].join(" · ")
        : "Data e horário ainda não definidos";
  return (
    <div
      className={`flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border px-3 py-3 transition-colors sm:pr-4 ${
        selecionada ? "border-marinho-900 bg-marinho-900 text-white" : "border-linha bg-white hover:border-azul/50"
      }`}
    >
      <button type="button" onClick={onSelecionar} aria-pressed={selecionada} className="flex min-w-0 flex-[1_1_320px] items-center gap-4 text-left">
        <Numero n={e.numero} destaque={selecionada} />
        <span className="flex min-w-0 flex-col gap-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-display text-lg font-extrabold tracking-[-0.01em]">
              Simulado {e.numero}
              {tipo === "anterior" ? " — Já realizado" : ""}
            </span>
            {tipo === "aberta" && <Selo tom={e.st.inscricao === "esgotado" ? "esgotado" : "abertas"}>{e.st.inscricao === "esgotado" ? "Esgotado" : "Inscrições abertas"}</Selo>}
            {tipo === "breve" && <Selo tom="breve">A confirmar</Selo>}
          </span>
          <span className={`text-sm ${selecionada ? "text-prata-clara" : "text-ardosia"}`}>{linha}</span>
          {tipo === "aberta" && pres?.vagas != null && (
            <span className={`text-[13px] font-semibold ${selecionada ? "text-azul-ceu" : "text-azul-forte"}`}>
              {pres.vagasRestantes ?? pres.vagas} de {pres.vagas} vagas disponíveis
            </span>
          )}
        </span>
      </button>
      <div className="ml-auto flex flex-wrap items-center gap-3">
        {tipo === "anterior" && formatos.length > 0 && <Selo tom="estudo">Para estudo</Selo>}
        {acao}
      </div>
    </div>
  );
}

function Vazio({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl border-[1.5px] border-dashed border-[#C9D3E0] px-5 py-8 text-center text-[15px] text-ardosia">{children}</p>;
}

function TituloComDica({ id, titulo, dica, aberta, onAlternar }: { id: string; titulo: string; dica: string; aberta: boolean; onAlternar: () => void }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <h2 className="font-display text-[clamp(1.6rem,2.6vw,2.1rem)] font-extrabold tracking-[-0.03em]">{titulo}</h2>
      <Dica id={id} aberta={aberta} onAlternar={onAlternar}>
        {dica}
      </Dica>
    </div>
  );
}

export default function CentralDeSimulados({ modoInicial, carreiraInicial }: { modoInicial: Modo; carreiraInicial: string | null }) {
  const { addItem } = useCart();
  const [modo, setModo] = useState<Modo>(modoInicial);
  const [idDaCarreira, setIdDaCarreira] = useState(carreiraInicial ?? carreiras[0].id);
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [formato, setFormato] = useState<FormatoDeEstudo | null>(null);
  const [dica, setDica] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const painel = useRef<HTMLDivElement>(null);

  // Fecha a dica aberta com Esc ou clique fora dela.
  useEffect(() => {
    if (!dica) return;
    const fechar = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !(e.target as Element).closest("[data-dica]")) setDica(null);
    };
    document.addEventListener("keydown", fechar);
    document.addEventListener("pointerdown", fechar);
    return () => {
      document.removeEventListener("keydown", fechar);
      document.removeEventListener("pointerdown", fechar);
    };
  }, [dica]);

  const hoje = hojeEmBrasilia();
  const carreira = carreiras.find((c) => c.id === idDaCarreira) ?? carreiras[0];
  const edicoes: EdicaoComSituacao[] = carreira.edicoes
    .filter((e) => e.publicado)
    .map((e) => ({ ...e, st: situacaoDa(e, hoje) }))
    .sort((a, b) => a.numero - b.numero);
  const abertas = edicoes.filter((e) => e.st.temporal !== "realizado" && e.st.confirmada && (e.st.inscricao === "abertas" || e.st.inscricao === "esgotado"));
  const emBreve = edicoes.filter((e) => e.st.temporal !== "realizado" && !abertas.includes(e));
  const anteriores = edicoes.filter((e) => e.st.temporal === "realizado").sort((a, b) => b.numero - a.numero);
  const paraEstudo = edicoes.filter((e) => formatosDa(e).some((f) => f.oferta.disponivel)).sort((a, b) => b.numero - a.numero);
  const combosDaCarreira = combos.filter((c) => c.carreira === carreira.id);

  const lista = modo === "presenciais" ? [...abertas, ...emBreve, ...anteriores] : modo === "individuais" ? paraEstudo : [];
  const atual = lista.find((e) => e.numero === selecionada) ?? lista[0] ?? null;

  function atualizarEndereco(m: Modo, c: string) {
    const url = new URL(window.location.href);
    if (m === "presenciais") url.searchParams.delete("modo");
    else url.searchParams.set("modo", m === "individuais" ? "individual" : "combos");
    url.searchParams.set("c", c);
    window.history.replaceState(null, "", url);
  }

  function trocarModo(m: Modo) {
    setModo(m);
    setSelecionada(null);
    setFormato(null);
    setDica(null);
    atualizarEndereco(m, idDaCarreira);
  }

  function trocarCarreira(c: Carreira) {
    setIdDaCarreira(c.id);
    setSelecionada(null);
    setFormato(null);
    atualizarEndereco(modo, c.id);
  }

  function selecionar(n: number) {
    setSelecionada(n);
    setFormato(null);
    // No celular o painel fica abaixo da lista: leva a pessoa até ele.
    if (window.matchMedia("(max-width: 1023px)").matches) requestAnimationFrame(() => painel.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function comprar(item: Parameters<typeof addItem>[0], validacao: ReturnType<typeof validarCompra>) {
    if (!validacao.ok) {
      setAviso(validacao.motivo);
      return;
    }
    setAviso(null);
    addItem(item);
  }

  function inscreverPresencial(e: EdicaoComSituacao) {
    comprar(
      {
        id: `simulado:${carreira.id}:${e.numero}:presencial`,
        tipo: "simulado",
        nome: `Simulado ${e.numero} — ${carreira.curto} — Inscrição presencial`,
        tag: e.data ? `${dataCurta(e.data)} · ${e.horario}` : undefined,
        preco: precoOuACadastrar(e.presencial?.preco ?? null),
        simulado: { carreira: carreira.id, edicao: e.numero, modalidade: "presencial", sku: e.presencial!.sku },
      },
      validarCompra(carreira.id, e.numero, "presencial"),
    );
  }

  const contagem = (c: Carreira) =>
    c.edicoes.filter((e) => {
      const s = situacaoDa(e, hoje);
      return e.publicado && s.temporal !== "realizado" && s.confirmada && s.inscricao === "abertas";
    }).length;

  const temExemplo = carreira.edicoes.some((e) => e.exemplo) || combosDaCarreira.some((c) => c.exemplo);

  return (
    <>
      <section className="relative overflow-hidden bg-marinho-950 pb-[clamp(56px,6vw,80px)] pt-[clamp(40px,5vw,64px)] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_60%_at_80%_0%,rgba(0,107,255,0.24),transparent_70%)]" />
        <div className="conteiner relative">
          <nav aria-label="Trilha" className="mb-[clamp(28px,4vw,48px)] flex gap-2 text-[13px] text-[#7F90A8]">
            <Link href="/" className="text-prata hover:text-white">
              Início
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/eventos" className="text-prata hover:text-white">
              Eventos
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-[#DCE4EF]">
              Simulados do Quad
            </span>
          </nav>
          <h1 className="mb-[18px] font-display text-[clamp(2.6rem,5.6vw,5rem)] font-extrabold leading-none tracking-[-0.045em]">Simulados do Quad</h1>
          <p className="max-w-[540px] text-[clamp(16px,1.4vw,18.5px)] leading-[1.6] text-[#B4C1D3]">Escolha sua carreira e encontre a melhor forma de testar seus conhecimentos.</p>
        </div>
      </section>

      <section className="bg-nevoa pb-[clamp(56px,7vw,96px)] pt-[clamp(32px,4vw,44px)]">
        <div className="conteiner">
          {/* Abas */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-3">
            {/* display: contents: as abas ficam na mesma grade do atalho "Meus simulados", que não é uma aba. */}
            <div role="tablist" aria-label="Modalidades de simulado" className="contents">
            {ABAS.map((a) => {
              const ativa = modo === a.modo;
              return (
                <button
                  key={a.modo}
                  type="button"
                  role="tab"
                  aria-selected={ativa}
                  onClick={() => trocarModo(a.modo)}
                  className={`flex min-h-[72px] items-center gap-3.5 rounded-2xl border px-4 text-left transition-colors ${
                    ativa ? "border-marinho-950 bg-marinho-950 text-white" : "border-linha bg-white hover:border-azul/50"
                  }`}
                >
                  <span className={`grid h-10 w-10 flex-none place-items-center rounded-[10px] font-display text-sm font-extrabold ${ativa ? "bg-azul text-white" : "bg-azul-gelo text-azul-forte"}`}>
                    {a.numero}
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="font-display text-[17px] font-bold">{a.titulo}</span>
                    <span className={`text-[13px] ${ativa ? "text-prata-clara" : "text-ardosia"}`}>{a.legenda}</span>
                  </span>
                </button>
              );
            })}
            </div>
            <Link
              href="/aluno/materiais"
              className="flex min-h-[72px] items-center justify-between gap-3 rounded-2xl border border-dashed border-[#B9C6D6] px-4 text-tinta hover:border-azul hover:text-tinta"
            >
              <span className="flex flex-col gap-0.5">
                <span className="font-display text-[17px] font-bold">Meus simulados</span>
                <span className="text-[13px] text-ardosia">Acessar o que já comprei</span>
              </span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* Carreira */}
          <h2 className="mb-5 mt-[clamp(36px,4vw,52px)] font-display text-[clamp(1.6rem,2.6vw,2.1rem)] font-extrabold tracking-[-0.03em]">Escolha a carreira</h2>
          <div role="radiogroup" aria-label="Carreira" className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] gap-3">
            {carreiras.map((c) => {
              const marcada = c.id === carreira.id;
              const n = contagem(c);
              const legenda =
                c.edicoes.length === 0 ? "Sem simulados disponíveis" : n === 0 ? "Nenhuma inscrição aberta" : n === 1 ? "1 edição com inscrições abertas" : `${n} edições com inscrições abertas`;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={marcada}
                  onClick={() => trocarCarreira(c)}
                  className={`flex min-h-[100px] items-center gap-3.5 rounded-2xl border px-4 py-4 text-left transition-[background-color,border-color,box-shadow] ${
                    marcada ? "border-azul bg-azul text-white shadow-[0_16px_32px_-18px_rgba(0,107,255,0.9)]" : "border-linha bg-white hover:border-azul/50"
                  }`}
                >
                  <span className={`grid h-[42px] w-[42px] flex-none place-items-center rounded-[11px] ${marcada ? "bg-white/[0.18]" : "bg-azul-gelo text-azul-forte"}`} aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="font-display text-[17px] font-bold leading-tight">{c.curto}</span>
                    <span className={`text-[13px] font-medium leading-tight ${marcada ? "text-white" : n > 0 ? "text-sucesso" : "text-ardosia"}`}>{legenda}</span>
                  </span>
                  <span className={`grid h-[22px] w-[22px] flex-none place-items-center rounded-full ${marcada ? "bg-white text-azul" : "border-[1.5px] border-[#B9C6D6]"}`} aria-hidden="true">
                    {marcada && (
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8.5l3.2 3L13 4.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {temExemplo && (
            <p className="mt-6 rounded-xl border border-dashed border-[#9DB0C8] bg-white/70 px-4 py-3 text-[13.5px] text-[#4A5A70]">
              <strong className="font-semibold">Edições de exemplo.</strong> Números, datas, horários e vagas são ilustrativos e ainda sem preço. As inscrições e as compras abrem
              quando a equipe cadastrar as edições reais.
            </p>
          )}

          <div className="mt-[clamp(32px,4vw,48px)] grid items-start gap-[clamp(24px,3vw,44px)] lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="flex min-w-0 flex-col gap-10">
              {carreira.edicoes.length === 0 ? (
                <Vazio>Ainda não temos simulados disponíveis para esta carreira.</Vazio>
              ) : modo === "presenciais" ? (
                <>
                  <div>
                    <TituloComDica
                      id="dica-abertas"
                      titulo="Inscrições abertas"
                      dica="Simulados com inscrições liberadas. Você pode se inscrever antecipadamente em qualquer edição disponível."
                      aberta={dica === "abertas"}
                      onAlternar={() => setDica(dica === "abertas" ? null : "abertas")}
                    />
                    <div className="flex flex-col gap-2.5">
                      {abertas.length === 0 && <Vazio>Nenhuma edição com inscrições abertas no momento.</Vazio>}
                      {abertas.map((e) => (
                        <LinhaDaEdicao
                          key={e.numero}
                          e={e}
                          tipo="aberta"
                          selecionada={atual?.numero === e.numero}
                          onSelecionar={() => selecionar(e.numero)}
                          acao={
                            <span className="flex items-center gap-3">
                              <span className={`font-display text-[15px] font-bold ${atual?.numero === e.numero ? "text-white" : ""}`}>{precoOuACadastrar(e.presencial?.preco ?? null)}</span>
                              <button
                                type="button"
                                disabled={!e.st.vendePresencial}
                                onClick={() => inscreverPresencial(e)}
                                className="btn-q btn-q-azul h-11 px-4 text-sm disabled:cursor-not-allowed disabled:bg-[#C9D3E0] disabled:text-[#4A5A70] disabled:shadow-none"
                              >
                                Inscrever-se
                              </button>
                            </span>
                          }
                        />
                      ))}
                    </div>
                  </div>
                  {emBreve.length > 0 && (
                    <div>
                      <TituloComDica
                        id="dica-breve"
                        titulo="Em breve"
                        dica="Edições previstas que ainda não estão disponíveis para inscrição. Data, horário e local ainda não confirmados. A inscrição só abre após a confirmação."
                        aberta={dica === "breve"}
                        onAlternar={() => setDica(dica === "breve" ? null : "breve")}
                      />
                      <div className="flex flex-col gap-2.5">
                        {emBreve.map((e) => (
                          <LinhaDaEdicao
                            key={e.numero}
                            e={e}
                            tipo="breve"
                            selecionada={atual?.numero === e.numero}
                            onSelecionar={() => selecionar(e.numero)}
                            acao={
                              <span className="inline-flex h-11 items-center rounded-[10px] border border-linha-forte px-4 text-sm font-semibold text-ardosia">
                                Inscrições ainda não disponíveis
                              </span>
                            }
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="border-t border-linha pt-10">
                    <TituloComDica
                      id="dica-anteriores"
                      titulo="Edições anteriores"
                      dica="Simulados já realizados presencialmente que podem continuar disponíveis para estudo, conforme os formatos ofertados."
                      aberta={dica === "anteriores"}
                      onAlternar={() => setDica(dica === "anteriores" ? null : "anteriores")}
                    />
                    <div className="flex flex-col gap-2.5">
                      {anteriores.length === 0 && <Vazio>Nenhuma edição anterior disponível para compra.</Vazio>}
                      {anteriores.map((e) => (
                        <LinhaDaEdicao key={e.numero} e={e} tipo="anterior" selecionada={atual?.numero === e.numero} onSelecionar={() => selecionar(e.numero)} />
                      ))}
                    </div>
                  </div>
                </>
              ) : modo === "individuais" ? (
                <div>
                  <TituloComDica
                    id="dica-individuais"
                    titulo="Simulados individuais"
                    dica="Compre uma edição no formato que preferir. Cada formato tem preço próprio e só aparecem os formatos cadastrados."
                    aberta={dica === "individuais"}
                    onAlternar={() => setDica(dica === "individuais" ? null : "individuais")}
                  />
                  <div className="flex flex-col gap-2.5">
                    {paraEstudo.length === 0 && <Vazio>Nenhuma edição disponível para compra individual.</Vazio>}
                    {paraEstudo.map((e) => (
                      <LinhaDaEdicao key={e.numero} e={e} tipo="anterior" selecionada={atual?.numero === e.numero} onSelecionar={() => selecionar(e.numero)} />
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <TituloComDica
                    id="dica-combos"
                    titulo="Combos de simulados"
                    dica="Pacotes com edições definidas, em um formato só. O conteúdo do combo fica registrado no momento da compra."
                    aberta={dica === "combos"}
                    onAlternar={() => setDica(dica === "combos" ? null : "combos")}
                  />
                  {combosDaCarreira.length === 0 ? (
                    <Vazio>Ainda não temos combos para esta carreira. Os pacotes aparecem aqui assim que forem cadastrados.</Vazio>
                  ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-4">
                      {combosDaCarreira.map((c) => {
                        const vendavel = comboAVenda(c);
                        return (
                          <article key={c.id} className="flex flex-col gap-3 rounded-2xl border border-linha bg-white p-[22px] shadow-[0_18px_36px_-24px_rgba(7,20,38,0.35)]">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="font-display text-[21px] font-extrabold tracking-[-0.02em]">{c.nome}</h3>
                                <p className="text-sm text-ardosia">{carreira.curto}</p>
                              </div>
                              <Selo tom="estudo">{ROTULO_DO_FORMATO[c.formato].curto}</Selo>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {c.itens.map((n) => (
                                <span key={n} className="rounded-md border border-linha-forte px-2 py-1 text-[13px] font-semibold">
                                  Nº{n}
                                </span>
                              ))}
                            </div>
                            <p className="text-sm text-ardosia">{c.formato === "impresso" ? "Retirada gratuita no Quad." : c.formato === "pdf" ? "Arquivos para download." : "Acesso na plataforma do Quad."}</p>
                            {c.exemplo && (
                              <span className="self-start rounded-full border border-dashed border-[#9DB0C8] px-2.5 py-0.5 text-[11px] font-semibold text-[#4A5A70]">Exemplo ilustrativo</span>
                            )}
                            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-linha pt-4">
                              <span className="font-display text-lg font-extrabold">{precoOuACadastrar(c.preco)}</span>
                              <button
                                type="button"
                                disabled={!vendavel}
                                onClick={() =>
                                  addItem({
                                    id: `simulado:${c.id}`,
                                    tipo: "simulado",
                                    nome: `${c.nome} — ${carreira.curto} — ${ROTULO_DO_FORMATO[c.formato].curto}`,
                                    tag: c.itens.map((n) => `Nº${n}`).join(", "),
                                    preco: precoOuACadastrar(c.preco),
                                    simulado: { carreira: c.carreira, edicao: null, modalidade: c.formato, sku: c.sku, edicoesDoCombo: c.itens },
                                  })
                                }
                                className="btn-q btn-q-azul h-11 px-4 text-sm disabled:cursor-not-allowed disabled:bg-[#C9D3E0] disabled:text-[#4A5A70] disabled:shadow-none"
                              >
                                Adicionar ao carrinho
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Painel da edição selecionada */}
            {modo !== "combos" && atual && (
              <div ref={painel} className="scroll-mt-[120px] lg:sticky lg:top-[124px]">
                <PainelDaEdicao
                  carreira={carreira}
                  e={atual}
                  formato={formato}
                  onFormato={setFormato}
                  onInscrever={() => inscreverPresencial(atual)}
                  onComprarFormato={(f) =>
                    comprar(
                      {
                        id: `simulado:${carreira.id}:${atual.numero}:${f}`,
                        tipo: "simulado",
                        nome: `Simulado ${atual.numero} — ${carreira.curto} — ${ROTULO_DO_FORMATO[f].curto}`,
                        tag: f === "impresso" ? "Retirada no Quad" : undefined,
                        preco: precoOuACadastrar(atual[f]?.preco ?? null),
                        simulado: { carreira: carreira.id, edicao: atual.numero, modalidade: f, sku: atual[f]!.sku },
                      },
                      validarCompra(carreira.id, atual.numero, f),
                    )
                  }
                />
                {aviso && (
                  <p role="alert" className="mt-3 rounded-xl bg-[#FFF0D9] px-4 py-3 text-sm text-[#8A4B00]">
                    {aviso}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function Campo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="bg-marinho-800 px-3.5 py-3">
      <div className="text-[11.5px] text-prata">{rotulo}</div>
      <div className="mt-0.5 font-display text-[15px] font-bold">{valor}</div>
    </div>
  );
}

function PainelDaEdicao({ carreira, e, formato, onFormato, onInscrever, onComprarFormato }: {
  carreira: Carreira;
  e: EdicaoComSituacao;
  formato: FormatoDeEstudo | null;
  onFormato: (f: FormatoDeEstudo) => void;
  onInscrever: () => void;
  onComprarFormato: (f: FormatoDeEstudo) => void;
}) {
  const presencial = e.st.temporal !== "realizado" && !!e.presencial;
  const formatos = formatosDa(e);
  const escolhido = formato ?? formatos.find((f) => f.oferta.disponivel)?.formato ?? null;
  const oferta = escolhido ? e[escolhido] : undefined;
  const podeComprar = !!oferta && oferta.disponivel && oferta.preco != null;

  return (
    <div className="rounded-[20px] bg-marinho-950 p-[clamp(22px,2.4vw,28px)] text-white shadow-[0_30px_60px_-30px_rgba(7,20,38,0.8)]">
      <div className="text-[13px] text-prata">{carreira.curto}</div>
      <h3 className="mb-2.5 mt-1 font-display text-[28px] font-extrabold tracking-[-0.03em]">Simulado {e.numero}</h3>
      {presencial ? (
        <>
          {e.st.confirmada && e.st.inscricao === "abertas" ? (
            <Selo tom="abertas">Inscrições abertas</Selo>
          ) : e.st.inscricao === "esgotado" ? (
            <Selo tom="esgotado">Esgotado</Selo>
          ) : (
            <Selo tom="breve">A confirmar</Selo>
          )}
          <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl">
            <Campo rotulo="Data" valor={e.data ? dataCurta(e.data) : "A definir"} />
            <Campo rotulo="Horário" valor={e.horario ?? "A definir"} />
            <Campo rotulo="Local" valor={e.local ?? "A definir"} />
            <Campo rotulo="Vagas" valor={e.presencial?.vagas != null ? `${e.presencial.vagasRestantes ?? e.presencial.vagas} de ${e.presencial.vagas}` : "A definir"} />
          </div>
          <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/[0.08] pt-5">
            <span className="text-sm text-prata">Inscrição presencial</span>
            <span className="text-right font-display text-[22px] font-extrabold leading-tight">{precoOuACadastrar(e.presencial?.preco ?? null)}</span>
          </div>
          <button
            type="button"
            disabled={!e.st.vendePresencial}
            onClick={onInscrever}
            className="btn-q btn-q-azul mt-4 h-[52px] w-full text-base disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-prata disabled:shadow-none"
          >
            {e.st.vendePresencial ? "Inscrever-se" : e.st.inscricao === "esgotado" ? "Vagas esgotadas" : "Inscrições ainda não disponíveis"}
          </button>
          <p className="mt-3 text-[12.5px] text-prata-escura">
            {e.st.confirmada ? "Inscrição válida apenas para a aplicação presencial desta edição." : "As inscrições desta edição ainda não foram liberadas pela equipe."}
          </p>
        </>
      ) : (
        <>
          <Selo tom="estudo">Para estudo</Selo>
          <p className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.04] p-3.5 text-sm leading-[1.5] text-[#DCE4EF]">
            Esta edição já foi aplicada presencialmente, mas você ainda pode adquiri-la para testar seus conhecimentos.
          </p>
          {formatos.length === 0 ? (
            <p className="mt-4 text-sm text-prata">Nenhum formato de estudo cadastrado para esta edição.</p>
          ) : (
            <div role="radiogroup" aria-label="Formato" className="mt-4 flex flex-col gap-2">
              {formatos.map(({ formato: f, oferta: o }) => {
                const marcado = escolhido === f;
                return (
                  <button
                    key={f}
                    type="button"
                    role="radio"
                    aria-checked={marcado}
                    aria-disabled={!o.disponivel}
                    onClick={() => o.disponivel && onFormato(f)}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-left transition-colors ${
                      marcado ? "border-[1.5px] border-azul-vivo bg-azul/[0.14]" : "border border-white/10"
                    } ${o.disponivel ? "" : "cursor-not-allowed opacity-45"}`}
                  >
                    <span className={`h-[18px] w-[18px] flex-none rounded-full ${marcado ? "border-[5px] border-azul-vivo bg-white" : "border-[1.5px] border-[#6B7C94]"}`} />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="font-display text-[15px] font-bold">{ROTULO_DO_FORMATO[f].nome}</span>
                      <span className="text-xs text-prata">{o.disponivel ? ROTULO_DO_FORMATO[f].dica : "Indisponível no momento"}</span>
                    </span>
                    <span className="whitespace-nowrap font-display text-[13px] font-bold">{precoOuACadastrar(o.preco)}</span>
                  </button>
                );
              })}
            </div>
          )}
          <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/[0.08] pt-5">
            <span className="text-sm text-prata">Total</span>
            <span className="text-right font-display text-[22px] font-extrabold leading-tight">{precoOuACadastrar(oferta?.preco ?? null)}</span>
          </div>
          <button
            type="button"
            disabled={!podeComprar}
            onClick={() => escolhido && onComprarFormato(escolhido)}
            className="btn-q btn-q-azul mt-4 h-[52px] w-full text-base disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-prata disabled:shadow-none"
          >
            {podeComprar ? "Adicionar ao carrinho" : "Ainda não disponível para compra"}
          </button>
          <p className="mt-3 text-[12.5px] text-prata-escura">
            {escolhido === "pdf"
              ? "PDF: liberado para download após a confirmação da compra."
              : escolhido === "plataforma"
                ? "Plataforma: acesso liberado após a confirmação da compra."
                : escolhido === "impresso"
                  ? "Impresso: retirada gratuita no Quad. Envio para casa não está disponível para simulados."
                  : ""}
          </p>
        </>
      )}
    </div>
  );
}
