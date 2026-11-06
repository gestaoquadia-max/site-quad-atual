import Trilha from "@/components/Trilha";
import PlanosDasMentorias from "@/components/mentorias/PlanosDasMentorias";
import { LINK_DAS_MENTORIAS } from "@/lib/conteudo";
import { metadadosDaPagina } from "@/lib/seo";

export const metadata = metadadosDaPagina({
  titulo: "Mentorias do Quad",
  descricao: "Estratégia, cronograma personalizado e análise de desempenho para uma preparação direcionada ao seu concurso.",
  caminho: "/mentorias",
});

// As mentorias são vendidas na Tutory: esta página explica a mentoria e, na escolha do concurso e do plano
// (PlanosDasMentorias), leva ao checkout certo. A landing própria (LINK_DAS_MENTORIAS) segue no "Saiba mais".

function SetaParaFora() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M5 11L11 5M6 5h5v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Textos da página das mentorias (LINK_DAS_MENTORIAS), em 31/10/2026: o ciclo de 6 etapas e o que está incluso.
const INCLUSO = [
  "Curso online gravado em estúdio",
  "Materiais teóricos em PDF",
  "Cronograma personalizado na Tutory",
  "Materiais exclusivos de redação",
  "Raio-X de acertos por tópico",
  "Peso dos assuntos na prova da sua banca",
  "Ajustes após a publicação do edital",
  "12 meses de acesso a contar da compra",
];

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-none text-[#E8A3AE]">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

const ETAPAS = [
  { titulo: "Entendemos sua rotina", texto: "Tempo de estudo, trabalho, fase da preparação e concurso escolhido." },
  { titulo: "Organizamos sua preparação", texto: "Cronograma na Tutory, priorizado pelo peso de cada assunto no edital." },
  { titulo: "Você executa", texto: "Aulas, PDFs e questões na sequência combinada." },
  { titulo: "Analisamos seu desempenho", texto: "Raio-X de acertos por tópico do edital e peso dos assuntos mais cobrados." },
  { titulo: "Ajustamos a estratégia", texto: "O que está sólido reduz frequência; o que trava ganha mais tempo, revisão e questões." },
  { titulo: "Você continua evoluindo", texto: "O ciclo recomeça com dados novos e com o edital atualizado." },
];

const BOTAO_VINHO =
  "inline-flex h-[58px] items-center gap-2.5 whitespace-nowrap rounded-[11px] bg-vinho px-[30px] font-display text-[16.5px] font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_18px_40px_-16px_rgba(196,42,68,0.9)] transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-vinho-forte hover:text-white active:translate-y-0";


export default function MentoriasPage() {
  return (
    <>
      {/* data-tema="vinho": o rodapé (que é o mesmo em todo o site) troca o marinho pelo vinho nesta página (app/globals.css). */}
      <section data-tema="vinho" className="relative overflow-hidden bg-[#1A060C] pb-[clamp(72px,8vw,128px)] pt-[clamp(28px,3vw,40px)] text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[image:radial-gradient(48%_70%_at_82%_30%,rgba(176,38,62,0.42),transparent_70%),radial-gradient(40%_60%_at_10%_100%,rgba(110,20,38,0.35),transparent_70%),linear-gradient(160deg,#3A0E1A_0%,#22080F_45%,#0E0306_100%)]"
        />
        <div className="conteiner relative">
          <Trilha itens={[{ rotulo: "Início", href: "/" }, { rotulo: "Mentorias do Quad" }]} className="mb-[clamp(32px,4vw,56px)] !text-[#B9B0C4] [&_a]:text-[#B9B0C4]" />

          {/* Abertura: o que é a mentoria e para onde seguir. */}
          <div className="grid items-end gap-[clamp(28px,5vw,88px)] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <div>
              <p className="mb-4 font-display text-[clamp(16px,1.4vw,19px)] font-bold text-[#E8A3AE]">Mentorias do Quad</p>
              <h1 className="font-display text-[clamp(2.6rem,5vw,4.4rem)] font-extrabold leading-[0.98] tracking-[-0.045em] [text-wrap:balance]">
                Você estuda.{" "}
                <span className="block bg-[linear-gradient(100deg,#FFB0BC_0%,#E0425C_50%,#A51E36_100%)] bg-clip-text text-transparent">O Quad direciona.</span>
              </h1>
            </div>
            <div className="flex flex-col items-start gap-6 pb-1">
              <p className="max-w-[540px] text-[clamp(16.5px,1.4vw,19px)] leading-[1.6] text-[#D9D1DC] [text-wrap:pretty]">
                Direção estratégica para quem quer entender <strong className="font-semibold text-white">o que estudar, como estudar e como está evoluindo</strong>. Cada
                mentoria é montada para um concurso específico, com curso, PDFs, cronograma, Raio-X de desempenho e ajuste depois do edital.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href={LINK_DAS_MENTORIAS} target="_blank" rel="noopener" className={BOTAO_VINHO}>
                  Saiba mais sobre a mentoria
                  <SetaParaFora />
                  <span className="sr-only">(abre em nova aba)</span>
                </a>
                <a
                  href="#planos"
                  className="inline-flex h-[58px] items-center whitespace-nowrap rounded-[11px] border border-white/20 px-[26px] font-display text-[16px] font-bold text-white transition-colors hover:border-[#E8A3AE] hover:bg-white/[0.04] hover:text-white"
                >
                  Escolher minha mentoria
                </a>
              </div>
            </div>
          </div>

          {/* Como funciona: o ciclo de 6 etapas da página das mentorias. */}
          <div className="mt-[clamp(56px,7vw,96px)]">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#E8A3AE]">Como funciona</span>
            <h2 className="mt-2 font-display text-[clamp(1.8rem,3.2vw,2.6rem)] font-extrabold tracking-[-0.035em]">Um ciclo que recomeça a cada resultado</h2>
            <ol className="mt-[clamp(24px,3vw,36px)] grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ETAPAS.map((e, i) => (
                <li key={e.titulo} className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-[rgba(14,3,6,0.35)] p-6">
                  <span className="font-display text-sm font-extrabold tracking-[0.08em] text-[#E8A3AE]">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-display text-[19px] font-extrabold tracking-[-0.015em] text-white">{e.titulo}</span>
                  <p className="text-[14.5px] leading-[1.55] text-[#C9BFCB] [text-wrap:pretty]">{e.texto}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* O que vem na Mentoria: a lista oficial do que está incluso. */}
          <div className="mt-[clamp(56px,7vw,96px)] rounded-3xl border border-white/10 bg-white/[0.04] p-[clamp(24px,3vw,40px)]">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#E8A3AE]">O que vem na Mentoria</span>
            <h2 className="mt-2 font-display text-[clamp(1.6rem,2.8vw,2.2rem)] font-extrabold tracking-[-0.03em]">A preparação completa, num lugar só</h2>
            <ul className="mt-6 grid gap-x-8 gap-y-3.5 sm:grid-cols-2">
              {INCLUSO.map((item) => (
                <li key={item} className="flex items-center gap-3 text-[15.5px] text-[#E4DCE6]">
                  <Check />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[14px] text-[#B9B0C4]">A Mentoria+ soma a tudo isso o acompanhamento premium por 3 meses. Compare os planos abaixo.</p>
          </div>
        </div>
      </section>

      <PlanosDasMentorias />

      <section className="bg-[linear-gradient(180deg,#22080F_0%,#2A0A12_100%)] py-[clamp(64px,8vw,112px)] text-white">
        <div className="conteiner flex flex-wrap items-end justify-between gap-x-12 gap-y-7">
          <div className="flex-[1_1_520px]">
            <h2 className="mb-3.5 font-display text-[clamp(2.2rem,4.4vw,3.8rem)] font-extrabold leading-none tracking-[-0.045em] [text-wrap:balance]">Você não precisa estudar no escuro.</h2>
            <p className="max-w-[560px] text-[17px] leading-[1.6] text-[#D6CFDD]">
              Tenha direção para saber onde ir. Dados para entender sua evolução. E acompanhamento para continuar avançando.
            </p>
          </div>
          <a href={LINK_DAS_MENTORIAS} target="_blank" rel="noopener" className={BOTAO_VINHO}>
            Saiba mais sobre a mentoria<span className="sr-only"> (abre em nova aba)</span>
          </a>
        </div>
      </section>
    </>
  );
}
