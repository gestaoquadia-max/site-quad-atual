"use client";

import { useState } from "react";
import EstadoLista from "@/components/EstadoLista";
import { CLASSE_DO_BOTAO_PEQUENO, CLASSE_DO_CARTAO, CLASSE_DO_SELO } from "@/components/aluno/CabecalhoDoAluno";
import {
  baixarArquivoDoMaterial,
  listarMeusMateriais,
  marcarMaterialComoVisto,
  type MaterialDaTurma,
} from "@/lib/api";
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

// A lista não depende de nenhum parâmetro: a chave só indica que já dá para carregar.
const carregarMateriais = () => listarMeusMateriais();

function formatarTamanho(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`;
}

function salvarArquivo(blob: Blob, nome: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nome;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
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

  const materiais = dados ?? [];
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

  return (
    <EstadoLista
      carregando={carregandoUsuario || carregando}
      erro={erro}
      onTentarNovamente={tentarNovamente}
      vazio={materiais.length === 0}
      vazioTitulo="Nenhum material por aqui ainda"
      vazioTexto="Os materiais publicados nas suas turmas aparecem aqui assim que forem liberados."
      vazioAcao={{ href: "/aluno/turmas", label: "Ver minhas turmas" }}
    >
      <div className="flex flex-col gap-5">
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
              <div key={m.id} className={`px-[22px] py-3.5 ${i > 0 ? "border-t border-[#EEF2F7]" : ""}`}>
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
      </div>
    </EstadoLista>
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
              ligado ? "border-marinho-950 bg-marinho-950 text-white" : "border-linha-forte bg-white text-ardosia-escura hover:border-azul hover:text-azul"
            }`}
          >
            {nome}
          </button>
        );
      })}
    </div>
  );
}
