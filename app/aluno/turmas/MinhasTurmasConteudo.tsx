"use client";

import Link from "next/link";
import EstadoLista from "@/components/EstadoLista";
import Kicker from "@/components/Kicker";
import {
  buscarAgendaDaTurma,
  buscarTurma,
  listarMatriculasDoAluno,
  type Matricula,
  type TurmaDoAluno,
} from "@/lib/api";
import { formatarData, formatarHora } from "@/lib/format";
import { useCarregar } from "@/lib/useCarregar";
import { useCarregandoUsuario, useUsuarioAtual } from "@/lib/usuario";

type TurmaComProgresso = {
  matricula: Matricula;
  turma: TurmaDoAluno;
  // null quando a agenda não pôde ser lida; aí o card mostra só o período.
  aulas: { realizadas: number; total: number } | null;
};

async function carregarMinhasTurmas(alunoId: string): Promise<TurmaComProgresso[]> {
  const matriculas = await listarMatriculasDoAluno(alunoId);
  return Promise.all(
    matriculas.map(async (matricula) => {
      const turma = await buscarTurma(matricula.turmaId);
      const aulas = await buscarAgendaDaTurma(turma.id, turma.inicio, turma.termino)
        .then((agenda) => {
          const validas = agenda.filter((a) => a.status !== "CANCELADA");
          return { realizadas: validas.filter((a) => a.status === "REALIZADA").length, total: validas.length };
        })
        .catch(() => null);
      return { matricula, turma, aulas };
    }),
  );
}

const situacao: Record<Matricula["situacao"], { label: string; cor: string }> = {
  ATIVA: { label: "Ativa", cor: "text-[#3E7A44]" },
  TRANCADA: { label: "Trancada", cor: "text-[#9B3535]" },
  CONCLUIDA: { label: "Concluída", cor: "text-steel" },
};

const diasAbreviados: Record<string, string> = {
  SEGUNDA: "Seg",
  TERCA: "Ter",
  QUARTA: "Qua",
  QUINTA: "Qui",
  SEXTA: "Sex",
  SABADO: "Sáb",
  DOMINGO: "Dom",
};

function descreverHorario(turma: TurmaDoAluno) {
  const sequencia = ["SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA"];
  const dias =
    turma.dias.length === 5 && sequencia.every((d) => turma.dias.includes(d))
      ? "Seg a Sex"
      : turma.dias.map((d) => diasAbreviados[d] ?? d).join(", ");
  const horario =
    turma.horarioInicial && turma.horarioFim
      ? `${formatarHora(turma.horarioInicial)}–${formatarHora(turma.horarioFim)}`
      : "";
  return [dias, horario].filter(Boolean).join(" · ");
}

export default function MinhasTurmasConteudo() {
  const usuario = useUsuarioAtual();
  const carregandoUsuario = useCarregandoUsuario();
  const alunoId = usuario?.aluno?.id ?? null;
  const { carregando, dados, erro, tentarNovamente } = useCarregar(alunoId, carregarMinhasTurmas);
  // Conta sem cadastro de aluno (professor, administrador) não tem matrículas.
  const semCadastroDeAluno = !carregandoUsuario && !alunoId;

  return (
    <EstadoLista
      carregando={!semCadastroDeAluno && (carregandoUsuario || carregando)}
      erro={semCadastroDeAluno ? null : erro}
      onTentarNovamente={tentarNovamente}
      vazio={semCadastroDeAluno || (dados?.length ?? 0) === 0}
      vazioTitulo="Você ainda não está em nenhuma turma"
      vazioTexto="Quando sua matrícula for confirmada, a turma e o seu progresso aparecem aqui."
      vazioAcao={{ href: "/turmas", label: "Ver turmas" }}
      alturaCarregando="h-[220px]"
      linhasCarregando={1}
    >
      <div className="grid gap-5">
        {dados?.map(({ matricula, turma, aulas }) => {
          const pct = aulas && aulas.total > 0 ? Math.round((aulas.realizadas / aulas.total) * 100) : 0;
          return (
            <div key={matricula.id} className="border border-light bg-white p-6">
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <Kicker>{descreverHorario(turma)}</Kicker>
                <span className={`text-[11px] font-semibold uppercase tracking-wide ${situacao[matricula.situacao].cor}`}>
                  {situacao[matricula.situacao].label}
                </span>
              </div>
              <h3 className="font-display mb-1.5 text-xl font-bold uppercase">{turma.nome}</h3>
              <p className="mb-5 text-sm text-[#5A6472]">
                {formatarData(turma.inicio)} a {formatarData(turma.termino)}
                {turma.descricao ? ` · ${turma.descricao}` : ""}
              </p>

              {aulas && aulas.total > 0 && (
                <>
                  <div className="mb-1.5 flex items-center justify-between text-xs text-steel">
                    <span>Progresso do curso</span>
                    <span className="font-semibold text-navy">
                      {aulas.realizadas} de {aulas.total} aulas realizadas
                    </span>
                  </div>
                  <div className="mb-5 h-1.5 w-full bg-[#E2DFD6]">
                    <div className="h-full bg-blue" style={{ width: `${pct}%` }} />
                  </div>
                </>
              )}

              <Link
                href={`/aluno/materiais?turma=${turma.id}`}
                className="btn btn-outline-dark px-5 py-2.5 text-xs"
              >
                Ver materiais da turma
              </Link>
            </div>
          );
        })}
      </div>
    </EstadoLista>
  );
}
