import Image from "next/image";
import Link from "next/link";
import type { Turma } from "@/lib/data";
import type { Banner } from "@/lib/conteudo";
import { brasaoDoConcurso } from "@/lib/brasoes";
import CabecalhoDaTurma from "./CabecalhoDaTurma";

// Primeira dobra da Home (no lugar do carrossel de banners, 04/11/2026): o aluno escolhe o concurso e cai nas turmas
// dele (/turmas?cargo=...). À direita, a próxima turma com matrícula aberta. Os banners continuam como a pílula de
// aviso acima do título: um por vez (o primeiro publicado depois do institucional), levando à página da campanha.

// `cor`: o fundo do ponteiro (a seta), tirado da cor principal do brasão; `seta`: a cor da seta sobre ele.
const CONCURSOS = [
  { id: "sd-pmba", titulo: "Soldado PMBA", cor: "#D5DBE4", seta: "#0B1C33" }, // prata
  { id: "cfo-pmba", titulo: "CFO PMBA", cor: "#1F5FD0", seta: "#FFFFFF" }, // azul
  { id: "cfs-pmba", titulo: "Sargento PMBA", cor: "#B8862B", seta: "#FFFFFF" }, // bronze dourado
  { id: "sd-bmba", titulo: "Soldado BMBA", cor: "#C8202E", seta: "#FFFFFF" }, // vermelho
  { id: "ipc-pcba", titulo: "Investigador PCBA", cor: "#E6B93C", seta: "#0B1C33" }, // dourado
];

function Seta({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// A seta do cartão num círculo da cor do concurso.
function Ponteiro({ cor, seta }: { cor: string; seta: string }) {
  return (
    <span
      aria-hidden="true"
      style={{ background: cor, color: seta }}
      className="grid h-8 w-8 flex-none place-items-center rounded-full shadow-[0_6px_16px_-6px_rgba(0,0,0,0.6)] transition-transform group-hover:translate-x-0.5"
    >
      <Seta />
    </span>
  );
}

// A turma aberta que começa primeiro (sem data, vai para o fim).
function proximaTurmaAberta(turmas: Turma[] | null): Turma | null {
  const abertas = (turmas ?? []).filter((t) => t.status === "aberta");
  abertas.sort((a, b) => (a.dataDeInicio ?? "9999").localeCompare(b.dataDeInicio ?? "9999"));
  return abertas[0] ?? null;
}

// Pílula de aviso acima do título: o banner da vez.
function Aviso({ banner }: { banner: Banner }) {
  const cor = banner.botao.cor ?? "#2F86FF";
  return (
    <Link
      href={banner.botao.link}
      className="group mb-6 inline-flex max-w-full items-center gap-2.5 rounded-full border border-white/[0.12] bg-white/[0.05] py-1.5 pl-1.5 pr-4 text-[13.5px] text-prata-clara backdrop-blur-[6px] transition-colors hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
    >
      <span style={{ background: cor }} className="flex-none rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-white">
        Destaque
      </span>
      <span className="truncate font-medium">{banner.titulo ?? banner.nome}</span>
      <Seta className="flex-none transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

// Cartão da próxima turma: insígnia, nome, concurso, início e turno, vagas e preço, e o botão para a página dela.
function ProximaTurma({ turma }: { turma: Turma }) {
  const total = turma.detalhe?.vagasTotal;
  const ocupadas = turma.detalhe?.vagasOcupadas ?? 0;
  const restantes = total != null ? Math.max(0, total - ocupadas) : null;
  const linhas = [
    turma.inicio && { rotulo: "Início", valor: turma.inicio },
    turma.turno && { rotulo: "Turno", valor: turma.turno },
    turma.concurso && { rotulo: "Concurso", valor: turma.concurso },
  ].filter(Boolean) as { rotulo: string; valor: string }[];

  return (
    <div className="relative">
      {/* Brilho atrás do cartão. */}
      <div aria-hidden="true" className="pointer-events-none absolute -inset-10 rounded-full bg-[radial-gradient(closest-side,rgba(0,107,255,0.35),transparent)]" />
      <div className="relative overflow-hidden rounded-[24px] border border-[rgba(111,174,255,0.22)] bg-[linear-gradient(160deg,rgba(20,48,90,0.92)_0%,rgba(10,26,48,0.94)_60%)] p-6 shadow-[0_40px_80px_-32px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[10px]">
        <div aria-hidden="true" className="absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,#4D9BFF,transparent)]" />
        <CabecalhoDaTurma nome={turma.nome} insignia={turma.insignia ?? null} />

        {linhas.length > 0 && (
          <dl className="mt-5 grid grid-cols-3 gap-3 border-y border-white/[0.08] py-4">
            {linhas.map((l) => (
              <div key={l.rotulo} className="min-w-0">
                <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-prata-escura">{l.rotulo}</dt>
                <dd className="mt-1 truncate font-display text-[15px] font-bold text-white">{l.valor}</dd>
              </div>
            ))}
          </dl>
        )}

        {restantes != null && total ? (
          <div className="mt-4">
            <span className="text-[13px] font-semibold text-white">{restantes === 1 ? "1 vaga restante" : `${restantes} vagas restantes`}</span>
            {/* Fiel às vagas: sem matrícula, a barra fica vazia (nunca um mínimo para "parecer cheia"). */}
            <div aria-hidden="true" className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-[linear-gradient(90deg,#2F86FF,#7DB8FF)]" style={{ width: `${Math.min(100, (ocupadas / total) * 100)}%` }} />
            </div>
          </div>
        ) : (
          <p className="mt-4 text-[13px] font-semibold text-white">{turma.statusLabel}</p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            {turma.precoCheio && <span className="block text-[12.5px] text-prata line-through">{turma.precoCheio}</span>}
            <span className="font-display text-[22px] font-extrabold tracking-[-0.02em]">{turma.preco}</span>
          </div>
          <Link href={`/turmas/${turma.slug}`} className="btn-q btn-q-azul h-12 rounded-full px-6 text-[15px] hover:-translate-y-px">
            Garantir minha vaga <Seta />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PrimeiroContato({ banners, turmas }: { banners: Banner[]; turmas: Turma[] | null }) {
  const aviso = banners.find((b) => b.tipo !== "danilo") ?? null;
  const turma = proximaTurmaAberta(turmas);

  return (
    <section aria-labelledby="titulo-da-home" className="relative overflow-hidden bg-marinho-950 text-white">
      {/* Fundo: brilhos azuis e a grade fina, como no restante do site. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_60%_at_82%_30%,rgba(0,107,255,0.34),transparent_70%),radial-gradient(35%_50%_at_8%_70%,rgba(20,74,255,0.14),transparent_70%),linear-gradient(180deg,#151A24_0%,#0B1A36_18%,#081530_82%,#151A24_100%)]" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:64px_64px]"
        style={{ maskImage: "radial-gradient(60% 70% at 75% 35%, #000 0%, transparent 75%)", WebkitMaskImage: "radial-gradient(60% 70% at 75% 35%, #000 0%, transparent 75%)" }}
      />

      <div
        className={`conteiner relative grid items-center gap-x-12 gap-y-10 pb-[clamp(48px,6vw,88px)] pt-[clamp(24px,3.5vw,48px)] ${
          turma ? "min-[1100px]:grid-cols-[minmax(0,1fr)_minmax(360px,420px)]" : ""
        }`}
      >
        <div className="min-w-0">
          {aviso && <Aviso banner={aviso} />}
          <h1 id="titulo-da-home" className="font-display text-[clamp(2.3rem,4.4vw,4.2rem)] font-extrabold leading-[1.02] tracking-[-0.04em] [text-wrap:balance]">
            Sua aprovação começa com a{" "}
            <em className="bg-[linear-gradient(100deg,#7DB8FF_0%,#2F86FF_45%,#1F5BFF_100%)] bg-clip-text not-italic text-transparent [filter:drop-shadow(0_6px_24px_rgba(0,107,255,0.35))]">
              preparação certa
            </em>
          </h1>
          <p className="mt-5 max-w-[520px] text-[clamp(16px,1.5vw,18.5px)] leading-[1.6] text-[#B4C1D3] [text-wrap:pretty]">
            Escolha o seu concurso e veja as turmas do Quad para ele.
          </p>

          {/* Escolha do concurso */}
          <ul aria-label="Escolha o seu concurso" className="mt-[clamp(28px,3.5vw,40px)] grid grid-cols-2 gap-3 sm:grid-cols-3">
            {CONCURSOS.map((c) => {
              const brasao = brasaoDoConcurso(c.id);
              return (
                <li key={c.id}>
                  <Link
                    href={`/turmas?cargo=${c.id}`}
                    style={{ "--cor": c.cor } as React.CSSProperties}
                    className="group flex h-full flex-col gap-3 rounded-2xl border border-white/[0.1] bg-[rgba(11,28,51,0.72)] p-4 text-white backdrop-blur-[6px] transition-[border-color,background-color,transform] duration-150 hover:-translate-y-0.5 hover:border-[var(--cor)] hover:bg-[rgba(16,38,65,0.9)] hover:text-white"
                  >
                    {/* Em cima, o brasão e a seta colorida; embaixo, o nome do cargo com a largura toda do cartão. */}
                    <span className="flex items-start justify-between gap-2">
                      {brasao ? <Image src={brasao} alt="" width={48} height={48} className="h-11 w-11 flex-none object-contain sm:h-12 sm:w-12" /> : <span />}
                      <Ponteiro cor={c.cor} seta={c.seta} />
                    </span>
                    <span className="font-display text-[15px] font-bold leading-tight sm:text-base">{c.titulo}</span>
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                href="/turmas"
                className="group flex h-full flex-col justify-between gap-3 rounded-2xl border border-dashed border-white/[0.18] p-4 text-white transition-colors hover:border-[rgba(111,174,255,0.5)] hover:text-white"
              >
                <span className="flex justify-end">
                  <Ponteiro cor="rgba(255,255,255,0.12)" seta="#FFFFFF" />
                </span>
                <span className="font-display text-[15px] font-bold leading-tight sm:text-base">Ainda não decidi</span>
              </Link>
            </li>
          </ul>
        </div>

        {turma && <ProximaTurma turma={turma} />}
      </div>
    </section>
  );
}
