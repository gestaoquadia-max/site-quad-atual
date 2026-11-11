"use client";

import Link from "next/link";
import { useState } from "react";
import { MESES_CURTOS, ROTULO_DO_TIPO, type ItemDaAgenda, type TipoNaAgenda } from "@/lib/agenda";

// Calendário da Agenda Quad (/eventos, entrega da designer de 11/11/2026): a grade do mês com uma barrinha colorida
// por evento no dia e, ao lado, os eventos do dia escolhido. Os itens vêm de lib/agenda.ts.

// O simulado na cor principal do site (azul; laranja na Black Friday, app/tema-black.css).
const COR_DO_TIPO: Record<TipoNaAgenda, string> = { simulado: "rgb(var(--c-azul))", excursao: "#E11D48", aulao: "#16A34A" };
const LEGENDA: { tipo: TipoNaAgenda; rotulo: string }[] = [
  { tipo: "simulado", rotulo: "Simulados" },
  { tipo: "excursao", rotulo: "Excursões" },
  { tipo: "aulao", rotulo: "Aulões" },
];
const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const SEMANA_CURTA = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const SEMANA = ["DOMINGO", "SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO"];

const dois = (n: number) => String(n).padStart(2, "0");
const chave = (ano: number, mes: number, dia: number) => `${ano}-${dois(mes + 1)}-${dois(dia)}`;

// O dia que abre selecionado num mês: o primeiro com evento a partir de hoje; sem nenhum, hoje (no mês atual) ou o dia 1.
function diaInicial(itens: ItemDaAgenda[], ano: number, mes: number, hoje: string) {
  const prefixo = `${ano}-${dois(mes + 1)}-`;
  const doMes = itens.filter((i) => i.data.startsWith(prefixo));
  const proximo = doMes.find((i) => i.data >= hoje) ?? doMes[0];
  if (proximo) return Number(proximo.data.slice(8, 10));
  return hoje.startsWith(prefixo) ? Number(hoje.slice(8, 10)) : 1;
}

export default function CalendarioDaAgenda({ itens, hoje }: { itens: ItemDaAgenda[]; hoje: string }) {
  // Abre no mês do próximo evento (ou no mês de hoje, sem nenhum à frente).
  const [inicio] = useState(() => {
    const ref = itens.find((i) => i.data >= hoje)?.data ?? hoje;
    const ano = Number(ref.slice(0, 4));
    const mes = Number(ref.slice(5, 7)) - 1;
    return { ano, mes, dia: diaInicial(itens, ano, mes, hoje) };
  });
  const [ano, setAno] = useState(inicio.ano);
  const [mes, setMes] = useState(inicio.mes);
  const [dia, setDia] = useState(inicio.dia);

  const porDia = new Map<string, ItemDaAgenda[]>();
  for (const i of itens) porDia.set(i.data, [...(porDia.get(i.data) ?? []), i]);

  function andar(passo: number) {
    const total = ano * 12 + mes + passo;
    const novoAno = Math.floor(total / 12);
    const novoMes = total % 12;
    setAno(novoAno);
    setMes(novoMes);
    setDia(diaInicial(itens, novoAno, novoMes, hoje));
  }

  const primeiroDia = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const doDia = porDia.get(chave(ano, mes, dia)) ?? [];
  const setas =
    "grid size-10 place-items-center rounded-full border border-[#94A3B8] bg-superficie text-tinta transition-colors hover:border-azul hover:text-azul";

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
      <div className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between gap-4">
          <h3 aria-live="polite" className="font-display text-2xl font-extrabold text-tinta">
            {MESES[mes]} {ano}
          </h3>
          <span className="flex gap-1.5">
            <button type="button" aria-label="Mês anterior" onClick={() => andar(-1)} className={setas}>
              ←
            </button>
            <button type="button" aria-label="Próximo mês" onClick={() => andar(1)} className={setas}>
              →
            </button>
          </span>
        </div>
        <ul className="flex flex-wrap gap-4 text-[13px] font-semibold text-ardosia-escura">
          {LEGENDA.map((l) => (
            <li key={l.tipo} className="flex items-center gap-1.5">
              <span aria-hidden="true" className="size-[9px] rounded-[3px]" style={{ background: COR_DO_TIPO[l.tipo] }} />
              {l.rotulo}
            </li>
          ))}
        </ul>
        <div className="grid grid-cols-[repeat(7,minmax(0,1fr))] gap-1 sm:gap-1.5">
          {SEMANA_CURTA.map((s) => (
            <span key={s} aria-hidden="true" className="text-center text-[10px] font-extrabold tracking-[0.1em] text-[#64748B] sm:text-[11px]">
              {s}
            </span>
          ))}
          {Array.from({ length: primeiroDia }, (_, i) => (
            <span key={`vazio-${i}`} aria-hidden="true" />
          ))}
          {Array.from({ length: diasNoMes }, (_, i) => {
            const d = i + 1;
            const eventos = porDia.get(chave(ano, mes, d)) ?? [];
            const escolhido = d === dia;
            return (
              <button
                key={d}
                type="button"
                aria-pressed={escolhido}
                aria-label={`${d} de ${MESES[mes].toLowerCase()}${eventos.length ? `, ${eventos.length === 1 ? "1 evento" : `${eventos.length} eventos`}` : ""}`}
                onClick={() => setDia(d)}
                className={`flex min-h-[52px] min-w-0 flex-col gap-1.5 rounded-[10px] border p-1.5 text-left transition-colors sm:min-h-[70px] sm:p-2 ${
                  escolhido
                    ? "border-azul bg-azul text-white"
                    : eventos.length
                      ? "border-linha bg-superficie text-tinta hover:border-azul"
                      : "border-linha bg-white/45 text-tinta hover:border-azul/60"
                }`}
              >
                <b className="font-display text-[13px] font-extrabold sm:text-[15px]">{d}</b>
                {eventos.length > 0 && (
                  <span aria-hidden="true" className="mt-auto flex w-full gap-[3px]">
                    {eventos.map((e) => (
                      <span key={e.id} className="h-1.5 flex-1 rounded-[3px]" style={{ background: escolhido ? "#fff" : COR_DO_TIPO[e.tipo] }} />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div aria-live="polite" className="flex flex-col gap-4 rounded-[18px] bg-[radial-gradient(80%_60%_at_50%_0%,#16325C,#0B1A33)] p-6 text-white">
        <span className="text-xs font-extrabold tracking-[0.16em] text-[#93C5FD]">
          {SEMANA[new Date(ano, mes, dia).getDay()]}, {dia} {MESES_CURTOS[mes]}
        </span>
        {doDia.length === 0 ? (
          <p className="border-t border-white/[0.12] pt-3.5 text-[15px] leading-normal text-[#CBD5E1]">
            Nenhum evento neste dia. Escolha um dia com a barrinha colorida.
          </p>
        ) : (
          doDia.map((e) => (
            <div key={e.id} className="flex flex-col gap-2 border-t border-white/[0.12] pt-3.5">
              <span
                className="self-start rounded-full px-[9px] py-[3px] text-[11px] font-extrabold uppercase tracking-[0.1em]"
                style={{ background: COR_DO_TIPO[e.tipo] }}
              >
                {ROTULO_DO_TIPO[e.tipo]}
              </span>
              <b className="font-display text-[22px] font-extrabold leading-[1.15]">{e.titulo}</b>
              <p className="line-clamp-3 text-[14.5px] leading-normal text-[#CBD5E1]">{e.descricao}</p>
              <Link href={e.href} className="btn-q btn-q-azul mt-1 h-[46px] w-full px-4 text-[15px]">
                {e.acao} <span aria-hidden="true">→</span>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
