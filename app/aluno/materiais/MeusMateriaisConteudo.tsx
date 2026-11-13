"use client";

import Link from "next/link";
import { useState } from "react";
import EstadoLista from "@/components/EstadoLista";
import { CLASSE_DO_BOTAO_PEQUENO, CLASSE_DO_CARTAO, CLASSE_DO_SELO } from "@/components/aluno/CabecalhoDoAluno";
import {
  baixarArquivoDoMaterial,
  baixarMaterialComprado,
  baixarPdfDoSimulado,
  listarMeusMateriais,
  listarMeusSimuladosEmPdf,
  listarMinhasComprasEmReais,
  marcarMaterialComoVisto,
  type Compra,
  type MaterialDaTurma,
  type SimuladoEmPdf,
} from "@/lib/api";
import { salvarArquivo } from "@/lib/download";
import { ErroDaApi } from "@/lib/http";
import { formatarData } from "@/lib/format";
import { useCarregar } from "@/lib/useCarregar";
import { useCarregandoUsuario, useUsuarioAtual } from "@/lib/usuario";

export const ROTULO_DO_TIPO: Record<MaterialDaTurma["tipo"], string> = {
  SLIDES: "Slides",
  RESUMO: "Resumo",
  LISTA: "Lista",
  MAPA: "Mapa",
  VIDEO: "Vídeo",
  OUTRO: "Arquivo",
};

// Duas fontes (06/11/2026): o material de aula das turmas (/api/materiais/eu, por matrícula) e os PDFs comprados na
// loja (as compras pagas do material DIGITAL, que se baixam pela própria compra). Se as compras não carregarem, os
// materiais das turmas aparecem mesmo assim.
// Terceira fonte (13/11/2026): as versões em PDF dos simulados, que têm rota própria (cada uma com os seus PDFs).
async function carregarMateriais(): Promise<{
  daTurma: MaterialDaTurma[];
  comprados: Compra[];
  erroDosComprados: string;
  simuladosEmPdf: SimuladoEmPdf[];
  erroDosSimulados: string;
}> {
  const motivo = (e: unknown) => (e instanceof Error ? e.message : "erro desconhecido");
  const [daTurma, compras, simuladosEmPdf] = await Promise.all([
    listarMeusMateriais(),
    listarMinhasComprasEmReais().catch(motivo),
    listarMeusSimuladosEmPdf().catch(motivo),
  ]);
  // A falha das compras ou dos simulados não some calada: a tela avisa que os PDFs comprados não carregaram.
  const simulados = typeof simuladosEmPdf === "string" ? { simuladosEmPdf: [], erroDosSimulados: simuladosEmPdf } : { simuladosEmPdf, erroDosSimulados: "" };
  if (typeof compras === "string") return { daTurma, comprados: [], erroDosComprados: compras, ...simulados };
  return { daTurma, comprados: compras.filter((c) => c.situacao === "PAGA" && c.item.plataforma === "DIGITAL"), erroDosComprados: "", ...simulados };
}

// Três abas (11/11/2026): os materiais diários das turmas e os PDFs comprados, separados em módulos e apostilas e em
// simulados. A compra não traz a categoria do material: vai para Simulados o PDF de simulado (tipo SIMULADO) ou com
// "simulado" no nome; o resto, para Módulos e apostilas.
type Aba = "diarios" | "modulos" | "simulados";
const ehSimulado = (c: Compra) => c.item.tipo === "SIMULADO" || /simulado/i.test(c.item.nome);

function formatarTamanho(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`;
}

export default function MeusMateriaisConteudo({ turmaInicial }: { turmaInicial: string | null }) {
  const usuario = useUsuarioAtual();
  const carregandoUsuario = useCarregandoUsuario();
  const { carregando, dados, erro, tentarNovamente } = useCarregar(usuario ? "materiais" : null, carregarMateriais);
  const [turma, setTurma] = useState(turmaInicial ?? "");
  const [materia, setMateria] = useState("");
  const [vistos, setVistos] = useState<Set<string>>(new Set());
  const [baixando, setBaixando] = useState<string | null>(null);
  const [erroDoItem, setErroDoItem] = useState<{ id: string; mensagem: string } | null>(null);

  const materiais = dados?.daTurma ?? [];
  const comprados = dados?.comprados ?? [];
  const modulos = comprados.filter((c) => !ehSimulado(c));
  const simulados = comprados.filter(ehSimulado);
  const simuladosEmPdf = dados?.simuladosEmPdf ?? [];
  const totalDeSimulados = simulados.length + simuladosEmPdf.length;
  const erroDosSimulados = [dados?.erroDosComprados, dados?.erroDosSimulados].filter(Boolean).join("; ");
  // Abre nos diários; sem nenhum, na primeira aba que tiver alguma coisa.
  const [abaEscolhida, setAba] = useState<Aba | null>(null);
  const aba: Aba =
    abaEscolhida ?? (materiais.length > 0 ? "diarios" : modulos.length > 0 ? "modulos" : totalDeSimulados > 0 ? "simulados" : "diarios");
  const turmas = [...new Map(materiais.map((m) => [m.turmaId, m.turmaNome])).entries()];
  const daTurma = materiais.filter((m) => !turma || m.turmaId === turma);
  const materias = [...new Map(daTurma.map((m) => [m.materiaId, m.materiaNome])).entries()];
  const filtrados = daTurma.filter((m) => !materia || m.materiaId === materia);

  function marcarVisto(material: MaterialDaTurma) {
    if (!material.novo || vistos.has(material.id)) return;
    setVistos((v) => new Set(v).add(material.id));
    marcarMaterialComoVisto(material.id).catch(() => {});
  }

  async function baixar(material: MaterialDaTurma) {
    setErroDoItem(null);
    setBaixando(material.id);
    try {
      const blob = await baixarArquivoDoMaterial(material.id);
      salvarArquivo(blob, material.arquivoNome || `${material.titulo}.pdf`);
      marcarVisto(material);
    } catch (e) {
      setErroDoItem({
        id: material.id,
        mensagem: e instanceof ErroDaApi ? e.message : "Não foi possível baixar. Verifique sua internet e tente novamente.",
      });
    } finally {
      setBaixando(null);
    }
  }

  async function baixarComprado(compra: Compra) {
    const id = `compra-${compra.id}`;
    setErroDoItem(null);
    setBaixando(id);
    try {
      salvarArquivo(await baixarMaterialComprado(compra.id), `${compra.item.nome}.pdf`);
    } catch (e) {
      setErroDoItem({ id, mensagem: e instanceof ErroDaApi ? e.message : "Não foi possível baixar. Verifique sua internet e tente novamente." });
    } finally {
      setBaixando(null);
    }
  }

  async function baixarDoSimulado(s: SimuladoEmPdf, pdf: SimuladoEmPdf["pdfs"][number]) {
    const id = `simulado-${s.simuladoId}-${pdf.id}`;
    setErroDoItem(null);
    setBaixando(id);
    try {
      salvarArquivo(await baixarPdfDoSimulado(s.simuladoId, pdf.id), `${pdf.titulo}.pdf`);
    } catch (e) {
      setErroDoItem({ id, mensagem: e instanceof ErroDaApi ? e.message : "Não foi possível baixar. Verifique sua internet e tente novamente." });
    } finally {
      setBaixando(null);
    }
  }

  return (
    <EstadoLista
      carregando={carregandoUsuario || carregando}
      erro={erro}
      onTentarNovamente={tentarNovamente}
      // Cada aba tem a própria lista vazia: a da página nunca aparece.
      vazio={false}
      vazioTitulo=""
    >
      <div className="flex flex-col gap-5">
        <div role="tablist" aria-label="Tipo de material" className="sem-barra flex gap-2 overflow-x-auto p-0.5">
          {(
            [
              ["diarios", "Materiais diários", materiais.length],
              ["modulos", "Módulos e apostilas", modulos.length],
              ["simulados", "Simulados", totalDeSimulados],
            ] as [Aba, string, number][]
          ).map(([id, rotulo, quantidade]) => {
            const ligada = aba === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                id={`aba-${id}`}
                aria-selected={ligada}
                aria-controls={`painel-${id}`}
                onClick={() => setAba(id)}
                className={`inline-flex h-11 flex-none items-center gap-2 whitespace-nowrap rounded-full border px-5 font-display text-[14.5px] font-bold transition-colors ${
                  ligada ? "border-marinho-950 bg-marinho-950 text-white" : "border-linha-forte bg-superficie text-ardosia-escura hover:border-azul hover:text-azul"
                }`}
              >
                {rotulo}
                <span className={`rounded-full px-2 py-0.5 text-[11.5px] ${ligada ? "bg-white/15" : "bg-nevoa"}`}>{quantidade}</span>
              </button>
            );
          })}
        </div>

        {aba === "modulos" && (
          <section role="tabpanel" id="painel-modulos" aria-labelledby="aba-modulos" className="flex flex-col gap-3">
            <p className="text-[14px] text-ardosia">Os módulos e apostilas em PDF que você comprou no site. Cada conta baixa os seus, com o seu nome no arquivo.</p>
            {dados?.erroDosComprados && (
              <p role="alert" className="rounded-xl border border-[#F1C4C4] bg-[#FFF5F5] px-4 py-3 text-[13.5px] text-[#9B1C1C]">
                Não foi possível carregar os PDFs que você comprou ({dados.erroDosComprados}). Eles continuam em Compras.
              </p>
            )}
            {modulos.length === 0 && !dados?.erroDosComprados && (
              <Vazio texto="Você ainda não tem módulos ou apostilas em PDF. Os que você comprar aparecem aqui." acao={{ href: "/produtos", rotulo: "Ver materiais à venda" }} />
            )}
            {modulos.length > 0 && (
            <div className={`${CLASSE_DO_CARTAO} overflow-hidden`}>
              {modulos.map((c, i) => {
                const id = `compra-${c.id}`;
                return (
                  <div key={c.id} className={`px-[22px] py-3.5 ${i > 0 ? "border-t border-linha" : ""}`}>
                    <div className="flex items-center gap-3.5">
                      <span className={CLASSE_DO_SELO}>PDF</span>
                      <div className="min-w-0 flex-1">
                        <div className="line-clamp-2 text-[15px] font-semibold leading-snug">{c.item.nome}</div>
                        <div className="mt-0.5 text-[13px] text-ardosia">Comprado em {formatarData(c.pagaEm ?? c.criadaEm)}</div>
                      </div>
                      <button type="button" onClick={() => baixarComprado(c)} disabled={baixando === id} className={CLASSE_DO_BOTAO_PEQUENO}>
                        {baixando === id ? "Baixando..." : "Baixar PDF"}
                      </button>
                    </div>
                    {erroDoItem?.id === id && (
                      <p role="alert" className="mt-2 text-[13px] text-[#9B1C1C]">
                        {erroDoItem.mensagem}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            )}
          </section>
        )}

        {aba === "simulados" && (
          <section role="tabpanel" id="painel-simulados" aria-labelledby="aba-simulados" className="flex flex-col gap-3">
            <p className="text-[14px] text-ardosia">Os simulados em PDF que você comprou no site. Cada conta baixa os seus, com o seu nome no arquivo.</p>
            {erroDosSimulados && (
              <p role="alert" className="rounded-xl border border-[#F1C4C4] bg-[#FFF5F5] px-4 py-3 text-[13.5px] text-[#9B1C1C]">
                Não foi possível carregar os PDFs que você comprou ({erroDosSimulados}). Eles continuam em Compras.
              </p>
            )}
            {totalDeSimulados === 0 && !erroDosSimulados && (
              <Vazio texto="Você ainda não tem simulados em PDF. Os que você comprar aparecem aqui." acao={{ href: "/simulados", rotulo: "Ver simulados" }} />
            )}
            {/* As versões em PDF dos simulados já aplicados: cada uma com os seus PDFs (prova, gabarito...). */}
            {simuladosEmPdf.map((s) => (
              <div key={s.simuladoId} className={`${CLASSE_DO_CARTAO} overflow-hidden`}>
                <div className="px-[22px] pb-1 pt-4">
                  <div className="text-[15px] font-bold leading-snug">{s.nome}</div>
                  {!s.liberado && (
                    <div className="mt-0.5 text-[13px] text-ardosia">
                      {s.abreEm ? `Os PDFs ficam disponíveis a partir de ${formatarData(s.abreEm)}.` : "Os PDFs ainda não foram liberados."}
                    </div>
                  )}
                </div>
                {s.pdfs.map((pdf) => {
                  const id = `simulado-${s.simuladoId}-${pdf.id}`;
                  return (
                    <div key={pdf.id} className="border-t border-linha px-[22px] py-3.5">
                      <div className="flex items-center gap-3.5">
                        <span className={CLASSE_DO_SELO}>PDF</span>
                        <div className="min-w-0 flex-1">
                          <div className="line-clamp-2 text-[15px] font-semibold leading-snug">{pdf.titulo}</div>
                          {pdf.tamanhoEmBytes ? <div className="mt-0.5 text-[13px] text-ardosia">{formatarTamanho(pdf.tamanhoEmBytes)}</div> : null}
                        </div>
                        <button type="button" onClick={() => baixarDoSimulado(s, pdf)} disabled={!s.liberado || baixando === id} className={CLASSE_DO_BOTAO_PEQUENO}>
                          {baixando === id ? "Baixando..." : "Baixar PDF"}
                        </button>
                      </div>
                      {erroDoItem?.id === id && (
                        <p role="alert" className="mt-2 text-[13px] text-[#9B1C1C]">
                          {erroDoItem.mensagem}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            {simulados.length > 0 && (
            <div className={`${CLASSE_DO_CARTAO} overflow-hidden`}>
              {simulados.map((c, i) => {
                const id = `compra-${c.id}`;
                return (
                  <div key={c.id} className={`px-[22px] py-3.5 ${i > 0 ? "border-t border-linha" : ""}`}>
                    <div className="flex items-center gap-3.5">
                      <span className={CLASSE_DO_SELO}>PDF</span>
                      <div className="min-w-0 flex-1">
                        <div className="line-clamp-2 text-[15px] font-semibold leading-snug">{c.item.nome}</div>
                        <div className="mt-0.5 text-[13px] text-ardosia">Comprado em {formatarData(c.pagaEm ?? c.criadaEm)}</div>
                      </div>
                      <button type="button" onClick={() => baixarComprado(c)} disabled={baixando === id} className={CLASSE_DO_BOTAO_PEQUENO}>
                        {baixando === id ? "Baixando..." : "Baixar PDF"}
                      </button>
                    </div>
                    {erroDoItem?.id === id && (
                      <p role="alert" className="mt-2 text-[13px] text-[#9B1C1C]">
                        {erroDoItem.mensagem}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            )}
          </section>
        )}

        {aba === "diarios" && (
        <section role="tabpanel" id="painel-diarios" aria-labelledby="aba-diarios" className="flex flex-col gap-4">
        <p className="text-[14px] text-ardosia">O material de aula que a coordenação publica nas turmas em que você está matriculado.</p>
        {materiais.length === 0 && (
          <Vazio texto="Nenhum material diário por aqui ainda. Os materiais publicados nas suas turmas aparecem aqui assim que forem liberados." acao={{ href: "/aluno/turmas", rotulo: "Ver minhas turmas" }} />
        )}
        {turmas.length > 1 && (
          <Filtros
            rotulo="Filtrar por turma"
            todos="Todas as turmas"
            opcoes={turmas}
            valor={turma}
            aoEscolher={(id) => {
              setTurma(id);
              setMateria("");
            }}
          />
        )}
        {materias.length > 1 && <Filtros rotulo="Filtrar por matéria" todos="Todas" opcoes={materias} valor={materia} aoEscolher={setMateria} />}

        {materiais.length > 0 && (
        <div className={`${CLASSE_DO_CARTAO} overflow-hidden`}>
          {filtrados.length === 0 && <p className="px-[22px] py-8 text-center text-[15px] text-ardosia">Nenhum material desta turma ou matéria ainda.</p>}

          {filtrados.map((m, i) => {
            const novo = m.novo && !vistos.has(m.id);
            const detalhes = [
              m.materiaNome,
              m.topicoNome,
              `Publicado em ${formatarData(m.publicadoEm)}`,
              m.tipo === "VIDEO" && m.duracaoEmMinutos ? `${m.duracaoEmMinutos} min` : formatarTamanho(m.tamanhoEmBytes),
            ].filter(Boolean);
            return (
              <div key={m.id} className={`px-[22px] py-3.5 ${i > 0 ? "border-t border-linha" : ""}`}>
                <div className="flex items-center gap-3.5">
                  <span className={CLASSE_DO_SELO}>{ROTULO_DO_TIPO[m.tipo]}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2 text-[15px] font-semibold leading-snug">
                      <span className="line-clamp-2">{m.titulo}</span>
                      {novo && <span className="flex-shrink-0 rounded-full bg-azul px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.06em] text-white">Novo</span>}
                    </div>
                    <div className="mt-0.5 text-[13px] text-ardosia">
                      {turmas.length > 1 && !turma ? `${m.turmaNome} · ` : ""}
                      {detalhes.join(" · ")}
                    </div>
                  </div>
                  {m.tipo === "VIDEO" ? (
                    m.videoUrl && (
                      <a
                        href={m.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => marcarVisto(m)}
                        className="inline-flex h-10 flex-none items-center rounded-[9px] bg-azul px-4 font-display text-[13.5px] font-bold text-white transition-colors hover:bg-azul-forte hover:text-white"
                      >
                        Assistir
                      </a>
                    )
                  ) : (
                    <button type="button" onClick={() => baixar(m)} disabled={baixando === m.id} className={CLASSE_DO_BOTAO_PEQUENO}>
                      {baixando === m.id ? "Baixando..." : "Baixar"}
                    </button>
                  )}
                </div>
                {erroDoItem?.id === m.id && (
                  <p role="alert" className="mt-2 text-[13px] text-[#9B1C1C]">
                    {erroDoItem.mensagem}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        )}
        </section>
        )}
      </div>
    </EstadoLista>
  );
}

// A lista vazia de cada aba, com o caminho para encher.
function Vazio({ texto, acao }: { texto: string; acao: { href: string; rotulo: string } }) {
  return (
    <div className={`${CLASSE_DO_CARTAO} flex flex-col items-center gap-3 px-6 py-10 text-center`}>
      <p className="max-w-[460px] text-[15px] text-ardosia">{texto}</p>
      <Link href={acao.href} className={CLASSE_DO_BOTAO_PEQUENO}>
        {acao.rotulo}
      </Link>
    </div>
  );
}

function Filtros({
  rotulo,
  todos,
  opcoes,
  valor,
  aoEscolher,
}: {
  rotulo: string;
  todos: string;
  opcoes: [string, string][];
  valor: string;
  aoEscolher: (id: string) => void;
}) {
  return (
    <div role="group" aria-label={rotulo} className="sem-barra flex gap-2 overflow-x-auto p-0.5">
      {[["", todos] as [string, string], ...opcoes].map(([id, nome]) => {
        const ligado = valor === id;
        return (
          <button
            key={id || "todos"}
            type="button"
            aria-pressed={ligado}
            onClick={() => aoEscolher(id)}
            className={`h-10 flex-none whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition-colors ${
              ligado ? "border-marinho-950 bg-marinho-950 text-white" : "border-linha-forte bg-superficie text-ardosia-escura hover:border-azul hover:text-azul"
            }`}
          >
            {nome}
          </button>
        );
      })}
    </div>
  );
}
