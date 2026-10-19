"use client";

import AccentCard from "@/components/AccentCard";
import EstadoLista from "@/components/EstadoLista";
import Kicker from "@/components/Kicker";
import { listarMinhasInscricoes, type AtividadeDoAluno } from "@/lib/api";
import { formatarData, formatarHora } from "@/lib/format";
import { useCarregar } from "@/lib/useCarregar";
import { useCarregandoUsuario, useUsuarioAtual } from "@/lib/usuario";

const carregarInscricoes = () => listarMinhasInscricoes();

const desfecho = {
  CONCLUIDA: { label: "Participou", cor: "text-[#3E7A44]" },
  AUSENTE: { label: "Não compareceu", cor: "text-[#9B3535]" },
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

function CartaoDaAtividade({ atividade, passada }: { atividade: AtividadeDoAluno; passada: boolean }) {
  const resultado = atividade.desfecho ? desfecho[atividade.desfecho] : null;
  return (
    <AccentCard className="p-6">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <Kicker>
          {atividade.tipo === "SIMULADO" ? "Simulado" : "Evento"} · {atividade.presencial ? "Presencial" : "Online"}
        </Kicker>
        {passada ? (
          resultado && (
            <span className={`text-[11px] font-semibold uppercase tracking-wide ${resultado.cor}`}>{resultado.label}</span>
          )
        ) : (
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#3E7A44]">Inscrito</span>
        )}
      </div>
      <h3 className="font-display mb-1.5 text-lg font-bold uppercase leading-tight">{atividade.nome}</h3>
      <p className="text-sm text-[#5A6472]">{quando(atividade)}</p>
    </AccentCard>
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
          <h3 className="font-display mb-4 text-xl font-bold uppercase">Próximos</h3>
          <div className="grid gap-5 sm:grid-cols-2">
            {proximas.map((a) => (
              <CartaoDaAtividade key={`${a.tipo}:${a.id}`} atividade={a} passada={false} />
            ))}
          </div>
        </section>
      )}
      {anteriores.length > 0 && (
        <section>
          <h3 className="font-display mb-4 text-xl font-bold uppercase">Anteriores</h3>
          <div className="grid gap-5 sm:grid-cols-2">
            {anteriores.map((a) => (
              <CartaoDaAtividade key={`${a.tipo}:${a.id}`} atividade={a} passada />
            ))}
          </div>
        </section>
      )}
    </EstadoLista>
  );
}
