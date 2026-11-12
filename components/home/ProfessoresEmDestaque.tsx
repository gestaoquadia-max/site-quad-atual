"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import type { Professor } from "@/lib/data";
import Reveal from "@/components/Reveal";
import { BLACK_FRIDAY } from "@/lib/black-friday";

// Professores na Home, na entrega "concursos-professores" da designer (12/11/2026): faixa horizontal com rolagem (setas
// no computador, arrastar no celular). Cada cartão: fundo com brilho, a foto recortada (sem fundo) por cima e a faixa
// escura com matéria, nome e o botão de perfil. Nome, matéria e página vêm da API; sem minibio (fica na página dele).

// Fotos já tratadas pela designer (fundo removido, 750 × 1000, encostadas na base), pelo slug da API. Quem não está aqui
// usa a foto do cadastro.
const FOTOS = "/images/home/professores";
const FOTO_TRATADA: Record<string, string> = {
  "marcello-reuter-e-esquivel": `${FOTOS}/marcello-esquivel.webp`,
  "elielmo-barbosa-miranda": `${FOTOS}/minho-show.webp`,
  "moab-kigran-de-oliveira-araujo": `${FOTOS}/moab-kigran.webp`,
  "wilson-gabriel-souza-santos": `${FOTOS}/wilson.webp`,
  "roberto-fabian-santos-de-araujo": `${FOTOS}/fabian.webp`,
};

// Quanto cada seta anda (a largura de um cartão e o espaço entre eles).
const PASSO = 320;

// Cores da entrega: o tema da Black Friday e, fora dele, a troca indicada pela designer (laranja → azul).
const CORES = BLACK_FRIDAY.site
  ? {
      rotulo: "text-[#FF9A5C]",
      setaCheia: "bg-[#F25A0C] hover:bg-[#FF7A2E]",
      fundo: "bg-[radial-gradient(90%_70%_at_50%_15%,#FF8A3D_0%,#E5530A_30%,#7A2A06_62%,#1A110C_100%)]",
      brilhoDaFoto: "[filter:drop-shadow(0_-2px_14px_rgba(255,122,46,0.45))_drop-shadow(0_18px_24px_rgba(0,0,0,0.5))]",
      linha: "border-[#F25A0C]",
      botao: "border-[#FF7A2E] text-[#FF9A5C] group-hover:bg-[#F25A0C] group-hover:border-[#F25A0C] group-hover:text-white",
    }
  : {
      rotulo: "text-[#60A5FA]",
      setaCheia: "bg-[#1D8BFF] hover:bg-[#2B7BFF]",
      fundo: "bg-[radial-gradient(90%_70%_at_50%_15%,#60A5FA_0%,#2B7BFF_30%,#0B3A80_62%,#0A1220_100%)]",
      brilhoDaFoto: "[filter:drop-shadow(0_-2px_14px_rgba(96,165,250,0.45))_drop-shadow(0_18px_24px_rgba(0,0,0,0.5))]",
      linha: "border-[#1D8BFF]",
      botao: "border-[#60A5FA] text-[#60A5FA] group-hover:bg-[#1D8BFF] group-hover:border-[#1D8BFF] group-hover:text-white",
    };

function CartaoDoProfessor({ professor }: { professor: Professor }) {
  const foto = FOTO_TRATADA[professor.slug] ?? professor.fotoUrl;
  return (
    <Link
      href={`/professores/${professor.slug}`}
      aria-label={`${professor.nome}${professor.materia ? `, ${professor.materia}` : ""}: ver perfil`}
      className="group relative h-[430px] w-[78vw] flex-none snap-start text-white hover:text-white sm:w-[300px]"
    >
      {/* Fundo com brilho e listras finas, na altura toda do cartão: a foto fica dentro dele (12/11/2026, pedido do usuário). */}
      <div aria-hidden="true" className={`absolute inset-0 overflow-hidden rounded-[20px] ${CORES.fundo}`}>
        <div className="absolute inset-0 [background:repeating-linear-gradient(90deg,rgba(255,255,255,0.05)_0_1px,transparent_1px_28px)]" />
      </div>
      {foto && (
        <div className="absolute inset-x-0 bottom-[112px] top-5">
          <Image
            src={foto}
            alt=""
            fill
            unoptimized={!FOTO_TRATADA[professor.slug]}
            sizes="300px"
            className={`object-contain object-bottom transition-transform duration-300 group-hover:scale-[1.03] ${CORES.brilhoDaFoto}`}
          />
        </div>
      )}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-[112px] z-[1] h-[70px] bg-[linear-gradient(0deg,rgba(23,18,15,0.85),transparent)]" />
      <div className={`absolute inset-x-0 bottom-0 z-[2] flex h-[112px] items-center justify-between gap-2.5 rounded-b-[20px] border-t-2 bg-[#17120F] px-[22px] py-[18px] ${CORES.linha}`}>
        <div className="min-w-0">
          {professor.materia && (
            <small className={`block truncate text-[12px] font-extrabold uppercase tracking-[0.16em] ${CORES.rotulo}`}>{professor.materia}</small>
          )}
          <strong className="mt-1 block font-display text-[21px] font-extrabold leading-[1.15]">{professor.nome}</strong>
        </div>
        <span
          aria-hidden="true"
          className={`flex size-[42px] flex-none items-center justify-center rounded-full border transition-colors duration-200 ${CORES.botao}`}
        >
          →
        </span>
      </div>
    </Link>
  );
}

export default function ProfessoresEmDestaque({ professores }: { professores: Professor[] }) {
  const faixa = useRef<HTMLDivElement>(null);
  const andar = (direcao: 1 | -1) => faixa.current?.scrollBy({ left: direcao * PASSO, behavior: "smooth" });
  const seta = "grid size-12 place-items-center rounded-full text-lg text-white transition-colors";

  return (
    // Entre duas ondas (components/home/Onda.tsx): o fundo começa e termina na cor delas.
    <section id="professores" className="relative overflow-hidden bg-[image:linear-gradient(180deg,#151A24_0%,#0B1A36_18%,#081530_82%,#151A24_100%)] py-[clamp(40px,5vw,64px)] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_60%_60%,rgba(37,99,235,0.3),transparent_70%)]" />
      <div className="conteiner relative">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <small className={`text-[13px] font-extrabold tracking-[0.2em] ${CORES.rotulo}`}>CORPO DOCENTE</small>
            <h2 className="mt-2.5 font-display text-[clamp(2rem,3.6vw,3rem)] font-extrabold tracking-[-0.035em]">Conheça nossos professores</h2>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/professores" className={`inline-flex min-h-[44px] items-center font-display text-[15px] font-bold hover:text-white ${CORES.rotulo}`}>
              Ver todos os professores →
            </Link>
            <div className="hidden items-center gap-4 sm:flex">
              <button type="button" onClick={() => andar(-1)} aria-label="Professores anteriores" className={`${seta} border border-white/25 hover:border-white/60`}>
                <span aria-hidden="true">←</span>
              </button>
              <button type="button" onClick={() => andar(1)} aria-label="Próximos professores" className={`${seta} ${CORES.setaCheia}`}>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </Reveal>

        <div ref={faixa} className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 pt-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {professores.map((p) => (
            <CartaoDoProfessor key={p.slug} professor={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
