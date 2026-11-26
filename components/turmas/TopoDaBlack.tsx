"use client";

import Link from "next/link";
import type { Turma } from "@/lib/data";
import { modalidades } from "@/lib/conteudo";
import { insigniaDaModalidade } from "@/lib/turmas";
import { SeloDaContagem } from "@/components/blackfriday/materiais/PartesDosMateriais";
import InsigniaDaTurma from "./InsigniaDaTurma";

// O topo de /turmas no período da Black (prévia da designer de 26/11/2026, "Preview Site Dia 27", aba Turmas): o título
// "Últimas vagas nas turmas presenciais", a contagem até o fim da Black e um cartão por modalidade com turma marcada
// como Black no cadastro. Vagas e preços vêm da API (as turmas da Black); sem turma da Black, a modalidade não aparece.
// Com todas esgotadas, o aviso "Vagas promocionais esgotadas" leva às Mentorias.

export function vagasRestantes(t: Turma) {
  const total = t.detalhe?.vagasTotal;
  return total === undefined ? null : total - (t.detalhe?.vagasOcupadas ?? 0);
}

type CartaoDaBlack = { id: string; nome: string; nivel: string | null; insignia: string | null; turmas: Turma[] };

export function cartoesDaBlack(daBlack: Turma[], todas: Turma[] | null): CartaoDaBlack[] {
  const ids = [...new Set(daBlack.map((t) => t.modalidadeId))];
  // RONDESP, PATAMO e BOPE na ordem dos níveis; outras modalidades depois, na ordem em que aparecem.
  const ordem = (id: string) => modalidades.findIndex((m) => m.id === id) + 1 || 99;
  return ids
    .sort((a, b) => ordem(a) - ordem(b))
    .map((id) => {
      const turmas = daBlack.filter((t) => t.modalidadeId === id);
      const nivel = modalidades.find((m) => m.id === id);
      return { id, nome: nivel?.nome ?? turmas[0].modalidadeNome, nivel: nivel?.nivel ?? null, insignia: insigniaDaModalidade(todas, id), turmas };
    });
}

function Cartao({ c, aoEscolher }: { c: CartaoDaBlack; aoEscolher: (id: string) => void }) {
  const abertas = c.turmas.filter((t) => t.status === "aberta");
  const comVagas = c.turmas.map(vagasRestantes);
  const conhecidas = comVagas.every((v) => v !== null);
  const restam = conhecidas ? comVagas.reduce<number>((s, v) => s + (v ?? 0), 0) : null;
  const total = conhecidas ? c.turmas.reduce((s, t) => s + (t.detalhe?.vagasTotal ?? 0), 0) : null;
  const ocupadas = restam !== null && total ? Math.round(((total - restam) / total) * 100) : null;
  // O preço da primeira turma aberta (as da Black costumam ter o mesmo); sem aberta, o da primeira.
  const ref = abertas[0] ?? c.turmas[0];
  const preco = ref.preco === "Consulte" ? null : ref.preco;
  const esgotada = abertas.length === 0;
  return (
    <article className="relative flex flex-col gap-[18px] rounded-3xl border-[1.5px] border-[#3A2E27] bg-[radial-gradient(80%_50%_at_50%_20%,rgba(242,90,12,0.28),#17120F_70%)] p-7 text-white">
      <InsigniaDaTurma
        insignia={c.insignia}
        tamanho={170}
        sizes="170px"
        className="mx-auto block h-[170px] w-[170px] object-contain [filter:drop-shadow(0_0_26px_rgba(255,110,20,0.6))_drop-shadow(0_18px_24px_rgba(0,0,0,0.6))]"
      />
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-[30px] font-extrabold tracking-[-0.02em]">{c.nome}</h2>
        {c.nivel && <span className="text-[15px] font-bold text-[#FF9A5C]">{c.nivel}</span>}
      </div>
      {restam !== null && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-[15px]">
            <span className="text-[#D6CCC5]">Vagas promocionais</span>
            <b className="text-[#FF7A2E]">{esgotada ? "esgotadas" : `restam ${restam}`}</b>
          </div>
          {ocupadas !== null && (
            <div
              className="h-2 overflow-hidden rounded-lg bg-[#2E241E]"
              role="progressbar"
              aria-label="Vagas promocionais preenchidas"
              aria-valuenow={ocupadas}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="h-full bg-[linear-gradient(90deg,#FF8A3D,#E5530A)]" style={{ width: `${ocupadas}%` }} />
            </div>
          )}
        </div>
      )}
      <div className="flex flex-col gap-0.5 border-t border-[#2E241E] pt-3.5">
        {preco && ref.precoCheio && (
          <span className="text-[17px] text-[#A39790]">
            <s>{ref.precoCheio}</s> por vaga
          </span>
        )}
        <span className="font-display text-[52px] font-extrabold leading-none tracking-[-0.045em]">{preco ?? "A confirmar"}</span>
      </div>
      <button
        type="button"
        onClick={() => aoEscolher(c.id)}
        className="btn-q mt-auto h-[54px] rounded-[14px] bg-[linear-gradient(180deg,#FF7A2E,#E5530A)] text-lg text-white shadow-[0_10px_26px_-8px_rgba(242,90,12,0.8)] hover:text-white"
      >
        {esgotada ? `Ver as turmas da ${c.nome}` : `Garantir vaga na ${c.nome} →`}
      </button>
    </article>
  );
}

export default function TopoDaBlack({ cartoes, aoEscolher }: { cartoes: CartaoDaBlack[]; aoEscolher: (id: string) => void }) {
  const esgotadas = cartoes.every((c) => c.turmas.every((t) => t.status !== "aberta"));
  return (
    <div className="flex flex-col gap-10">
      <nav aria-label="Trilha" className="flex gap-2 text-[15px] text-[#A39790]">
        <Link href="/" className="hover:text-white">
          Início
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="font-semibold text-white">
          Turmas Presenciais
        </span>
      </nav>
      {esgotadas ? (
        <div className="flex max-w-[720px] flex-col gap-[22px] py-4">
          <h1 className="font-display text-[clamp(2.4rem,5vw,3.5rem)] font-extrabold leading-[1.02] tracking-[-0.04em] [text-wrap:balance]">
            Vagas promocionais <span className="bg-[linear-gradient(180deg,#FF7A2E,#FF6A1A)] bg-clip-text text-transparent">esgotadas</span>
          </h1>
          <p className="text-[clamp(17px,1.6vw,20px)] leading-[1.45] text-[#D6CCC5]">
            As vagas promocionais das turmas da Black Friday foram preenchidas. As turmas regulares continuam abertas abaixo.
          </p>
          <Link
            href="/mentorias"
            className="btn-q h-14 self-start rounded-[14px] bg-[linear-gradient(180deg,#FF7A2E,#E5530A)] px-7 text-[19px] text-white shadow-[0_10px_26px_-8px_rgba(242,90,12,0.8)] hover:text-white"
          >
            Conhecer a Mentoria →
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-end justify-between gap-8">
            <h1 className="max-w-[640px] font-display text-[clamp(2.4rem,5vw,3.5rem)] font-extrabold leading-[1.02] tracking-[-0.04em] [text-wrap:balance]">
              Últimas vagas nas turmas <span className="bg-[linear-gradient(180deg,#FF7A2E,#FF6A1A)] bg-clip-text text-transparent">presenciais</span>
            </h1>
            <SeloDaContagem grande />
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-6">
            {cartoes.map((c) => (
              <Cartao key={c.id} c={c} aoEscolher={aoEscolher} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
