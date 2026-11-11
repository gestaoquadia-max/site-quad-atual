import Image from "next/image";
import { Russo_One } from "next/font/google";
import Trilha from "@/components/Trilha";
import PaginaEmEspera from "@/components/PaginaEmEspera";
import ContagemDaBlackFriday from "@/components/mentorias/ContagemDaBlackFriday";
import PrecoDigitando from "@/components/mentorias/PrecoDigitando";
import { metadadosDaPagina } from "@/lib/seo";

export const metadata = metadadosDaPagina({
  titulo: "Mentorias do Quad · Black Friday",
  descricao: "Mentoria por R$ 277,00 na Black Friday de 27/11: 12 meses de estratégia, cronograma personalizado e análise de desempenho para o seu concurso.",
  caminho: "/mentorias",
});

// Página das Mentorias na Black Friday (11/2026), refeita a partir do modelo da campanha (preto e laranja). Topo,
// menu em cápsula e rodapé são os do site; data-tema="black" troca as cores deles nesta página (components/Navbar.tsx
// e app/globals.css). Até 27/11 a página leva ao Grupo VIP (aviso da liberação) e à demonstração gratuita.

// Fonte das faixas "BLACK FRIDAY" e do "GRUPO VIP" do modelo; só esta página a carrega.
const fonteDaCampanha = Russo_One({ weight: "400", subsets: ["latin"], variable: "--font-campanha" });

const ABERTURA_DAS_OFERTAS = "2026-11-27T00:00:00-03:00";
const GRUPO_VIP = "https://chat.whatsapp.com/EmN0ss6uR7A0Q7USITlHbL";
const DEMONSTRACAO = "https://mentorias.quadconcursos.com.br/";

const BENEFICIOS = [
  "Curso online gravado em estúdio",
  "Materiais teóricos em PDF",
  "Cronograma personalizado na Tutory",
  "Materiais exclusivos de redação",
  "Raio-X de acertos por tópico",
  "Peso dos assuntos na prova da sua banca",
  "Ajustes após a publicação do edital",
  "Encontros semanais com professores do Quad",
  "Curso Como Estudar",
  "Comunidade Esparta",
  "Relatórios individuais de desempenho",
];

const PASSOS = [
  { t: "Cadastre-se", d: "Informe nome, e-mail e WhatsApp para liberar a demonstração." },
  { t: "Veja o painel de estudos", d: "Metas diárias, cronograma da semana e desempenho por matéria." },
  { t: "Assista a uma aula", d: "Abra o módulo de Português, com aula em vídeo e material em PDF." },
  { t: "Decida com segurança", d: "Em 27/11, a Mentoria completa sai por R$ 277,00." },
];

const FONTE_DA_CAMPANHA = "font-[family-name:var(--font-campanha)]";
const BOTAO_LARANJA =
  "btn-q btn-q-laranja h-[58px] rounded-[11px] px-[30px] text-[16.5px] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_18px_40px_-16px_rgba(242,90,12,0.9)] hover:-translate-y-0.5";

function SetaParaFora() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M5 11L11 5M6 5h5v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconeWhatsApp() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z" />
    </svg>
  );
}

const NOVA_ABA = <span className="sr-only"> (abre em nova aba)</span>;

// Faixa inclinada com "BLACK FRIDAY" repetido (decorativa). `andando`: rola como a faixa de avisos do topo.
function Faixa({ className, tom, andando = false, comData = false }: { className: string; tom: "laranja" | "grafite"; andando?: boolean; comData?: boolean }) {
  const cores =
    tom === "laranja" ? "bg-[linear-gradient(180deg,#FF7A2E,#E5530A)] text-breu-800" : "bg-[linear-gradient(180deg,#3A3533,#1D1A18)] text-[#E8E2DD]";
  const itens = Array.from({ length: 20 }, (_, i) => (
    <span key={i} className="inline-flex items-center gap-[18px]">
      {comData ? <span className="text-white">BLACK FRIDAY</span> : "BLACK FRIDAY"}
      {comData && <span className="text-breu-800">27/11</span>}
    </span>
  ));
  return (
    <div
      aria-hidden="true"
      className={`absolute flex items-center overflow-hidden whitespace-nowrap border-t border-white/[0.22] shadow-[0_8px_22px_rgba(0,0,0,0.6)] italic ${FONTE_DA_CAMPANHA} ${cores} ${className}`}
    >
      <div className={`flex w-max gap-[clamp(18px,2vw,32px)] pl-5 ${andando ? "animate-[marquee_40s_linear_infinite] motion-reduce:animate-none" : ""}`}>
        {itens}
        {andando && itens}
      </div>
    </div>
  );
}

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="flex-none text-laranja-claro">
      <path d="M3 8.5l3.2 3L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function MentoriasPage() {
  return (
    <PaginaEmEspera area="mentorias" titulo="Mentorias do Quad">
      <div data-tema="black" className={`${fonteDaCampanha.variable} overflow-x-clip bg-breu text-[#F3EEEA]`}>
        {/* Abertura: o preço, a contagem até 27/11 e os dois caminhos (Grupo VIP e demonstração). */}
        <section className="relative overflow-hidden pb-[clamp(88px,9vw,136px)] pt-[clamp(28px,3vw,40px)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[image:radial-gradient(60%_55%_at_50%_62%,rgba(242,90,12,0.26),transparent_70%),linear-gradient(180deg,#1C1714_0%,#120F0D_55%,#0A0908_100%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[image:linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[length:96px_44px] opacity-35"
          />
          <div className="conteiner relative">
            <Trilha
              itens={[{ rotulo: "Início", href: "/" }, { rotulo: "Mentorias do Quad" }]}
              className="mb-[clamp(40px,5vw,72px)] !text-[#8A7F78] [&_a]:text-[#B5AAA2]"
            />
            <div className="mx-auto flex max-w-[980px] flex-col items-center text-center">
              <h1 className="font-display text-[clamp(2.8rem,6.2vw,5.6rem)] font-extrabold leading-[0.95] tracking-[-0.05em] [text-wrap:balance]">
                Mentoria por{" "}
                <PrecoDigitando texto="R$ 277,00" className="bg-[linear-gradient(100deg,#FFB27A_0%,#FF6A1A_45%,#E5530A_100%)] bg-clip-text text-transparent" />
              </h1>
              <p className="mt-6 max-w-[640px] text-[clamp(17px,1.5vw,20px)] leading-[1.6] text-[#CFC5BE] [text-wrap:pretty]">
                <strong className="font-extrabold text-white">12 meses</strong> de estratégia, cronograma personalizado e análise de desempenho para uma
                preparação direcionada ao seu concurso.
              </p>

              <ContagemDaBlackFriday alvo={ABERTURA_DAS_OFERTAS} dataPorExtenso="27 de novembro" />

              <div className="mt-[clamp(36px,4vw,52px)] flex flex-wrap justify-center gap-3.5">
                <a href={GRUPO_VIP} target="_blank" rel="noopener" className={BOTAO_LARANJA}>
                  Entrar no Grupo VIP
                  <SetaParaFora />
                  {NOVA_ABA}
                </a>
                <a
                  href={DEMONSTRACAO}
                  target="_blank"
                  rel="noopener"
                  className="btn-q h-[58px] rounded-[11px] border-[1.5px] border-white/[0.22] px-7 text-[16.5px] text-white hover:border-laranja-claro hover:bg-laranja/[0.08] hover:text-white"
                >
                  Experimentar a mentoria
                  {NOVA_ABA}
                </a>
              </div>
              <p className="mt-4 text-sm text-[#A39790]">Quem está no Grupo VIP recebe o aviso da liberação das ofertas em primeira mão.</p>
            </div>
          </div>
        </section>

        {/* Faixa laranja entre a abertura e a oferta. */}
        <div aria-hidden="true" className="relative z-[2] h-0">
          <Faixa tom="laranja" andando comData className="-left-[5%] -right-[5%] -top-[26px] h-[52px] -rotate-[1.6deg] text-[22px]" />
        </div>

        {/* Oferta: o que vem na Mentoria e a demonstração gratuita. */}
        <section className="bg-[#F6F2EF] py-[clamp(64px,8vw,120px)] text-breu-800">
          <div className="conteiner">
            <h2 className="mb-[clamp(28px,3vw,44px)] font-display text-[clamp(2rem,3.6vw,3rem)] font-extrabold tracking-[-0.035em]">
              O que você recebe na Mentoria
            </h2>
            <div className="grid items-stretch gap-[clamp(16px,2vw,28px)] [grid-template-columns:repeat(auto-fit,minmax(min(100%,460px),1fr))]">
              <article className="relative flex flex-col gap-[22px] overflow-hidden rounded-3xl border border-[rgba(255,122,46,0.3)] bg-breu-900 p-[clamp(26px,3vw,44px)] text-white shadow-[0_40px_80px_-40px_rgba(20,12,8,0.8)]">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_100%_0%,rgba(242,90,12,0.35),transparent_70%)]"
                />
                <div className="relative flex flex-wrap items-end justify-between gap-4">
                  <div className="flex flex-col gap-2.5">
                    <span className="inline-flex h-[26px] items-center self-start rounded-md bg-laranja px-2.5 font-display text-[11.5px] font-extrabold uppercase tracking-[0.14em] text-white">
                      Black Friday
                    </span>
                    <h3 className="font-display text-[clamp(2.2rem,3.4vw,3rem)] font-extrabold leading-none tracking-[-0.04em]">Mentoria</h3>
                  </div>
                  <span className="flex items-baseline gap-1.5 whitespace-nowrap font-display font-extrabold">
                    <span className="text-xl font-bold text-laranja-suave">R$</span>
                    <span className="text-[clamp(48px,5vw,64px)] leading-none tracking-[-0.045em]">277</span>
                    <span className="text-2xl tracking-[-0.02em]">,00</span>
                  </span>
                </div>
                <ul className="relative grid gap-x-7 border-t border-white/10 [grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))]">
                  {BENEFICIOS.map((b) => (
                    <li key={b} className="flex items-center gap-3 border-b border-white/10 py-[13px] text-[15.5px] leading-[1.35]">
                      <Check />
                      {b}
                    </li>
                  ))}
                </ul>
                <p className="relative rounded-xl border border-[rgba(255,122,46,0.3)] bg-[rgba(242,90,12,0.14)] px-4 py-3.5 text-[14.5px] leading-[1.5] text-[#F6E7DD]">
                  <strong className="font-bold text-white">12 meses de acesso</strong> a contar da compra.
                </p>
                <a href={GRUPO_VIP} target="_blank" rel="noopener" className="btn-q btn-q-laranja relative mt-auto min-h-14 whitespace-normal rounded-[11px] px-5 py-3 text-center text-base">
                  Garantir acesso antecipado no Grupo VIP
                  {NOVA_ABA}
                </a>
              </article>

              <article className="flex flex-col gap-[22px] rounded-3xl border border-[#E8DFD8] bg-white p-[clamp(26px,3vw,44px)] shadow-[0_30px_60px_-44px_rgba(23,18,15,0.5)]">
                <span className="inline-flex h-[26px] items-center self-start rounded-md bg-[#FDEBDF] px-2.5 font-display text-[11.5px] font-extrabold uppercase tracking-[0.14em] text-[#B5420A]">
                  Gratuito
                </span>
                <h3 className="font-display text-[clamp(2rem,3vw,2.6rem)] font-extrabold leading-[1.02] tracking-[-0.04em] [text-wrap:balance]">
                  Experimente a mentoria antes de comprar
                </h3>
                <p className="text-[16.5px] leading-[1.6] text-[#4E443E] [text-wrap:pretty]">
                  Acesse a demonstração da plataforma Quad Mentorias, a mesma que você usará na Black Friday, e veja na prática como a mentoria funciona.
                </p>
                <ol className="flex flex-col border-t border-[#F0E8E2]">
                  {PASSOS.map((p, i) => (
                    <li key={p.t} className="flex items-start gap-4 border-b border-[#F0E8E2] py-4">
                      <span className="grid h-[30px] w-[30px] flex-none place-items-center rounded-lg bg-breu-800 font-display text-[13px] font-extrabold text-laranja-suave">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex flex-col gap-[3px]">
                        <strong className="font-display text-base font-bold text-breu-800">{p.t}</strong>
                        <span className="text-[14.5px] leading-[1.5] text-[#6A5F58]">{p.d}</span>
                      </span>
                    </li>
                  ))}
                </ol>
                <a
                  href={DEMONSTRACAO}
                  target="_blank"
                  rel="noopener"
                  className="btn-q mt-auto h-14 rounded-[11px] border-[1.5px] border-breu-800 px-5 text-base text-breu-800 hover:bg-breu-800 hover:text-white"
                >
                  Acessar a demonstração gratuita
                  <SetaParaFora />
                  {NOVA_ABA}
                </a>
              </article>
            </div>
          </div>
        </section>

        {/* Grupo VIP: o convite para o grupo do WhatsApp, entre as faixas da campanha. */}
        <section className="relative overflow-hidden bg-[radial-gradient(55%_60%_at_50%_48%,#2A221D_0%,#151110_60%,#0E0C0B_100%)] pb-[clamp(190px,16vw,240px)] pt-[clamp(96px,10vw,150px)] text-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[image:linear-gradient(rgba(0,0,0,0.6)_2px,transparent_2px),linear-gradient(90deg,rgba(0,0,0,0.6)_2px,transparent_2px)] bg-[length:96px_40px] opacity-50"
          />
          <Faixa tom="grafite" className="-left-[10%] top-16 h-[clamp(36px,3.4vw,50px)] w-[120%] rotate-[5deg] text-[clamp(16px,1.6vw,22px)]" />
          <Faixa tom="laranja" className="-left-[10%] top-5 h-[clamp(36px,3.4vw,50px)] w-[120%] -rotate-3 text-[clamp(16px,1.6vw,22px)]" />
          <Faixa tom="laranja" className="-left-[10%] bottom-16 h-[clamp(36px,3.4vw,50px)] w-[120%] -rotate-[4deg] text-[clamp(16px,1.6vw,22px)]" />
          <Faixa tom="grafite" className="-left-[10%] bottom-[18px] h-[clamp(36px,3.4vw,50px)] w-[120%] rotate-[2.5deg] text-[clamp(16px,1.6vw,22px)]" />

          <div className="conteiner relative z-[1]">
            <div className="mx-auto flex max-w-[900px] flex-col items-center text-center">
              <h2 className="mt-[clamp(18px,2vw,28px)] flex flex-col items-center font-normal">
                <span
                  className={`bg-[linear-gradient(180deg,#FFFFFF_0%,#C9C3BE_55%,#8E8782_100%)] bg-clip-text text-[clamp(4.6rem,13vw,11rem)] leading-[0.85] text-transparent ${FONTE_DA_CAMPANHA}`}
                >
                  GRUPO
                </span>
                <span className={`text-[clamp(7rem,21vw,18rem)] leading-[0.8] text-laranja [text-shadow:0_0_60px_rgba(242,90,12,0.35)] ${FONTE_DA_CAMPANHA}`}>
                  VIP
                </span>
              </h2>
              <div
                aria-hidden="true"
                className="relative mt-[clamp(-96px,-7vw,-48px)] flex h-[clamp(130px,16vw,200px)] w-[clamp(240px,30vw,380px)] flex-col items-center rounded-t-[36px] border-[8px] border-b-0 border-[#2A2522] bg-[linear-gradient(180deg,#0B0908,#16110E)] shadow-[0_0_0_3px_#FF6A1A,0_0_50px_rgba(242,90,12,0.55)]"
              >
                <span className="mt-1.5 h-4 w-[32%] rounded-b-xl bg-[#2A2522]" />
                <svg
                  viewBox="0 0 64 40"
                  fill="none"
                  stroke="#FF8A3D"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-2.5 w-[56%] [filter:drop-shadow(0_0_8px_rgba(255,106,26,0.9))]"
                >
                  <path d="M24 9l4 4 4-7 4 7 4-4-2 8H26z" />
                  <circle cx="32" cy="22" r="5" />
                  <path d="M22 38c0-6 4.5-9 10-9s10 3 10 9" />
                  <circle cx="16" cy="25" r="4" />
                  <path d="M8 38c0-4.5 3.5-7 8-7" />
                  <circle cx="48" cy="25" r="4" />
                  <path d="M56 38c0-4.5-3.5-7-8-7" />
                </svg>
              </div>
              <p className="mt-[clamp(18px,2vw,26px)] leading-none">
                <span className="block font-display text-[clamp(20px,2.6vw,34px)] font-semibold uppercase tracking-[-0.01em] text-[#E8E2DD]">
                  Entre no grupo e receba
                </span>
                <span className={`mt-1.5 block text-[clamp(28px,4vw,52px)] text-[#FF6A1A] ${FONTE_DA_CAMPANHA}`}>ACESSO ANTECIPADO</span>
              </p>
              <ul className="mt-[clamp(22px,2.6vw,34px)] flex w-[min(100%,640px)] gap-2 rounded-2xl border-[2.5px] border-laranja bg-[rgba(10,9,8,0.85)] px-2.5 py-[clamp(16px,2vw,24px)]">
                {[
                  {
                    texto: "Novidades",
                    icone: (
                      <>
                        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                      </>
                    ),
                  },
                  {
                    texto: "Condições especiais",
                    icone: (
                      <>
                        <circle cx="12" cy="12" r="10" />
                        <path d="M15 9l-6 6" />
                        <circle cx="9.5" cy="9.5" r="0.6" />
                        <circle cx="14.5" cy="14.5" r="0.6" />
                      </>
                    ),
                  },
                  {
                    texto: "Avisos em primeira mão",
                    icone: (
                      <>
                        <path d="M3 11v2a1 1 0 0 0 1 1h3l5 4V6L7 10H4a1 1 0 0 0-1 1z" />
                        <path d="M16 9a4 4 0 0 1 0 6" />
                        <path d="M19 6a8 8 0 0 1 0 12" />
                      </>
                    ),
                  },
                ].map((v, i) => (
                  <li
                    key={v.texto}
                    className={`flex min-w-0 flex-1 flex-col items-center gap-3 px-1.5 py-1 text-center ${i > 0 ? "border-l border-laranja" : ""}`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#FF6A1A"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="h-[clamp(30px,3vw,40px)] w-[clamp(30px,3vw,40px)]"
                    >
                      {v.icone}
                    </svg>
                    <span className="max-w-[12ch] font-display text-[clamp(12px,1.1vw,14px)] font-bold uppercase leading-[1.25] tracking-[0.08em] text-[#E8E2DD]">
                      {v.texto}
                    </span>
                  </li>
                ))}
              </ul>
              <a href={GRUPO_VIP} target="_blank" rel="noopener" className={`${BOTAO_LARANJA} mt-[clamp(28px,3vw,40px)] h-[62px] gap-3 px-[34px] text-[17px]`}>
                <IconeWhatsApp />
                Entrar no Grupo VIP
                {NOVA_ABA}
              </a>
              <Image
                src="/images/quad-logo-branco.png"
                alt="Quad Concursos"
                width={236}
                height={88}
                className="relative z-[2] mt-[clamp(36px,4vw,56px)] h-auto w-[clamp(120px,12vw,160px)]"
              />
            </div>
          </div>
        </section>
      </div>
    </PaginaEmEspera>
  );
}
