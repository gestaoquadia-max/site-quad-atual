"use client";

import EstadoLista from "@/components/EstadoLista";
import { CLASSE_DO_CARTAO, Etiqueta } from "@/components/aluno/CabecalhoDoAluno";
import { listarMinhasInscricoes, type AtividadeDoAluno } from "@/lib/api";
import { formatarData, formatarHora } from "@/lib/format";
import { useCarregar } from "@/lib/useCarregar";
import { useCarregandoUsuario, useUsuarioAtual } from "@/lib/usuario";

const carregarInscricoes = () => listarMinhasInscricoes();

const desfecho = {
  CONCLUIDA: { label: "Participou", tom: "verde" as const },
  AUSENTE: { label: "Não compareceu", tom: "vermelho" as const },
};

function quando(a: AtividadeDoAluno) {
  return a.quando
    .map((b) => `${formatarData(b.data)} · ${formatarHora(b.inicio)}–${formatarHora(b.fim)}`)
    .join(" | ");
}

// Data do último bloco: depois dela, a atividade já aconteceu.
function terminou(a: AtividadeDoAluno, hoje: string) {
  const ultimo = a.quando.map((b) => b.data).sort().at(-1);
  return a.desfecho !== null || (!!ultimo && ultimo < hoje);
}

const MESES = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

function CartaoDaAtividade({ atividade, passada }: { atividade: AtividadeDoAluno; passada: boolean }) {
  const resultado = atividade.desfecho ? desfecho[atividade.desfecho] : null;
  const [, mes, dia] = (atividade.quando.map((b) => b.data).sort()[0] ?? "").split("-");
  return (
    <article className={`${CLASSE_DO_CARTAO} flex items-center gap-4 p-[18px] ${passada ? "opacity-90" : ""}`}>
      <div
        aria-hidden="true"
        className={`grid h-[68px] w-[64px] flex-none place-content-center rounded-[14px] text-center ${passada ? "bg-[#EEF2F7] text-ardosia-escura" : "bg-marinho-900 text-white"}`}
      >
        <div className="font-display text-[26px] font-extrabold leading-none tracking-[-0.03em]">{dia ?? "—"}</div>
        <div className={`mt-1 text-[11px] font-bold tracking-[0.12em] ${passada ? "" : "text-azul-vivo"}`}>{mes ? MESES[Number(mes) - 1] : ""}</div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-azul-forte">
          {atividade.tipo === "SIMULADO" ? "Simulado" : "Evento"} · {atividade.presencial ? "Presencial" : "Online"}
        </div>
        <h3 className="mt-1 font-display text-[17px] font-extrabold leading-tight">{atividade.nome}</h3>
        <p className="mt-1 text-[13.5px] text-ardosia">{quando(atividade)}</p>
      </div>
      {passada ? resultado && <Etiqueta tom={resultado.tom}>{resultado.label}</Etiqueta> : <Etiqueta tom="verde">Inscrito</Etiqueta>}
    </article>
  );
}

export default function MeusEventosConteudo() {
  const usuario = useUsuarioAtual();
  const carregandoUsuario = useCarregandoUsuario();
  const alunoId = usuario?.aluno?.id ?? null;
  const { carregando, dados, erro, tentarNovamente } = useCarregar(alunoId, carregarInscricoes);
  const semCadastroDeAluno = !carregandoUsuario && !alunoId;

  const hoje = new Date().toISOString().slice(0, 10);
  const atividades = dados ?? [];
  const proximas = atividades.filter((a) => !terminou(a, hoje));
  const anteriores = atividades.filter((a) => terminou(a, hoje)).reverse();

  return (
    <EstadoLista
      carregando={!semCadastroDeAluno && (carregandoUsuario || carregando)}
      erro={semCadastroDeAluno ? null : erro}
      onTentarNovamente={tentarNovamente}
      vazio={semCadastroDeAluno || atividades.length === 0}
      vazioTitulo="Nenhuma inscrição em eventos"
      vazioTexto="Simulados, aulões e encontros em que você se inscrever aparecem aqui."
      vazioAcao={{ href: "/eventos", label: "Ver eventos" }}
      alturaCarregando="h-[150px]"
      linhasCarregando={2}
    >
      {proximas.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 font-display text-xl font-extrabold tracking-[-0.01em]">Próximos</h2>
          <div className="grid gap-3.5 xl:grid-cols-2">
            {proximas.map((a) => (
              <CartaoDaAtividade key={`${a.tipo}:${a.id}`} atividade={a} passada={false} />
            ))}
          </div>
        </section>
      )}
      {anteriores.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-xl font-extrabold tracking-[-0.01em]">Anteriores</h2>
          <div className="grid gap-3.5 xl:grid-cols-2">
            {anteriores.map((a) => (
              <CartaoDaAtividade key={`${a.tipo}:${a.id}`} atividade={a} passada />
            ))}
          </div>
        </section>
      )}
    </EstadoLista>
  );
}
