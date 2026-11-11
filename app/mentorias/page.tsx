import PaginaEmEspera from "@/components/PaginaEmEspera";
import {
  AberturaDaBlackFriday,
  Check,
  FaixaDaData,
  GRUPO_VIP,
  GrupoVip,
  NOVA_ABA,
  PaginaDaBlackFriday,
  SetaParaFora,
} from "@/components/blackfriday/PartesDaBlackFriday";
import { metadadosDaPagina } from "@/lib/seo";

export const metadata = metadadosDaPagina({
  titulo: "Mentorias do Quad · Black Friday",
  descricao: "Mentoria por R$ 277,00 na Black Friday de 27/11: 12 meses de estratégia, cronograma personalizado e análise de desempenho para o seu concurso.",
  caminho: "/mentorias",
});

// Página das Mentorias na Black Friday (11/2026), a partir do modelo da campanha (components/blackfriday). Até 27/11
// leva ao Grupo VIP (aviso da liberação) e à demonstração gratuita.

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

export default function MentoriasPage() {
  return (
    <PaginaEmEspera area="mentorias" titulo="Mentorias do Quad">
      <PaginaDaBlackFriday>
        <AberturaDaBlackFriday
          area="Mentorias do Quad"
          titulo="Mentoria por"
          preco="R$ 277,00"
          descricao={
            <>
              <strong className="font-extrabold text-white">12 meses</strong> de estratégia, cronograma personalizado e análise de desempenho para uma
              preparação direcionada ao seu concurso.
            </>
          }
          segundoBotao={{ rotulo: "Experimentar a mentoria", href: DEMONSTRACAO, externo: true }}
        />
        <FaixaDaData />

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
                <a
                  href={GRUPO_VIP}
                  target="_blank"
                  rel="noopener"
                  className="btn-q btn-q-laranja relative mt-auto min-h-14 whitespace-normal rounded-[11px] px-5 py-3 text-center text-base"
                >
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

        <GrupoVip />
      </PaginaDaBlackFriday>
    </PaginaEmEspera>
  );
}
