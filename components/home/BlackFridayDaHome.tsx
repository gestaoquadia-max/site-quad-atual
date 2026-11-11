import Image from "next/image";
import Link from "next/link";
import ContagemDaBlackFriday from "@/components/blackfriday/ContagemDaBlackFriday";
import {
  ABERTURA_DAS_OFERTAS,
  Faixa,
  GRUPO_VIP,
  NOVA_ABA,
  SetaParaFora,
  VARIAVEL_DA_FONTE_DA_CAMPANHA,
} from "@/components/blackfriday/PartesDaBlackFriday";

// Bloco da Black Friday na Home, entre as Turmas presenciais e os Próximos eventos (entrega da designer, 11/11/2026):
// a oferta da Mentoria com a contagem até 27/11, a faixa "BLACK FRIDAY 27/11" e os dois materiais da campanha. Ocupa o
// lugar das seções de Mentorias e de Materiais enquanto BLACK_FRIDAY.home estiver ligada (lib/black-friday.ts).
// A faixa fica parada, como nas páginas da campanha (a que rolava deixava a borda serrilhada no Chrome).

const GRADIENTE_DO_PRECO = "bg-[linear-gradient(100deg,#FFB27A_0%,#FF6A1A_45%,#E5530A_100%)] bg-clip-text text-transparent";

const CARTAO_DE_MATERIAL =
  "group flex items-center gap-[18px] overflow-hidden rounded-2xl border border-white/[0.12] bg-white/[0.04] px-[22px] py-5 text-left text-white transition-colors duration-150 hover:border-laranja-claro hover:bg-laranja/[0.08] hover:text-white";

function SetaDoCartao() {
  return (
    <span className="flex-none text-laranja-claro">
      <SetaParaFora />
    </span>
  );
}

export default function BlackFridayDaHome() {
  return (
    <section aria-labelledby="titulo-black-friday" className={`${VARIAVEL_DA_FONTE_DA_CAMPANHA} relative overflow-hidden text-center text-white`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[image:radial-gradient(70%_55%_at_50%_60%,rgba(242,90,12,0.24),transparent_70%),linear-gradient(180deg,#151A24_0%,#17181C_20%,#1C1714_42%,#0E0C0B_78%,#151A24_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:80px_36px] opacity-35"
      />

      <div className="relative mx-auto flex max-w-[1000px] flex-col items-center px-[clamp(20px,4vw,48px)] pt-[clamp(40px,5vw,72px)]">
        <h2 id="titulo-black-friday" className="font-display text-[clamp(2.6rem,5.8vw,4.6rem)] font-extrabold leading-none tracking-[-0.05em] [text-wrap:balance]">
          Mentoria por <span className={GRADIENTE_DO_PRECO}>R$ 277,00</span>
        </h2>
        <p className="mt-4 max-w-[760px] text-[clamp(15px,1.4vw,18px)] leading-[1.6] text-[#CFC5BE] [text-wrap:balance]">
          <strong className="font-bold text-white">12 meses</strong> de estratégia, cronograma personalizado e análise de desempenho.
        </p>

        <ContagemDaBlackFriday alvo={ABERTURA_DAS_OFERTAS} dataPorExtenso="27 de novembro" compacta />

        <div className="mt-[clamp(26px,3vw,36px)] flex flex-wrap justify-center gap-3">
          <a
            href={GRUPO_VIP}
            target="_blank"
            rel="noopener"
            className="btn-q btn-q-laranja h-[52px] rounded-[11px] px-[26px] text-[15.5px] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_16px_36px_-16px_rgba(242,90,12,0.9)] hover:-translate-y-0.5"
          >
            Entrar no Grupo VIP
            <SetaParaFora />
            {NOVA_ABA}
          </a>
          <Link
            href="/mentorias"
            className="btn-q h-[52px] rounded-[11px] border-[1.5px] border-white/[0.22] px-6 text-[15.5px] text-white hover:border-laranja-claro hover:bg-laranja/[0.08] hover:text-white"
          >
            Ver detalhes da oferta
          </Link>
        </div>
      </div>

      {/* Faixa inclinada, mais larga que a tela (as pontas somem para fora). */}
      <div aria-hidden="true" className="relative z-[2] mb-[clamp(16px,2vw,24px)] mt-[clamp(56px,6vw,76px)] h-[44px]">
        <Faixa
          tom="laranja"
          comData
          className="-left-[6%] top-0 h-[44px] w-[112%] -rotate-[2.2deg] text-[17px] shadow-[0_0_34px_rgba(255,106,26,0.6),0_0_80px_rgba(242,90,12,0.3)]"
        />
      </div>

      <div className="relative mx-auto flex max-w-[1000px] flex-col items-center gap-[22px] px-[clamp(20px,4vw,48px)] pb-[clamp(44px,5vw,68px)] pt-[clamp(32px,4vw,44px)]">
        <h3 className="font-display text-[clamp(1.5rem,2.8vw,2.2rem)] font-extrabold leading-none tracking-[-0.045em] [text-wrap:balance]">
          Materiais de estudo na <span className={GRADIENTE_DO_PRECO}>Black Friday</span>
        </h3>
        <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] gap-4">
          <Link href="/produtos#materiais" className={CARTAO_DE_MATERIAL}>
            <span className="relative aspect-[707/1000] w-[68px] flex-none -rotate-3">
              <Image
                src="/images/black-friday/vade-mecum-sd-pmba.webp"
                alt=""
                fill
                sizes="68px"
                className="rounded-[5px] object-cover shadow-[0_12px_24px_-10px_rgba(0,0,0,0.9)]"
              />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="font-display text-[11.5px] font-extrabold uppercase tracking-[0.18em] text-laranja-claro">Materiais digitais</span>
              <span className="font-display text-[clamp(1.3rem,2vw,1.7rem)] font-extrabold leading-[1.05] tracking-[-0.035em]">
                a partir de <span className="whitespace-nowrap text-[#FF6A1A]">R$ 29,90</span>
              </span>
              <span className="text-sm leading-[1.45] text-[#B5AAA2]">Vade Mecum e módulos teóricos do seu edital.</span>
            </span>
            <SetaDoCartao />
          </Link>
          <Link href="/produtos#materiais" className={CARTAO_DE_MATERIAL}>
            <span aria-hidden="true" className="relative aspect-[707/1000] w-[68px] flex-none -rotate-3">
              <span className="absolute inset-0 translate-x-[5px] translate-y-1 rotate-2 rounded-[2px] bg-[#E9E4DE]" />
              <span className="absolute inset-0 translate-x-[2.5px] translate-y-0.5 rotate-1 rounded-[2px] bg-[#F3EFEA]" />
              <Image
                src="/images/black-friday/simulado-pmba.webp"
                alt=""
                fill
                sizes="68px"
                className="rounded-[2px] object-cover shadow-[0_12px_24px_-10px_rgba(0,0,0,0.9)]"
              />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="font-display text-[11.5px] font-extrabold uppercase tracking-[0.18em] text-laranja-claro">Combo de Simulados</span>
              <span className="font-display text-[clamp(1.3rem,2vw,1.7rem)] font-extrabold leading-[1.05] tracking-[-0.035em]">
                por <span className="whitespace-nowrap text-[#FF6A1A]">R$ 19,00</span>
              </span>
              <span className="text-sm leading-[1.45] text-[#B5AAA2]">Simulados 01 a 05 com gabarito comentado.</span>
            </span>
            <SetaDoCartao />
          </Link>
        </div>
      </div>
    </section>
  );
}
