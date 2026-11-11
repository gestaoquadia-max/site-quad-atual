import Image from "next/image";
import Link from "next/link";
import type { Evento } from "@/lib/data";
import { paraCartao } from "@/lib/eventos";
import { MESES_CURTOS, ROTULO_DO_TIPO, type ItemDaAgenda } from "@/lib/agenda";
import CartaoEvento from "../home/CartaoEvento";
import Onda from "@/components/home/Onda";

// Começo da Agenda Quad (/eventos), na entrega da designer de 11/11/2026: o topo escuro com o card "Próximos na
// agenda", a onda, o destaque dos Simulados do Quad e os aulões (a seção só existe com aulões cadastrados). As
// excursões e o calendário vêm depois (app/eventos/page.tsx).

function ProximosNaAgenda({ itens }: { itens: ItemDaAgenda[] }) {
  return (
    <div className="flex flex-col gap-4 rounded-[20px] border border-white/[0.14] bg-[rgba(15,30,60,0.6)] p-6 backdrop-blur-[6px]">
      <span className="text-xs font-extrabold tracking-[0.16em] text-[#93C5FD]">PRÓXIMOS NA AGENDA</span>
      <ul className="flex flex-col">
        {itens.map((e) => (
          <li key={e.id}>
            <Link
              href={e.href}
              className="group grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-3.5 border-t border-white/10 py-3 text-white hover:text-[#93C5FD]"
            >
              <span className="flex flex-col items-center rounded-[10px] bg-azul py-[7px] font-display font-extrabold leading-none text-white">
                <b className="text-xl">{e.data.slice(8, 10)}</b>
                <span className="mt-[3px] text-[10px] tracking-[0.12em]">{MESES_CURTOS[Number(e.data.slice(5, 7)) - 1]}</span>
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#93C5FD]">{ROTULO_DO_TIPO[e.tipo]}</span>
                <b className="truncate font-display text-base font-extrabold">{e.titulo}</b>
              </span>
              <span aria-hidden="true" className="text-lg transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <a href="#calendario" className="btn-q btn-q-azul h-[46px] w-full px-4 text-[15px]">
        Ver calendário completo
      </a>
    </div>
  );
}

export default function AgendaDeEventos({ eventos, proximos }: { eventos: Evento[] | null; proximos: ItemDaAgenda[] }) {
  const auloes = eventos ?? [];
  return (
    <>
      <section className="relative overflow-hidden bg-marinho-950 fundo-escuro-da-onda pb-[clamp(56px,7vw,90px)] pt-[clamp(40px,5vw,56px)] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_30%_60%,rgba(37,99,235,0.28),transparent_70%)]" />
        <div className="conteiner relative grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-12">
          <div className="flex flex-col gap-[22px]">
            <nav aria-label="Trilha" className="flex gap-2 text-sm text-[#CBD5E1]">
              <Link href="/" className="text-[#CBD5E1] hover:text-white">
                Início
              </Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="font-bold text-white">
                Eventos
              </span>
            </nav>
            <h1 className="font-display text-[clamp(3rem,6vw,5rem)] font-extrabold leading-none tracking-[-0.045em]">Agenda Quad</h1>
            <p className="max-w-[520px] text-[clamp(16px,1.5vw,19px)] leading-[1.55] text-[#CBD5E1]">
              Simulados, aulões, palestras e os grandes encontros da comunidade Quad.
            </p>
          </div>
          {proximos.length > 0 && <ProximosNaAgenda itens={proximos} />}
        </div>
      </section>
      <Onda para="claro" />

      <section className="bg-nevoa pt-[clamp(16px,2vw,24px)]">
        <div className="conteiner">
          {/* Branco de propósito (06/11/2026, pedido do usuário): o destaque da página, sobre o claro azulado. */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] overflow-hidden rounded-[22px] bg-white text-marinho-950 shadow-[0_30px_60px_-36px_rgba(15,23,42,0.5)]">
            <div className="flex flex-col justify-center gap-[18px] p-[clamp(28px,4vw,60px)]">
              <h2 className="font-display text-[clamp(2.2rem,4vw,3.4rem)] font-extrabold leading-none tracking-[-0.045em]">Simulados do Quad</h2>
              <p className="text-[17px] leading-[1.6] text-[#475569]">
                Escolha sua carreira e encontre simulados presenciais, digitais, impressos e combos para sua preparação.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/simulados" className="btn-q btn-q-azul h-[55px] px-[26px] text-base">
                  Explorar simulados
                </Link>
                <a href="#calendario" className="btn-q btn-q-contorno h-[55px] px-[26px] text-base">
                  Ver calendário
                </a>
              </div>
            </div>
            <div className="relative min-h-[280px] bg-marinho-900">
              <Image
                src="/images/capa-simulados/banner-simulado.png"
                alt="Painel de desempenho nos simulados do Quad, com cartão-resposta e gráfico de evolução"
                fill
                sizes="(min-width: 900px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {eventos === null && (
        <section className="bg-nevoa pt-[clamp(48px,6vw,72px)]">
          <div className="conteiner">
            <p role="alert" className="rounded-2xl border border-[#9B3535]/30 bg-[#9B3535]/[0.06] p-6 text-center text-sm text-[#9B3535]">
              Não foi possível carregar a agenda agora. Tente novamente em instantes.
            </p>
          </div>
        </section>
      )}

      {auloes.length > 0 && (
        <section id="auloes" className="scroll-mt-[120px] bg-nevoa pt-[clamp(48px,6vw,72px)]">
          <div className="conteiner flex flex-col gap-7">
            <div className="flex flex-col gap-2">
              <h2 className="titulo-secao">Aulões</h2>
              <p className="text-[16.5px] leading-[1.55] text-ardosia [text-wrap:pretty]">Revisões intensivas com os professores do Quad antes das provas.</p>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-6">
              {auloes.map((e) => (
                <CartaoEvento key={e.slug} evento={paraCartao(e)} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
