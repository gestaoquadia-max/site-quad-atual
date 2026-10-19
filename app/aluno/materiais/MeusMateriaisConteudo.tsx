"use client";

import { useState } from "react";
import EstadoLista from "@/components/EstadoLista";
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

const rotuloDoTipo: Record<MaterialDaTurma["tipo"], string> = {
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

  const classeFiltro =
    "border border-light bg-white px-3 py-2 text-sm text-navy outline-none focus:border-blue";

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
      <div className="mb-5 flex flex-wrap gap-2.5">
        {turmas.length > 1 && (
          <select
            aria-label="Filtrar por turma"
            value={turma}
            onChange={(e) => {
              setTurma(e.target.value);
              setMateria("");
            }}
            className={classeFiltro}
          >
            <option value="">Todas as turmas</option>
            {turmas.map(([id, nome]) => (
              <option key={id} value={id}>
                {nome}
              </option>
            ))}
          </select>
        )}
        {materias.length > 1 && (
          <select
            aria-label="Filtrar por matéria"
            value={materia}
            onChange={(e) => setMateria(e.target.value)}
            className={classeFiltro}
          >
            <option value="">Todas as matérias</option>
            {materias.map(([id, nome]) => (
              <option key={id} value={id}>
                {nome}
              </option>
            ))}
          </select>
        )}
      </div>

      {filtrados.length === 0 && (
        <p className="border border-light bg-white p-6 text-center text-sm text-steel">
          Nenhum material desta turma ou matéria ainda.
        </p>
      )}

      {filtrados.map((m) => {
        const novo = m.novo && !vistos.has(m.id);
        const detalhes = [
          m.materiaNome,
          m.topicoNome,
          `Publicado em ${formatarData(m.publicadoEm)}`,
          m.tipo === "VIDEO" && m.duracaoEmMinutos ? `${m.duracaoEmMinutos} min` : formatarTamanho(m.tamanhoEmBytes),
        ].filter(Boolean);
        return (
          <div key={m.id} className="mb-2.5 border border-light bg-white px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3.5">
                <span className="font-display flex h-11 min-w-[52px] flex-shrink-0 items-center justify-center bg-navy px-1.5 text-[10px] font-bold uppercase tracking-wide text-blue">
                  {rotuloDoTipo[m.tipo]}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[15px] font-semibold">
                    <span className="truncate">{m.titulo}</span>
                    {novo && (
                      <span className="flex-shrink-0 bg-blue px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy-deep">
                        Novo
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-steel">
                    {turmas.length > 1 && !turma ? `${m.turmaNome} · ` : ""}
                    {detalhes.join(" · ")}
                  </div>
                </div>
              </div>
              {m.tipo === "VIDEO" ? (
                m.videoUrl && (
                  <a
                    href={m.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => marcarVisto(m)}
                    className="focus-ring font-display flex-shrink-0 bg-navy px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-blue transition-colors hover:bg-navy-mid"
                  >
                    Assistir
                  </a>
                )
              ) : (
                <button
                  type="button"
                  onClick={() => baixar(m)}
                  disabled={baixando === m.id}
                  className="focus-ring font-display flex-shrink-0 bg-navy px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-blue transition-colors hover:bg-navy-mid disabled:opacity-60"
                >
                  {baixando === m.id ? "Baixando..." : "Baixar"}
                </button>
              )}
            </div>
            {erroDoItem?.id === m.id && (
              <p role="alert" className="mt-2 text-xs text-[#9B3535]">
                {erroDoItem.mensagem}
              </p>
            )}
          </div>
        );
      })}
    </EstadoLista>
  );
}
