import Image from "next/image";
import Link from "next/link";
import type { Turma } from "@/lib/data";
import type { Banner } from "@/lib/conteudo";
import { brasaoDoConcurso } from "@/lib/brasoes";
import { institucional } from "@/lib/institucional";

// Primeira dobra da Home (proposta de 04/11/2026, no lugar do carrossel de banners): o aluno escolhe o concurso e cai
// nas turmas dele (/turmas?cargo=...). Os banners continuam, como cartões fixos em "Agora no Quad", junto com a
// próxima turma de matrícula aberta.

// `cor`: o fundo do ponteiro (a seta), tirado da cor principal do brasão; `seta`: a cor da seta sobre ele.
const CONCURSOS = [
  { id: "sd-pmba", titulo: "Soldado PMBA", cor: "#D5DBE4", seta: "#0B1C33" }, // prata
  { id: "cfo-pmba", titulo: "CFO PMBA", cor: "#1F5FD0", seta: "#FFFFFF" }, // azul
  { id: "cfs-pmba", titulo: "Sargento PMBA", cor: "#B8862B", seta: "#FFFFFF" }, // bronze dourado
  { id: "sd-bmba", titulo: "Soldado BMBA", cor: "#C8202E", seta: "#FFFFFF" }, // vermelho
  { id: "ipc-pcba", titulo: "Investigador PCBA", cor: "#E6B93C", seta: "#0B1C33" }, // dourado
];

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

function Seta({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Destaque = { chave: string; rotulo: string; titulo: string; descricao?: string; href: string; cor: string };

// A turma aberta que começa primeiro (sem data, vai para o fim).
function proximaTurmaAberta(turmas: Turma[] | null): Turma | null {
  const abertas = (turmas ?? []).filter((t) => t.status === "aberta");
  abertas.sort((a, b) => (a.dataDeInicio ?? "9999").localeCompare(b.dataDeInicio ?? "9999"));
  return abertas[0] ?? null;
}

function destaques(banners: Banner[], turmas: Turma[] | null): Destaque[] {
  const lista: Destaque[] = [];
  const turma = proximaTurmaAberta(turmas);
  if (turma) {
    lista.push({
      chave: `turma-${turma.slug}`,
      rotulo: "Matrículas abertas",
      titulo: turma.nome,
      descricao: [turma.concurso, turma.inicio && `início em ${turma.inicio}`].filter(Boolean).join(" · ") || undefined,
      href: `/turmas/${turma.slug}`,
      cor: "#2F86FF",
    });
  }
  // O banner institucional virou a própria primeira dobra; os outros viram cartões.
  for (const b of banners.filter((b) => b.tipo !== "danilo")) {
    lista.push({
      chave: b.id,
      rotulo: "Destaque",
      titulo: b.titulo ?? b.nome,
      descricao: b.descricao,
      href: b.botao.link,
      cor: b.botao.cor ?? "#2F86FF",
    });
  }
  return lista.slice(0, 3);
}

export default function PrimeiroContato({ banners, turmas }: { banners: Banner[]; turmas: Turma[] | null }) {
  const cartoes = destaques(banners, turmas);
  const provas = [
    institucional.totalDeAprovados > 0 ? `+${institucional.totalDeAprovados} aprovados` : null,
    "Turmas presenciais em Feira de Santana",
    "Simulados",
    "Materiais de estudo",
    "Mentorias",
  ].filter(Boolean) as string[];

  return (
    <section aria-labelledby="titulo-da-home" className="relative overflow-hidden bg-marinho-950 text-white">
      {/* Fundo: brilhos azuis e a grade fina, como no restante do site. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_60%_at_82%_18%,rgba(0,107,255,0.38),transparent_70%),radial-gradient(35%_50%_at_8%_70%,rgba(20,74,255,0.14),transparent_70%),radial-gradient(70%_40%_at_50%_115%,rgba(0,107,255,0.28),transparent_70%),linear-gradient(180deg,#071426_0%,#081830_100%)]" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:64px_64px]"
        style={{ maskImage: "radial-gradient(60% 70% at 75% 30%, #000 0%, transparent 75%)", WebkitMaskImage: "radial-gradient(60% 70% at 75% 30%, #000 0%, transparent 75%)" }}
      />
      {/* Anéis de luz com a marca do Quad, só no computador, presos à direita do contêiner (não da tela). */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden min-[1100px]:block">
      <div className="conteiner relative h-full">
      <div className="absolute right-[-2%] top-[60px] aspect-square w-[min(36vw,500px)]">
        <div className="absolute inset-[14%] rounded-full bg-[radial-gradient(closest-side,rgba(170,210,255,0.22),rgba(47,134,255,0.12)_55%,transparent_100%)]" />
        <div className="absolute inset-[6%] rounded-full border border-[rgba(140,190,255,0.22)] shadow-[0_0_48px_rgba(0,107,255,0.25),inset_0_0_48px_rgba(0,107,255,0.14)]" />
        <div className="absolute inset-[-12%] rounded-full border border-[rgba(111,174,255,0.07)]" />
        <Image
          src="/images/quad-logo-branco.png"
          alt=""
          width={868}
          height={324}
          priority
          sizes="300px"
          className="absolute left-1/2 top-1/2 w-[52%] -translate-x-1/2 -translate-y-1/2 opacity-90 [filter:drop-shadow(0_0_18px_rgba(47,134,255,0.45))]"
        />
      </div>
      </div>
      </div>

      <div className="conteiner relative pb-[clamp(40px,5vw,64px)] pt-[clamp(28px,4vw,56px)]">
        <div className="max-w-[720px]">
          <h1 id="titulo-da-home" className="font-display text-[clamp(2.3rem,4.4vw,4.2rem)] font-extrabold leading-[1.02] tracking-[-0.04em] [text-wrap:balance]">
            Sua aprovação começa com a{" "}
            <em className="bg-[linear-gradient(100deg,#7DB8FF_0%,#2F86FF_45%,#1F5BFF_100%)] bg-clip-text not-italic text-transparent [filter:drop-shadow(0_6px_24px_rgba(0,107,255,0.35))]">
              preparação certa
            </em>
          </h1>
          <p className="mt-5 max-w-[520px] text-[clamp(16px,1.5vw,18.5px)] leading-[1.6] text-[#B4C1D3] [text-wrap:pretty]">
            Escolha o seu concurso e veja as turmas do Quad para ele.
          </p>
        </div>

        {/* Escolha do concurso */}
        <ul aria-label="Escolha o seu concurso" className="mt-[clamp(32px,4vw,48px)] grid grid-cols-2 gap-3 sm:grid-cols-3 min-[1100px]:max-w-[calc(100%-min(30vw,420px))] min-[1100px]:grid-cols-3 min-[1400px]:max-w-none min-[1400px]:grid-cols-6">
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

        {/* Faixa de provas */}
        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[13.5px] text-prata-clara">
          {provas.map((p) => (
            <li key={p} className="flex items-center gap-2">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-azul-vivo" />
              {p}
            </li>
          ))}
        </ul>

        {/* Agora no Quad: os banners de antes, como cartões fixos. */}
        {cartoes.length > 0 && (
          <div className="mt-[clamp(32px,4vw,48px)] border-t border-white/[0.08] pt-6">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-azul-ceu">Agora no Quad</h2>
            <ul className="-mx-[clamp(20px,4vw,56px)] flex snap-x snap-mandatory scroll-px-[clamp(20px,4vw,56px)] gap-3 overflow-x-auto px-[clamp(20px,4vw,56px)] pb-1 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
              {cartoes.map((d) => (
                <li key={d.chave} className="w-[82%] flex-none snap-start md:w-auto">
                  <Link
                    href={d.href}
                    style={{ "--cor": d.cor } as React.CSSProperties}
                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-[rgba(11,28,51,0.8)] p-5 text-white transition-[border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-[var(--cor)] hover:text-white"
                  >
                    <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-[var(--cor)]" />
                    <span className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-prata">{d.rotulo}</span>
                    <span className="mt-2 font-display text-lg font-extrabold leading-tight tracking-[-0.01em]">{d.titulo}</span>
                    {d.descricao && <span className="mt-1.5 text-[14px] leading-[1.5] text-[#B4C1D3]">{d.descricao}</span>}
                    <span className="mt-auto flex items-center gap-2 pt-4 text-[14px] font-semibold text-azul-ceu group-hover:text-white">
                      Saiba mais <Seta />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
