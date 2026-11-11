import Image from "next/image";
import { Check } from "./PartesDaBlackFriday";

// "O que entra na Black Friday" da página de Materiais (modelo da campanha): os materiais digitais, com as capas em
// pé como livros, e o Combo de Simulados, com os cadernos em leque. Imagens em public/images/black-friday/.

const MATERIAIS = [
  { t: "Vade Mecum", d: "Lei seca do edital com BIZU, ATENÇÃO NA PROVA, PEGADINHA FREQUENTE e RAIO-X." },
  { t: "Módulos teóricos", d: "Soldado PMBA, CFO PMBA, Soldado PMPE, Soldado PMAL e Soldado CBMBA." },
];

const COMBO = [{ t: "Simulados 01 a 05" }, { t: "Prova objetiva e dissertativa no mesmo caderno" }, { t: "Gabarito comentado" }];

const CONCURSOS_DO_COMBO = [
  ["Soldado PMBA", "CFO PMBA", "PMPE"],
  ["PMAL", "PCPE", "Soldado BM", "CFO BM"],
];

// Capas em pé, inclinadas, da menor (atrás) para a maior (na frente).
const LIVROS = [
  { src: "modulo-sd-pmpe", alt: "Módulo Soldado PMPE", largura: "w-[31%]", subida: "translate-y-[4%]", junto: true },
  { src: "modulo-sd-cbmba", alt: "Módulo Soldado CBMBA", largura: "w-[33%]", subida: "translate-y-[1%]", junto: true },
  { src: "modulo-cfo-pmba", alt: "Módulo CFO PMBA", largura: "w-[33%]", subida: "-translate-y-[1%]", junto: true },
  { src: "vade-mecum-sd-pmba", alt: "Vade Mecum Soldado PMBA", largura: "w-[39%]", subida: "", junto: false },
];

// Cadernos de simulado em leque (posição e giro de cada um).
const CADERNOS = [
  { src: "simulado-pmpe", alt: "Simulado PMPE", lugar: "left-0 top-[14%] -rotate-12 z-[1]" },
  { src: "simulado-pmal", alt: "Simulado PMAL", lugar: "left-[15%] top-[6%] -rotate-6 z-[2]" },
  { src: "simulado-cbmba", alt: "Simulado CBMBA", lugar: "right-0 top-[14%] rotate-12 z-[1]" },
  { src: "simulado-cfo-pmba", alt: "Simulado CFO PMBA", lugar: "right-[15%] top-[6%] rotate-6 z-[2]" },
  { src: "simulado-pmba", alt: "Simulado PMBA", lugar: "left-[30%] top-[2%] z-[3]" },
];

function Lista({ itens, escura }: { itens: { t: string; d?: string }[]; escura: boolean }) {
  const linha = escura ? "border-white/[0.12]" : "border-[#F0E8E2]";
  return (
    <ul className={`flex flex-col border-t ${linha}`}>
      {itens.map((m) => (
        <li key={m.t} className={`flex gap-3 border-b py-3.5 ${linha}`}>
          <span className="mt-0.5">
            <Check />
          </span>
          <span className="flex flex-col gap-[3px]">
            <b className="text-[16.5px] font-semibold">{m.t}</b>
            {m.d && <span className={`text-[14.5px] leading-[1.45] ${escura ? "text-[#B5AAA2]" : "text-[#6B5F57]"}`}>{m.d}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function OfertasDosMateriais() {
  return (
    <section id="materiais" className="scroll-mt-28 bg-[#F6F2EF] py-[clamp(72px,8vw,120px)] text-breu-800">
      <div className="conteiner flex flex-col gap-[clamp(18px,2vw,28px)]">
        <h2 className="mb-[clamp(10px,1.4vw,18px)] font-display text-[clamp(2rem,3.6vw,3rem)] font-extrabold tracking-[-0.035em] [text-wrap:balance]">
          O que entra na Black Friday
        </h2>

        {/* Materiais digitais: o texto à esquerda e as capas em pé à direita. */}
        <article className="relative flex flex-wrap items-center gap-[clamp(32px,4vw,64px)] overflow-hidden rounded-3xl bg-[radial-gradient(70%_90%_at_78%_50%,#3A1D0E_0%,#17120F_62%)] p-[clamp(28px,4vw,64px)] text-white">
          <div className="flex min-w-0 flex-[1_1_340px] flex-col gap-5">
            <p className="font-display text-[13px] font-extrabold uppercase tracking-[0.18em] text-laranja-claro">Materiais digitais</p>
            <h3 className="font-display text-[clamp(1.9rem,3.2vw,3rem)] font-extrabold leading-none tracking-[-0.045em]">
              a partir de <span className="whitespace-nowrap text-[#FF6A1A]">R$ 29,90</span>
            </h3>
            <Lista itens={MATERIAIS} escura />
          </div>
          <div className="flex min-w-0 flex-[1.6_1_min(100%,560px)] items-end justify-center px-4 pb-6 pt-3">
            {LIVROS.map((l, i) => (
              <div
                key={l.src}
                style={{ zIndex: i + 1 }}
                className={`relative flex-none aspect-[707/1000] [transform:perspective(1600px)_rotateY(-20deg)] ${l.largura} ${l.junto ? "-mr-[12%]" : ""}`}
              >
                <div className={`relative h-full w-full ${l.subida}`}>
                  {/* Miolo das páginas, aparecendo na borda direita. */}
                  <span
                    aria-hidden="true"
                    className="absolute -right-2.5 bottom-[1.6%] top-[1.6%] w-[11px] rounded-r-[3px] bg-[repeating-linear-gradient(180deg,#F4F0EA_0_2px,#D6CFC7_2px_3px)] shadow-[inset_3px_0_4px_rgba(0,0,0,0.35)]"
                  />
                  <Image
                    src={`/images/black-friday/${l.src}.webp`}
                    alt={l.alt}
                    fill
                    sizes="(min-width: 1024px) 260px, 30vw"
                    className="rounded-[2px_5px_5px_2px] object-cover shadow-[24px_34px_44px_-18px_rgba(0,0,0,0.85),0_0_0_1px_rgba(0,0,0,0.25)]"
                  />
                  {/* Lombada e brilho da capa. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-[2px_5px_5px_2px] bg-[image:linear-gradient(90deg,rgba(0,0,0,0.5)_0%,rgba(255,255,255,0.22)_2.2%,rgba(0,0,0,0.18)_4.5%,transparent_8%),linear-gradient(115deg,rgba(255,255,255,0.18)_0%,transparent_38%)]"
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Combo de Simulados: os cadernos em leque à esquerda (embaixo, no celular) e o texto à direita. */}
        <article className="relative flex flex-wrap-reverse items-center gap-[clamp(32px,4vw,64px)] overflow-hidden rounded-3xl border border-[#EAE1DA] bg-white p-[clamp(28px,4vw,64px)]">
          <div className="relative aspect-[1.45/1] min-w-0 flex-[1.6_1_min(100%,560px)]">
            {CADERNOS.map((c) => (
              <div key={c.src} className={`absolute aspect-[707/1000] w-[40%] ${c.lugar}`}>
                {/* Folhas de baixo do caderno. */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 translate-x-[7px] translate-y-[6px] rotate-[1.6deg] rounded-[2px] bg-[#E9E4DE] shadow-[0_1px_2px_rgba(0,0,0,0.18)]"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 translate-x-1 translate-y-[3px] rotate-[0.8deg] rounded-[2px] bg-[#F3EFEA] shadow-[0_1px_2px_rgba(0,0,0,0.18)]"
                />
                <Image
                  src={`/images/black-friday/${c.src}.webp`}
                  alt={c.alt}
                  fill
                  sizes="(min-width: 1024px) 300px, 40vw"
                  className="rounded-[2px] object-cover shadow-[0_26px_40px_-18px_rgba(23,18,15,0.55),0_0_0_1px_rgba(23,18,15,0.08)]"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.35)_0%,transparent_30%,transparent_70%,rgba(0,0,0,0.06)_100%)]"
                />
              </div>
            ))}
          </div>
          <div className="flex min-w-0 flex-[1_1_340px] flex-col gap-5">
            <p className="font-display text-[13px] font-extrabold uppercase tracking-[0.18em] text-laranja-escuro">Combo de Simulados</p>
            <h3 className="font-display text-[clamp(1.9rem,3.2vw,3rem)] font-extrabold leading-none tracking-[-0.045em]">
              por <span className="whitespace-nowrap text-[#E5530A]">R$ 19,00</span>
            </h3>
            <Lista itens={COMBO} escura={false} />
            <div className="flex flex-col gap-2">
              {CONCURSOS_DO_COMBO.map((linha, i) => (
                <ul key={i} className="flex flex-wrap gap-2" aria-label={i === 0 ? "Concursos do combo" : undefined}>
                  {linha.map((k) => (
                    <li
                      key={k}
                      className="rounded-full border border-[#EAE1DA] bg-[#F6F2EF] px-3 py-[7px] text-[13px] font-bold uppercase tracking-[0.04em] text-[#4E443E]"
                    >
                      {k}
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
