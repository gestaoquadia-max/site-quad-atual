"use client";

import Link from "next/link";
import EstadoLista from "@/components/EstadoLista";
import CabecalhoDoAluno, { CLASSE_DO_BOTAO_PEQUENO, CLASSE_DO_CARTAO, CLASSE_DO_SELO } from "@/components/aluno/CabecalhoDoAluno";
import { listarMatriculasDoAluno, listarMeusMateriais, listarMinhasInscricoes } from "@/lib/api";
import { formatarData } from "@/lib/format";
import { useCarregar } from "@/lib/useCarregar";
import { useCarregandoUsuario, useUsuarioAtual } from "@/lib/usuario";
import { ROTULO_DO_TIPO } from "./materiais/MeusMateriaisConteudo";

const MESES = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

// Resumo do painel. Materiais e eventos que falharem não derrubam o painel: contam como vazios.
async function carregarResumo(alunoId: string) {
  const hoje = new Date().toISOString().slice(0, 10);
  const [matriculas, materiais, inscricoes] = await Promise.all([
    listarMatriculasDoAluno(alunoId),
    listarMeusMateriais().catch(() => []),
    listarMinhasInscricoes().catch(() => []),
  ]);
  const proximaData = inscricoes
    .flatMap((a) => a.quando.map((b) => b.data))
    .filter((d) => d >= hoje)
    .sort()[0];
  return {
    turmasAtivas: matriculas.filter((m) => m.situacao === "ATIVA").length,
    materiais,
    proximaData: proximaData ?? null,
  };
}

function Numero({ rotulo, valor, unidade }: { rotulo: string; valor: string; unidade?: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-marinho-900 px-5 pb-[18px] pt-5 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[image:radial-gradient(80%_90%_at_100%_0%,rgba(0,107,255,0.22),transparent_70%)]" />
      <div className="relative text-[11.5px] font-semibold uppercase tracking-[0.12em] text-prata">{rotulo}</div>
      <div className="relative mt-3 flex items-baseline gap-1.5">
        <span className="font-display text-[40px] font-extrabold leading-none tracking-[-0.04em] [font-variant-numeric:tabular-nums]">{valor}</span>
        {unidade && <span className="font-display text-sm font-extrabold tracking-[0.12em] text-azul-vivo">{unidade}</span>}
      </div>
    </div>
  );
}

export default function PainelConteudo() {
  const usuario = useUsuarioAtual();
  const carregandoUsuario = useCarregandoUsuario();
  const alunoId = usuario?.aluno?.id ?? null;
  const { carregando, dados, erro, tentarNovamente } = useCarregar(alunoId, carregarResumo);
  // Conta sem cadastro de aluno (professor, administrador) não tem turmas nem compras.
  const semCadastroDeAluno = !carregandoUsuario && !alunoId;
  const primeiroNome = usuario?.nome?.split(" ")[0];
  const recentes = dados?.materiais.slice(0, 3) ?? [];
  const [, mes, dia] = dados?.proximaData?.split("-") ?? [];

  return (
    <>
      <CabecalhoDoAluno titulo="Painel" subtitulo="Resumo das suas turmas, materiais e eventos." />
      <div className="flex flex-col gap-5">
        <div className={`${CLASSE_DO_CARTAO} px-6 py-[22px]`}>
          {carregandoUsuario ? (
            <span className="inline-block h-6 w-64 animate-pulse rounded bg-[#E6ECF4] align-middle" aria-label="Carregando" />
          ) : (
            <div className="font-display text-[22px] font-extrabold tracking-[-0.02em]">Bem-vindo de volta{primeiroNome ? `, ${primeiroNome}` : ""}.</div>
          )}
          <div className="mt-1 text-[14.5px] text-ardosia">
            Missão do dia: <span className="font-semibold text-azul-forte">constância.</span>
          </div>
        </div>

        <EstadoLista
          carregando={!semCadastroDeAluno && (carregandoUsuario || carregando)}
          erro={semCadastroDeAluno ? null : erro}
          onTentarNovamente={tentarNovamente}
          vazio={semCadastroDeAluno}
          vazioTitulo="Esta conta não tem cadastro de aluno"
          vazioTexto="Turmas, materiais e eventos aparecem aqui nas contas de aluno."
          linhasCarregando={2}
        >
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-4">
            <Numero rotulo="Turmas ativas" valor={String(dados?.turmasAtivas ?? 0)} />
            <Numero rotulo="Materiais disponíveis" valor={String(dados?.materiais.length ?? 0)} />
            {dia ? <Numero rotulo="Próximo evento" valor={dia} unidade={MESES[Number(mes) - 1]} /> : <Numero rotulo="Próximo evento" valor="—" />}
          </div>

          <div className={`${CLASSE_DO_CARTAO} overflow-hidden`}>
            <div className="flex items-center justify-between gap-3 border-b border-[#EEF2F7] px-[22px] py-[18px]">
              <h2 className="font-display text-lg font-extrabold">Materiais recentes</h2>
              <Link href="/aluno/materiais" className="text-[13.5px] font-semibold text-azul-forte hover:text-azul">
                Ver todos
              </Link>
            </div>
            {recentes.length === 0 ? (
              <p className="px-[22px] py-6 text-[15px] text-ardosia">Os materiais das suas turmas aparecem aqui assim que forem publicados.</p>
            ) : (
              recentes.map((m, i) => (
                <div key={m.id} className={`flex items-center gap-3.5 px-[22px] py-3.5 ${i > 0 ? "border-t border-[#EEF2F7]" : ""}`}>
                  <span className={CLASSE_DO_SELO}>{ROTULO_DO_TIPO[m.tipo]}</span>
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-2 text-[15px] font-semibold leading-snug">{m.titulo}</div>
                    <div className="mt-0.5 text-[13px] text-ardosia">
                      {m.turmaNome} · {formatarData(m.publicadoEm)}
                    </div>
                  </div>
                  <Link href={`/aluno/materiais?turma=${m.turmaId}`} className={CLASSE_DO_BOTAO_PEQUENO}>
                    Abrir
                  </Link>
                </div>
              ))
            )}
          </div>
        </EstadoLista>
      </div>
    </>
  );
}
