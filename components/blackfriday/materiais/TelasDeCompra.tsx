"use client";

import Image from "next/image";
import { useState } from "react";
import { CONCURSOS_DO_COMBO, CONCURSOS_DOS_MODULOS, TEXTOS } from "@/lib/black/catalogo";
import type { MaterialDaBlack } from "@/lib/vitrine";
import {
  BOTAO_LARANJA_BLACK,
  BotaoDoConcurso,
  PrecoDeAte,
  QuadroDaCapa,
  ROTULO_LARANJA,
  ValidoAteOFim,
  descontoEm,
  doConcurso,
  emReais,
} from "./PartesDosMateriais";
import VisorDaPrevia from "./VisorDaPrevia";

// As telas de compra da página de Materiais da Black (LEIA-ME 3.3 e 3.4). Produto e preço vêm da API: concurso sem
// produto cadastrado aparece como "Em breve" e não deixa adicionar.

export type Adicionar = (material: MaterialDaBlack, nome: string, tag: string) => void;

const QUADRO_DO_PEDIDO =
  "flex flex-col gap-3.5 rounded-3xl border-[1.5px] border-laranja bg-[rgba(12,9,7,0.92)] p-[22px] shadow-[0_0_0_1px_rgba(255,140,60,0.2),0_0_40px_-6px_rgba(242,90,12,0.5)]";

function Voltar({ aoVoltar }: { aoVoltar: () => void }) {
  return (
    <button
      type="button"
      onClick={aoVoltar}
      className="self-start rounded-full border border-[#3A2E27] px-4 py-2 font-display text-sm font-bold text-[#D6CCC5] hover:border-[#5A4536] hover:text-white"
    >
      ← Voltar aos materiais
    </button>
  );
}

function Cabecalho({ titulo, texto }: { titulo: string; texto?: string }) {
  return (
    <div className="flex flex-col gap-2.5">
      <h1 className="font-display text-[clamp(2.2rem,4vw,2.75rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-white">{titulo}</h1>
      {texto && <p className="max-w-[560px] text-[17px] leading-normal text-[#D6CCC5]">{texto}</p>}
    </div>
  );
}

// ---------- Combo de Simulados ----------

export function TelaDoCombo({
  materiais,
  concursoInicial,
  aoVoltar,
  adicionar,
}: {
  materiais: MaterialDaBlack[];
  concursoInicial: string | null;
  aoVoltar: () => void;
  adicionar: Adicionar;
}) {
  const combos = materiais.filter((m) => m.tipo === "combo");
  const produtoDe = (id: string) => {
    const c = CONCURSOS_DO_COMBO.find((x) => x.id === id);
    return c ? (doConcurso(combos, c)[0] ?? null) : null;
  };
  const [escolhido, setEscolhido] = useState<string | null>(concursoInicial && CONCURSOS_DO_COMBO.some((c) => c.id === concursoInicial) ? concursoInicial : null);
  const concurso = CONCURSOS_DO_COMBO.find((c) => c.id === escolhido) ?? null;
  const produto = escolhido ? produtoDe(escolhido) : null;
  // O preço é sempre o do combo do concurso escolhido (pedido de 26/11/2026): antes de escolher, ou num concurso sem
  // combo, não aparece preço nenhum (antes vinha o menor preço entre os concursos, de outro produto).
  const referencia = produto;

  const rotuloDoBotao = !concurso ? "Escolha o concurso para continuar" : !produto || !produto.aVenda ? "Em breve para este concurso" : "Adicionar ao carrinho →";

  return (
    <div className="flex flex-wrap items-start gap-8">
      <QuadroDaCapa
        capa={concurso?.capa ?? CONCURSOS_DO_COMBO[0].capa}
        alt={`Capa do Combo de Simulados ${concurso?.nome ?? ""}`.trim()}
        desconto={referencia ? descontoEm(referencia.preco, referencia.precoCheio) : null}
        rotulo={concurso ? `Combo ${concurso.nome}` : "Simulados 01 a 05"}
      />
      <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-[26px]">
        <Voltar aoVoltar={aoVoltar} />
        <Cabecalho titulo={TEXTOS.combo.titulo} texto={TEXTOS.combo.tela} />

        <div className="flex flex-col gap-3">
          <span className={ROTULO_LARANJA}>1 · Escolha o concurso</span>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,170px),1fr))] gap-2.5">
            {CONCURSOS_DO_COMBO.map((c) => (
              <BotaoDoConcurso key={c.id} concurso={c} marcado={c.id === escolhido} semProduto={!produtoDe(c.id)} aoEscolher={() => setEscolhido(c.id)} />
            ))}
          </div>
        </div>

        <div className={QUADRO_DO_PEDIDO}>
          <span className={ROTULO_LARANJA}>2 · Seu combo</span>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-1">
              <b className="font-display text-xl text-white">{concurso ? `Combo ${concurso.nome}` : "Escolha um concurso acima"}</b>
              <span className="text-sm text-[#A39790]">{TEXTOS.combo.resumo}</span>
            </div>
            {referencia ? (
              <PrecoDeAte por={referencia.preco} de={referencia.precoCheio} grande />
            ) : (
              concurso && <span className="font-display text-xl font-extrabold text-[#A39790]">Em breve</span>
            )}
          </div>
          <button
            type="button"
            disabled={!produto || !produto.aVenda}
            onClick={() => produto && concurso && adicionar(produto, `Combo de Simulados · ${concurso.nome}`, "Simulados 01 a 05 · PDF")}
            className={BOTAO_LARANJA_BLACK}
          >
            {rotuloDoBotao}
          </button>
          <ValidoAteOFim />
        </div>
      </div>
    </div>
  );
}

// ---------- Módulos teóricos ----------

type Forma = "pacote" | "avulso";

export function TelaDosModulos({
  materiais,
  concursoInicial,
  formaInicial,
  aoVoltar,
  adicionar,
}: {
  materiais: MaterialDaBlack[];
  concursoInicial: string | null;
  formaInicial: Forma | null;
  aoVoltar: () => void;
  adicionar: Adicionar;
}) {
  const valido = concursoInicial && CONCURSOS_DOS_MODULOS.some((c) => c.id === concursoInicial) ? concursoInicial : null;
  const [escolhido, setEscolhido] = useState<string | null>(valido);
  const [forma, setForma] = useState<Forma | null>(valido ? formaInicial : null);
  const [marcados, setMarcados] = useState<Set<string>>(new Set());
  const [vendoPrevia, setVendoPrevia] = useState(false);

  const concurso = CONCURSOS_DOS_MODULOS.find((c) => c.id === escolhido) ?? null;
  const doTipo = (tipo: MaterialDaBlack["tipo"], c: (typeof CONCURSOS_DOS_MODULOS)[number]) => doConcurso(materiais.filter((m) => m.tipo === tipo), c);
  const temProduto = (c: (typeof CONCURSOS_DOS_MODULOS)[number]) => doTipo("pacote", c).length > 0 || doTipo("modulo", c).length > 0;

  const pacote = concurso ? (doTipo("pacote", concurso)[0] ?? null) : null;
  const modulos = concurso ? doTipo("modulo", concurso).sort((a, b) => (a.materia ?? a.nome).localeCompare(b.materia ?? b.nome, "pt-BR")) : [];
  const somaDosAvulsos = modulos.reduce((s, m) => s + m.preco, 0);
  const menorAvulso = modulos.length ? Math.min(...modulos.map((m) => m.preco)) : null;
  const avulsosIguais = modulos.every((m) => m.preco === menorAvulso);
  const economia = pacote && somaDosAvulsos > pacote.preco ? Math.round((1 - pacote.preco / somaDosAvulsos) * 100) : null;

  const selecionados = modulos.filter((m) => marcados.has(m.idNaApi) && m.aVenda);
  const totalAvulso = selecionados.reduce((s, m) => s + m.preco, 0);
  const pacoteSaiMelhor = forma === "avulso" && pacote && selecionados.length > 0 && totalAvulso >= pacote.preco;

  function escolher(id: string) {
    setEscolhido(id);
    setForma(null);
    setMarcados(new Set());
  }

  function alternar(id: string) {
    setMarcados((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  const todosMarcados = modulos.filter((m) => m.aVenda).every((m) => marcados.has(m.idNaApi));

  const rotuloDoBotao = !concurso
    ? "Escolha o concurso para continuar"
    : !temProduto(concurso)
      ? "Em breve para este concurso"
      : !forma
        ? "Escolha como quer comprar"
        : forma === "avulso" && selecionados.length === 0
          ? "Selecione ao menos um módulo"
          : "Adicionar ao carrinho →";
  const podeAdicionar = !!concurso && ((forma === "pacote" && !!pacote?.aVenda) || (forma === "avulso" && selecionados.length > 0));

  function adicionarAoCarrinho() {
    if (!concurso || !podeAdicionar) return;
    if (forma === "pacote" && pacote) adicionar(pacote, `Módulos teóricos · Pacote completo ${concurso.nome}`, "Todos os módulos · PDF");
    else for (const m of selecionados) adicionar(m, `Módulo · ${m.materia ?? m.nome}`, `${concurso.nome} · PDF`);
  }

  const resumo = !concurso
    ? "Escolha o concurso e a forma de compra"
    : forma === "pacote"
      ? `Pacote completo${modulos.length ? ` · ${modulos.length} módulos` : ""}`
      : forma === "avulso"
        ? `${selecionados.length} ${selecionados.length === 1 ? "módulo avulso" : "módulos avulsos"}`
        : "Escolha como quer comprar";
  const total = forma === "pacote" ? (pacote?.preco ?? null) : forma === "avulso" ? totalAvulso : null;
  const totalDeAntes = forma === "pacote" && pacote ? (pacote.precoCheio ?? (somaDosAvulsos > pacote.preco ? somaDosAvulsos : null)) : null;

  const capa = concurso?.capa ?? CONCURSOS_DOS_MODULOS[1].capa;
  const referencia = pacote ?? modulos[0] ?? null;

  const opcao = (marcado: boolean, ativo: boolean) =>
    `flex flex-[1_1_220px] flex-col gap-1.5 rounded-2xl border-[1.5px] px-[18px] py-4 text-left text-white ${
      marcado
        ? "border-laranja bg-[rgba(242,90,12,0.18)] shadow-[0_0_24px_-6px_rgba(242,90,12,0.7)]"
        : ativo
          ? "border-[#3A2E27] bg-breu-800 hover:border-[#5A4536]"
          : "cursor-not-allowed border-[#2E241E] bg-breu-800 opacity-50"
    }`;

  return (
    <div className="flex flex-wrap items-start gap-8">
      <QuadroDaCapa
        capa={capa}
        alt={`Capa do módulo ${concurso?.nome ?? ""}`.trim()}
        desconto={referencia ? descontoEm(referencia.preco, referencia.precoCheio) : null}
        rotulo={concurso ? `Módulos ${concurso.nome}` : "Módulos teóricos"}
      />
      <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-[26px]">
        <Voltar aoVoltar={aoVoltar} />
        {/* Pedido de 26/11/2026: entre o título e a escolha do concurso não vai mais nada (saíram o texto e os destaques). */}
        <Cabecalho titulo={TEXTOS.modulos.titulo} />

        <div className="flex flex-col gap-3">
          <span className={ROTULO_LARANJA}>1 · Escolha o concurso</span>
          <div className="flex flex-wrap justify-center gap-2.5">
            {CONCURSOS_DOS_MODULOS.map((c) => (
              <BotaoDoConcurso key={c.id} concurso={c} compacto marcado={c.id === escolhido} semProduto={!temProduto(c)} aoEscolher={() => escolher(c.id)} />
            ))}
          </div>
        </div>

        {concurso && (
          <div className="flex flex-wrap items-center gap-4 rounded-[18px] border border-dashed border-[#5A4536] bg-breu-800 px-5 py-[18px]">
            <div aria-hidden="true" className="flex flex-none">
              <Image src={concurso.previa.miniaturas[0]} alt="" width={44} height={62} className="h-[62px] w-11 -rotate-6 rounded-[3px] object-cover shadow-[0_8px_14px_-6px_rgba(0,0,0,0.7)]" />
              <Image src={concurso.previa.miniaturas[1]} alt="" width={44} height={62} className="-ml-3.5 h-[62px] w-11 rotate-[5deg] rounded-[3px] object-cover shadow-[0_8px_14px_-6px_rgba(0,0,0,0.7)]" />
            </div>
            <div className="flex min-w-0 flex-[1_1_220px] flex-col gap-1">
              <b className="font-display text-[17px] font-extrabold text-white">Quer conhecer o módulo antes de comprar?</b>
              <span className="text-sm leading-[1.45] text-[#A39790]">
                Veja {concurso.previa.paginas.length} páginas do {concurso.previa.materia}: capa, sumário, teoria e questões.
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setVendoPrevia(true)} className="btn-q h-11 rounded-[11px] bg-white px-4 text-[14.5px] text-[#B8410A] hover:bg-[#FFF3EC]">
                Ver prévia
              </button>
              <a
                href={concurso.previa.pdf}
                download={concurso.previa.arquivo}
                className="btn-q h-11 gap-2 rounded-[11px] border border-[#4A3B32] px-4 text-[14.5px] text-white hover:border-white/50 hover:text-white"
              >
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v12m0 0-5-5m5 5 5-5M4 21h16" />
                </svg>
                Baixar prévia (PDF)
              </a>
            </div>
          </div>
        )}

        {concurso && temProduto(concurso) && (
          <div className="flex flex-col gap-3">
            <span className={ROTULO_LARANJA}>2 · Como você quer comprar</span>
            <div className="flex flex-wrap gap-3">
              <button type="button" aria-pressed={forma === "pacote"} disabled={!pacote} onClick={() => setForma("pacote")} className={opcao(forma === "pacote", !!pacote)}>
                <span className="flex items-center justify-between gap-2">
                  <b className="font-display text-lg font-extrabold">Todos os módulos</b>
                  {economia !== null && <span className="whitespace-nowrap rounded-lg bg-laranja px-2 py-[3px] font-display text-[12px] font-extrabold">economize {economia}%</span>}
                </span>
                <span className="text-sm leading-[1.4] text-[#D6CCC5]">{pacote ? `Pacote completo do ${concurso.nome}` : "Pacote em breve"}</span>
                {pacote && <b className="mt-1 font-display text-[22px] font-extrabold">{emReais(pacote.preco)}</b>}
              </button>
              <button
                type="button"
                aria-pressed={forma === "avulso"}
                disabled={modulos.length === 0}
                onClick={() => setForma("avulso")}
                className={opcao(forma === "avulso", modulos.length > 0)}
              >
                <b className="font-display text-lg font-extrabold">Módulos avulsos</b>
                <span className="text-sm leading-[1.4] text-[#D6CCC5]">{modulos.length ? "Escolha só as matérias que você precisa" : "Módulos avulsos em breve"}</span>
                {menorAvulso !== null && (
                  <b className="mt-1 font-display text-[22px] font-extrabold">
                    {avulsosIguais ? `${emReais(menorAvulso)} cada` : `a partir de ${emReais(menorAvulso)}`}
                  </b>
                )}
              </button>
            </div>
          </div>
        )}

        {concurso && forma === "avulso" && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className={ROTULO_LARANJA}>3 · Escolha os módulos</span>
              <button
                type="button"
                onClick={() => setMarcados(todosMarcados ? new Set() : new Set(modulos.filter((m) => m.aVenda).map((m) => m.idNaApi)))}
                className="text-sm font-bold text-laranja-suave underline underline-offset-2 hover:text-white"
              >
                {todosMarcados ? "Limpar seleção" : "Selecionar todos"}
              </button>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,250px),1fr))] gap-2">
              {modulos.map((m) => {
                const marcado = marcados.has(m.idNaApi);
                return (
                  <button
                    key={m.idNaApi}
                    type="button"
                    role="checkbox"
                    aria-checked={marcado}
                    disabled={!m.aVenda}
                    onClick={() => alternar(m.idNaApi)}
                    className={`flex items-center gap-3 rounded-xl border-[1.5px] px-3.5 py-3 text-left text-[15px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${
                      marcado ? "border-laranja bg-[rgba(242,90,12,0.14)]" : "border-[#3A2E27] bg-breu-800 hover:border-[#5A4536]"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`flex h-[22px] w-[22px] flex-none items-center justify-center rounded-md border-[1.5px] text-sm font-extrabold ${marcado ? "border-laranja bg-laranja" : "border-[#5A4536]"}`}
                    >
                      {marcado ? "✓" : ""}
                    </span>
                    <span className="min-w-0 flex-1">{m.materia ?? m.nome}</span>
                    <span className="whitespace-nowrap text-sm text-[#A39790]">{m.aVenda ? emReais(m.preco) : "Em breve"}</span>
                  </button>
                );
              })}
            </div>
            {pacoteSaiMelhor && (
              <p className="rounded-xl border border-[rgba(242,90,12,0.45)] bg-[rgba(242,90,12,0.12)] px-3.5 py-3 text-sm leading-[1.45] text-[#F3EEEA]">
                Com {selecionados.length} módulos, o pacote completo sai mais em conta: {emReais(pacote!.preco)}.{" "}
                <button type="button" onClick={() => setForma("pacote")} className="font-bold text-laranja-suave underline underline-offset-2 hover:text-white">
                  Trocar pelo pacote
                </button>
              </p>
            )}
          </div>
        )}

        <div className={QUADRO_DO_PEDIDO}>
          <span className={ROTULO_LARANJA}>Seu pedido</span>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-1">
              <b className="font-display text-xl text-white">{concurso ? concurso.nome : "Escolha um concurso acima"}</b>
              <span className="text-sm text-[#A39790]">{resumo}</span>
            </div>
            {total !== null && total > 0 && <PrecoDeAte por={total} de={totalDeAntes} prefixo={totalDeAntes ? "por" : "total"} grande />}
          </div>
          <button type="button" disabled={!podeAdicionar} onClick={adicionarAoCarrinho} className={BOTAO_LARANJA_BLACK}>
            {rotuloDoBotao}
          </button>
          <ValidoAteOFim />
        </div>
      </div>

      {vendoPrevia && concurso && <VisorDaPrevia previa={concurso.previa} concurso={concurso.nome} aoFechar={() => setVendoPrevia(false)} />}
    </div>
  );
}
