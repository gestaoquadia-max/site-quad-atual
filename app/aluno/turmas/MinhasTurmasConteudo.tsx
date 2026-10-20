"use client";

import Image from "next/image";
import Link from "next/link";
import EstadoLista from "@/components/EstadoLista";
import { CLASSE_DO_CARTAO, Etiqueta } from "@/components/aluno/CabecalhoDoAluno";
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

const situacao: Record<Matricula["situacao"], { label: string; tom: "verde" | "vermelho" | "cinza" }> = {
  ATIVA: { label: "Ativa", tom: "verde" },
  TRANCADA: { label: "Trancada", tom: "vermelho" },
  CONCLUIDA: { label: "Concluída", tom: "cinza" },
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
            <article key={matricula.id} className={`${CLASSE_DO_CARTAO} grid overflow-hidden md:grid-cols-[240px_minmax(0,1fr)]`}>
              <div aria-hidden="true" className="relative hidden place-items-center bg-marinho-900 bg-[image:radial-gradient(80%_70%_at_20%_10%,rgba(0,107,255,0.28),transparent_70%)] md:grid">
                <Image src="/images/quad-logo-branco.png" alt="" width={110} height={40} className="h-10 w-auto opacity-30" />
              </div>
              <div className="flex flex-col p-[clamp(20px,2.4vw,28px)]">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-azul-forte">{descreverHorario(turma)}</span>
                  <Etiqueta tom={situacao[matricula.situacao].tom}>{situacao[matricula.situacao].label}</Etiqueta>
                </div>
                <h2 className="mb-1.5 font-display text-[22px] font-extrabold leading-tight tracking-[-0.02em]">{turma.nome}</h2>
                <p className="mb-5 text-[14.5px] text-ardosia">
                  {formatarData(turma.inicio)} a {formatarData(turma.termino)}
                  {turma.descricao ? ` · ${turma.descricao}` : ""}
                </p>

                {aulas && aulas.total > 0 && (
                  <div className="mb-5">
                    <div className="mb-2 flex items-center justify-between text-[13px] text-ardosia">
                      <span>Progresso do curso</span>
                      <span className="font-semibold text-tinta">
                        {aulas.realizadas} de {aulas.total} aulas realizadas
                      </span>
                    </div>
                    <div
                      role="progressbar"
                      aria-label="Progresso do curso"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      className="h-2 w-full overflow-hidden rounded-full bg-[#E6ECF4]"
                    >
                      <div className="h-full rounded-full bg-azul" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )}

                <Link
                  href={`/aluno/materiais?turma=${turma.id}`}
                  className="mt-auto inline-flex items-center gap-2 self-start font-display text-[15px] font-bold text-azul-forte hover:text-azul"
                >
                  Ver materiais da turma <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </EstadoLista>
  );
}
