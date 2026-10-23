"use client";

import { idDoItem } from "@/lib/itens";
import { esgotada, horarioDoDia, insigniaDaTurma, NOME_DO_TURNO, precoDaOferta, textoDoLote, type TurmaComTurnos } from "@/lib/turmas";
import AviseMePeloWhatsApp from "../AviseMePeloWhatsApp";
import BotaoAdicionarAoCarrinho from "../BotaoAdicionarAoCarrinho";

const MESES = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

// "2026-11-19" → "19 NOV 2026"
function data(iso: string) {
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia} ${MESES[Number(mes) - 1]} ${ano}`;
}

function meses(inicio: string, termino: string) {
  const n = Math.max(1, Math.round((Date.parse(termino) - Date.parse(inicio)) / 86_400_000 / 30.44));
  return n === 1 ? "1 mês" : `${n} meses`;
}

// Ficha da turma (turno, datas e horário), vagas, preço e compra. Cada turma tem um turno só e o seu próprio número
// (RONDESP 1 Manhã, RONDESP 2 Noite…): não há seletor de turno; as outras turmas da modalidade ficam na página.
export default function EscolhaDoTurno({ turma }: { turma: TurmaComTurnos }) {
  const oferta = turma.ofertas[0];
  const preco = precoDaOferta(oferta);
  const lote = textoDoLote(oferta.lote);
  const semVagas = esgotada(oferta);
  const duracao = oferta.inicio && oferta.termino ? meses(oferta.inicio, oferta.termino) : null;
  const restantes = oferta.vagas ? oferta.vagas.total - oferta.vagas.ocupadas : null;
  const pct = oferta.vagas ? Math.round((oferta.vagas.ocupadas / oferta.vagas.total) * 100) : 0;
  const nomeDoTurno = oferta.turno ? NOME_DO_TURNO[oferta.turno] : null;

  const ficha = [
    nomeDoTurno && { rotulo: "Turno", valor: nomeDoTurno },
    oferta.inicio && { rotulo: "Início", valor: data(oferta.inicio) },
    oferta.termino && { rotulo: "Término", valor: data(oferta.termino) },
    duracao && { rotulo: "Duração", valor: duracao },
    oferta.horarios.length > 0 && { rotulo: "Horário", valor: horarioDoDia(oferta.horarios) },
  ].filter((f): f is { rotulo: string; valor: string } => Boolean(f));

  return (
    <>
      {ficha.length > 0 && (
        <ul className="mt-7 border-t border-white/10">
          {ficha.map((f) => (
            <li key={f.rotulo} className="flex min-h-[52px] items-center gap-3 border-b border-white/[0.08] text-[15.5px] text-[#DCE4EF]">
              <span className="h-1.5 w-1.5 flex-none rounded-[1px] bg-azul-vivo" />
              <span className="text-prata">{f.rotulo}:</span> {f.valor}
            </li>
          ))}
        </ul>
      )}

      {oferta.vagas && restantes !== null && (
        <div className="mt-6">
          <div className="mb-2 flex flex-wrap justify-between gap-x-3 gap-y-1 text-[13.5px] text-prata">
            <span>Vagas</span>
            <strong className={`font-semibold ${semVagas ? "text-[#F3A3B1]" : "text-white"}`}>
              {semVagas ? "Turma lotada" : restantes === 1 ? "Última vaga" : `${restantes} de ${oferta.vagas.total} disponíveis`}
            </strong>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-label="Vagas preenchidas"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuetext={`${oferta.vagas.ocupadas} de ${oferta.vagas.total} vagas preenchidas`}
          >
            <div className="h-full rounded-full bg-[linear-gradient(90deg,#2F86FF,#6FAEFF)]" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      <div className="mt-7 flex flex-wrap items-baseline gap-x-2 gap-y-2">
        {preco ? (
          <>
            <span className="font-display text-lg font-bold text-prata">R$</span>
            <span className="font-display text-[clamp(44px,5vw,56px)] font-extrabold leading-none tracking-[-0.035em] [font-variant-numeric:tabular-nums]">
              {preco.replace(/^R\$\s?/, "")}
            </span>
          </>
        ) : (
          <span className="font-display text-[clamp(32px,4vw,40px)] font-extrabold">Valor a confirmar</span>
        )}
        {lote && (
          <span className="ml-1 inline-flex items-center rounded-full bg-[#FFF0D9] px-[11px] py-[5px] text-[12.5px] font-semibold text-[#8A4B00]">{lote}</span>
        )}
      </div>
      <p className="mt-2 text-[13px] text-prata">Valor fechado pela duração · Material didático incluso · Sem taxa de matrícula</p>

      <div className="mt-6 max-w-[420px]">
        {preco && !semVagas ? (
          <BotaoAdicionarAoCarrinho
            item={{
              id: idDoItem("turma", oferta.slug),
              tipo: "turma",
              nome: turma.nome,
              tag: [nomeDoTurno, turma.cargo, turma.concurso].filter(Boolean).join(" · "),
              preco,
              alvo: { atividade: { tipo: "TURMA", id: oferta.id } },
              imagem: insigniaDaTurma(turma.modalidade) ?? undefined,
            }}
            className="h-14 w-full rounded-xl text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_16px_36px_-14px_rgba(0,107,255,1)] hover:-translate-y-0.5"
          />
        ) : (
          <AviseMePeloWhatsApp
            assunto={`vaga na turma ${turma.nome}${nomeDoTurno ? ` (${nomeDoTurno})` : ""}`}
            rotulo="Lista de espera pelo WhatsApp"
            destaque
            className="h-14 w-full"
          />
        )}
      </div>
    </>
  );
}
