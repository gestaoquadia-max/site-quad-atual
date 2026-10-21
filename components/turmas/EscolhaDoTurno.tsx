"use client";

import { useState } from "react";
import { idDoItem } from "@/lib/itens";
import { esgotada, horarioDoDia, NOME_DO_TURNO, ORDEM_DOS_TURNOS, precoDaOferta, textoDoLote, type TurmaComTurnos } from "@/lib/turmas";
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

// Seletor de turno (cada turno é uma linha da planilha) e tudo o que muda com ele: ficha, vagas, preço e compra.
export default function EscolhaDoTurno({ turma, inicial }: { turma: TurmaComTurnos; inicial: string }) {
  const [id, setId] = useState(inicial);
  const oferta = turma.ofertas.find((o) => o.id === id) ?? turma.ofertas[0];
  const preco = precoDaOferta(oferta);
  const lote = textoDoLote(oferta.lote);
  const semVagas = esgotada(oferta);
  const duracao = oferta.inicio && oferta.termino ? meses(oferta.inicio, oferta.termino) : null;
  const restantes = oferta.vagas ? oferta.vagas.total - oferta.vagas.ocupadas : null;
  const pct = oferta.vagas ? Math.round((oferta.vagas.ocupadas / oferta.vagas.total) * 100) : 0;
  const nomeDoTurno = oferta.turno ? NOME_DO_TURNO[oferta.turno] : null;
  // Manhã, Tarde e Noite sempre aparecem (Integral, só se existir). Turno sem oferta ou sem vaga fica desativado.
  const opcoes = ORDEM_DOS_TURNOS.filter((t) => t !== "INTEGRAL" || turma.ofertas.some((o) => o.turno === t)).map((t) => ({
    turno: t,
    oferta: turma.ofertas.find((o) => o.turno === t) ?? null,
  }));
  // Turma sem turno identificado (dado antigo): vira uma opção com o próprio nome.
  const semTurno = turma.ofertas.filter((o) => !o.turno);

  // O endereço acompanha o turno escolhido (cada turno tem a sua página), para o link compartilhado abrir nele.
  function escolher(novo: string) {
    setId(novo);
    const escolhida = turma.ofertas.find((o) => o.id === novo);
    if (escolhida) window.history.replaceState(null, "", `/turmas/${escolhida.slug}`);
  }

  const ficha = [
    oferta.inicio && { rotulo: "Início", valor: data(oferta.inicio) },
    oferta.termino && { rotulo: "Término", valor: data(oferta.termino) },
    duracao && { rotulo: "Duração", valor: duracao },
    oferta.horarios.length > 0 && { rotulo: "Horário", valor: horarioDoDia(oferta.horarios) },
  ].filter((f): f is { rotulo: string; valor: string } => Boolean(f));

  return (
    <>
      <div className="mt-7">
        <span id="rotulo-turno" className="text-[13px] font-semibold text-prata">
          Turno{nomeDoTurno && <span className="text-white"> · {nomeDoTurno}</span>}
        </span>
        <div role="radiogroup" aria-labelledby="rotulo-turno" className="mt-2.5 flex flex-wrap gap-2">
          {[
            ...opcoes.map(({ turno, oferta: o }) => ({ chave: turno, nome: NOME_DO_TURNO[turno], o })),
            ...semTurno.map((o) => ({ chave: o.id, nome: o.nomeOriginal, o })),
          ].map(({ chave, nome, o }) => {
            const marcada = !!o && o.id === oferta.id;
            // Sem vaga: o turno não é oferecido nesta turma ou já lotou.
            const semVaga = !o || esgotada(o);
            return (
              <button
                key={chave}
                type="button"
                role="radio"
                aria-checked={marcada}
                disabled={semVaga && !marcada}
                onClick={() => o && escolher(o.id)}
                className={`inline-flex min-h-[46px] min-w-[96px] flex-col items-center justify-center rounded-[10px] border px-4 py-1.5 font-display text-[15px] font-bold leading-tight transition-colors ${
                  marcada ? "border-white bg-white text-marinho-950" : "border-white/20 bg-white/[0.04] text-white hover:border-azul-ceu"
                } disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-transparent disabled:text-white/40 disabled:hover:border-white/10`}
              >
                {nome}
                {semVaga && <span className="font-body text-[11px] font-medium">(Indisponível)</span>}
              </button>
            );
          })}
        </div>
      </div>

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
            {duracao && <span className="text-[15px] text-prata">/ {duracao}</span>}
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
              precoSufixo: duracao ? ` / ${duracao}` : undefined,
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
