import Image from "next/image";
import Link from "next/link";
import type { Turma } from "@/lib/data";
import { BLACK_FRIDAY } from "@/lib/black-friday";

// Primeira dobra da Home, no topo novo da designer (home v2, 11/11/2026): "Conquiste a sua aprovação" com a imagem das
// forças à direita (que some nas bordas pela máscara, sem faixa de cor), os dois caminhos (turmas e mentorias), a faixa
// "Escolha o seu concurso e comece agora" com os concursos (e as insígnias deles) e a barra da próxima turma aberta.
// Duas versões: o azul de sempre e a da Black Friday (BLACK_FRIDAY.site, lib/black-friday.ts), com a imagem e as cores
// de cada uma. Sem a pílula "Destaque" do banner acima do título (tirada em 11/11/2026, pedido do usuário).

// As insígnias da faixa (entrega "concursos-professores" da designer, 12/11/2026): PNG transparentes de 320 × 320.
const INSIGNIAS = "/images/home/insignias";
const CONCURSOS = [
  { id: "sd-pmba", titulo: "Soldado PMBA", insignia: `${INSIGNIAS}/sd-pmba.png` },
  { id: "cfo-pmba", titulo: "CFO PMBA", insignia: `${INSIGNIAS}/cfo-pmba.png` },
  { id: "cfs-pmba", titulo: "Sargento PMBA", insignia: `${INSIGNIAS}/sgt-pmba.png` },
  { id: "sd-bmba", titulo: "Soldado BMBA", insignia: `${INSIGNIAS}/sd-bmba.png` },
  { id: "ipc-pcba", titulo: "Investigador PCBA", insignia: `${INSIGNIAS}/pcba.png` },
];

// As cores de cada versão (tabela da designer). Valores escritos por extenso, fora das classes que app/tema-black.css
// troca, para cada versão sair exatamente como no modelo.
const CORES = BLACK_FRIDAY.site
  ? {
      imagem: "/images/home/hero-forcas-black.png",
      fundo: "bg-[linear-gradient(180deg,#1A0F0A_0%,#120F0D_100%)]",
      brilho: "bg-[radial-gradient(45%_60%_at_80%_35%,rgba(242,90,12,0.30),transparent_70%)]",
      destaque: "bg-[linear-gradient(100deg,#FFB27A_0%,#F25A0C_100%)]",
      textoDestaque: "text-[#F25A0C]",
      botao: "bg-[#F25A0C] hover:bg-[#FF7A2E] shadow-[0_18px_40px_-16px_rgba(242,90,12,0.9)]",
      faixa: "bg-[#1C1714] text-[#F3EEEA] border border-white/[0.06]",
      indeciso: "border-[#FF8A3D] text-[#FF9A5C] hover:border-[#F25A0C] hover:text-[#FFB27A]",
      barra: "bg-[linear-gradient(90deg,#1C1714,#2A1A10)] text-white border border-white/[0.06]",
      rotuloDaBarra: "text-[#FF9A5C]",
      dia: "text-[#FF7A2E]",
    }
  : {
      imagem: "/images/home/hero-forcas.png",
      fundo: "bg-[linear-gradient(180deg,#0B1A36_0%,#081530_100%)]",
      brilho: "bg-[radial-gradient(45%_60%_at_80%_35%,rgba(43,123,255,0.30),transparent_70%)]",
      destaque: "bg-[linear-gradient(100deg,#7CC4FF_0%,#2B7BFF_100%)]",
      textoDestaque: "text-[#0B63F6]",
      botao: "bg-[#0B63F6] hover:bg-[#2B7BFF] shadow-[0_18px_40px_-16px_rgba(11,99,246,0.9)]",
      faixa: "bg-[#F4F7FC] text-[#0F172A]",
      indeciso: "border-[#60A5FA] text-[#2B7BFF] hover:border-[#0B63F6] hover:text-[#0B63F6]",
      barra: "bg-[linear-gradient(90deg,#0B1A36,#0E2A5C)] text-white",
      rotuloDaBarra: "text-[#7CC4FF]",
      dia: "text-[#5AA2FF]",
    };

function Seta({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// A turma aberta que começa primeiro (sem data, vai para o fim).
function proximaTurmaAberta(turmas: Turma[] | null): Turma | null {
  const abertas = (turmas ?? []).filter((t) => t.status === "aberta");
  abertas.sort((a, b) => (a.dataDeInicio ?? "9999").localeCompare(b.dataDeInicio ?? "9999"));
  return abertas[0] ?? null;
}

// Um concurso na faixa: só a insígnia, sem texto (o nome fica no texto alternativo). Encolhe em telas menores, sem
// quebrar a linha (até 140 px cada).
function InsigniaDoConcurso({ href, titulo, insignia }: { href: string; titulo: string; insignia: string }) {
  return (
    <li className="flex min-w-0 flex-[0_1_140px] justify-center">
      <Link href={href} title={titulo} className="block w-full max-w-[140px] transition-transform duration-200 hover:-translate-y-1">
        <Image
          src={insignia}
          alt={titulo}
          width={320}
          height={320}
          sizes="140px"
          className="aspect-square w-full object-contain [filter:drop-shadow(0_8px_16px_rgba(0,0,0,0.5))]"
        />
      </Link>
    </li>
  );
}

// Barra da próxima turma aberta: nome (o dia em destaque), início, turno, concurso, preço e o botão.
function BarraDaTurma({ turma }: { turma: Turma }) {
  const [, nome, dia] = turma.nome.match(/^(.*?)\s*(\d{1,2}\/\d{1,2})$/) ?? [null, turma.nome, null];
  const dados = [
    turma.inicio && { rotulo: "Início", valor: turma.inicio },
    turma.turno && { rotulo: "Turno", valor: turma.turno },
    turma.concurso && { rotulo: "Concurso", valor: turma.concurso },
  ].filter(Boolean) as { rotulo: string; valor: string }[];
  return (
    <div className={`mt-4 flex flex-wrap items-center gap-x-8 gap-y-4 rounded-[16px] px-[clamp(20px,2.4vw,28px)] py-5 ${CORES.barra}`}>
      <div className="min-w-0">
        <p className={`text-xs font-extrabold uppercase tracking-[0.16em] ${CORES.rotuloDaBarra}`}>Turma presencial</p>
        <p className="font-display text-[clamp(1.6rem,2.4vw,2rem)] font-extrabold leading-tight tracking-[-0.02em]">
          {nome} {dia && <span className={CORES.dia}>{dia}</span>}
        </p>
      </div>
      {dados.length > 0 && (
        <dl className="flex flex-wrap gap-x-7 gap-y-2">
          {dados.map((d) => (
            <div key={d.rotulo}>
              <dt className="text-[13px] text-white/75">{d.rotulo}</dt>
              <dd className="font-display text-[17px] font-bold">{d.valor}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className="ml-auto flex flex-wrap items-center gap-x-7 gap-y-3">
        <span className="flex flex-col sm:items-end">
          {turma.precoCheio && (
            <span className="text-[13px] text-white/70">
              De <s>{turma.precoCheio}</s> por
            </span>
          )}
          <b className="font-display text-[clamp(1.5rem,2.2vw,1.9rem)] font-extrabold">{turma.preco}</b>
        </span>
        <Link href={`/turmas/${turma.slug}`} className={`btn-q h-[54px] rounded-full px-6 text-[15.5px] text-white hover:text-white ${CORES.botao}`}>
          Garantir minha vaga <Seta />
        </Link>
      </div>
    </div>
  );
}

export default function PrimeiroContato({ turmas }: { turmas: Turma[] | null }) {
  const turma = proximaTurmaAberta(turmas);

  return (
    <section aria-labelledby="titulo-da-home" className={`relative overflow-hidden text-white ${CORES.fundo}`}>
      <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${CORES.brilho}`} />
      {/* A imagem das forças: no computador, à direita, atrás do texto; as bordas somem pela máscara. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-[120px] hidden aspect-[1672/941] w-[min(64%,1040px)] lg:block"
        style={{
          maskImage: "linear-gradient(90deg,transparent 0%,#000 30%), linear-gradient(180deg,transparent 0%,#000 16%,#000 70%,transparent 100%)",
          WebkitMaskImage: "linear-gradient(90deg,transparent 0%,#000 30%), linear-gradient(180deg,transparent 0%,#000 16%,#000 70%,transparent 100%)",
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      >
        <Image src={CORES.imagem} alt="" fill priority sizes="(min-width: 1024px) 64vw, 0px" className="object-cover" />
      </div>

      <div className="conteiner relative pb-[clamp(40px,5vw,72px)] pt-[clamp(24px,4vw,72px)]">
        <div className="max-w-[600px] lg:min-h-[clamp(380px,32vw,470px)]">
          <h1 id="titulo-da-home" className="font-display font-extrabold tracking-[-0.045em]">
            <span className="block text-[clamp(2.6rem,5vw,4.2rem)] leading-[1.02]">Conquiste a sua</span>
            <span
              className={`block bg-clip-text pb-2 pr-3 text-[clamp(3.6rem,7vw,6.25rem)] italic leading-[1] text-transparent ${CORES.destaque}`}
            >
              Aprovação
            </span>
          </h1>
          <p className="mt-5 max-w-[540px] text-[clamp(16px,1.5vw,20px)] leading-[1.55] text-white/85 [text-wrap:pretty]">
            Turmas, mentorias e materiais para você evoluir com método, disciplina e foco no seu edital.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/turmas" className={`btn-q h-14 rounded-[10px] px-6 text-base text-white hover:-translate-y-0.5 hover:text-white ${CORES.botao}`}>
              Ver turmas disponíveis <Seta />
            </Link>
            <Link href="/mentorias" className="btn-q h-14 rounded-[10px] border border-white/40 px-6 text-base text-white hover:border-white hover:bg-white/[0.06] hover:text-white">
              Ver mentorias do Quad <Seta />
            </Link>
          </div>
        </div>

        {/* No celular, a imagem entre os botões e a faixa de concursos. */}
        <div
          aria-hidden="true"
          className="relative -mx-[clamp(20px,4vw,56px)] mt-6 aspect-[1672/941] lg:hidden"
          style={{
            maskImage: "linear-gradient(180deg,transparent 0%,#000 18%,#000 72%,transparent 100%)",
            WebkitMaskImage: "linear-gradient(180deg,transparent 0%,#000 18%,#000 72%,transparent 100%)",
          }}
        >
          <Image src={CORES.imagem} alt="" fill sizes="100vw" className="object-cover" />
        </div>

        {/* Escolha do concurso: o aluno cai nas turmas dele (/turmas?cargo=...). */}
        <div className={`relative mt-[clamp(8px,2vw,32px)] grid items-center gap-5 rounded-[22px] p-[clamp(18px,2vw,22px)] md:grid-cols-[230px_minmax(0,1fr)] md:gap-[22px] md:px-7 ${CORES.faixa}`}>
          <p className="font-display text-[clamp(1.4rem,2vw,1.625rem)] font-extrabold leading-[1.1] tracking-[-0.03em]">
            Escolha o seu concurso e <span className={CORES.textoDestaque}>comece agora</span>
          </p>
          {/* Sempre numa linha só (entrega da designer de 12/11/2026). */}
          <ul aria-label="Escolha o seu concurso" className="flex min-w-0 flex-nowrap items-center justify-center gap-1.5">
            {CONCURSOS.map((c) => (
              <InsigniaDoConcurso key={c.id} href={`/turmas?cargo=${c.id}`} titulo={c.titulo} insignia={c.insignia} />
            ))}
            <li className="flex min-w-0 flex-[0_1_140px] justify-center">
              <Link
                href="/turmas"
                className={`flex aspect-square w-full max-w-[140px] items-center justify-center overflow-hidden rounded-full border-2 border-dashed p-1.5 text-center font-display text-[clamp(10px,1.1vw,16px)] font-extrabold leading-[1.1] transition-[transform,color,border-color] duration-200 hover:-translate-y-1 ${CORES.indeciso}`}
              >
                Ainda não decidi
              </Link>
            </li>
          </ul>
        </div>

        {turma && <BarraDaTurma turma={turma} />}
      </div>
    </section>
  );
}
