import Link from "next/link";
import { FONTE_DA_CAMPANHA, VARIAVEL_DA_FONTE_DA_CAMPANHA } from "@/components/blackfriday/PartesDaBlackFriday";
import { PRECO_DA_MENTORIA } from "@/lib/black/mentorias";
import ContagemDoPreco from "./ContagemDoPreco";

// As partes da Home no período da Black (prévia da designer de 26/11/2026, "Preview Site Dia 27", Início): a faixa
// inclinada "BLACK FRIDAY 27/11 OFERTAS DO QUAD" entre as seções (no lugar das ondas) e o bloco "Mentoria por R$ 277,00"
// com a contagem até o fim da Black. A ordem das seções fica em app/page.tsx.

// A faixa fica parada, como as outras da campanha (a que rolava deixava a borda serrilhada no Chrome).
export function FaixaDaBlack() {
  const itens = Array.from({ length: 14 }, (_, i) => (
    <span key={i} className="inline-flex items-center gap-[30px]">
      <span className="text-white">BLACK FRIDAY</span>
      <span className="text-breu-800">27/11</span>
      <span className="text-white">OFERTAS DO QUAD</span>
      <span className="text-breu-800">✦</span>
    </span>
  ));
  return (
    <div aria-hidden="true" className={`${VARIAVEL_DA_FONTE_DA_CAMPANHA} relative z-[3] h-24 overflow-x-clip`}>
      <div
        className={`absolute -left-[6%] top-6 flex h-12 w-[112%] -rotate-[1.6deg] items-center overflow-hidden whitespace-nowrap bg-[linear-gradient(180deg,#FF7A2E,#E5530A)] text-[20px] italic shadow-[0_0_34px_rgba(255,106,26,0.55)] outline outline-1 outline-transparent [backface-visibility:hidden] ${FONTE_DA_CAMPANHA}`}
      >
        <div className="flex w-max gap-[30px] pl-5">{itens}</div>
      </div>
    </div>
  );
}

const GRADIENTE_DO_PRECO = "bg-[linear-gradient(100deg,#FFB27A_0%,#FF6A1A_45%,#E5530A_100%)] bg-clip-text text-transparent";

export function MentoriaDaHome() {
  return (
    <section aria-labelledby="titulo-mentoria-da-home" className="relative overflow-hidden text-center text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_60%,rgba(242,90,12,0.24),transparent_70%)]" />
      <div className="relative mx-auto flex max-w-[1000px] flex-col items-center px-[clamp(20px,4vw,48px)] py-[clamp(40px,5vw,72px)]">
        <h2
          id="titulo-mentoria-da-home"
          className="font-display text-[clamp(2.6rem,5.8vw,4.6rem)] font-extrabold leading-none tracking-[-0.05em] [text-wrap:balance]"
        >
          Mentoria por <span className={GRADIENTE_DO_PRECO}>{PRECO_DA_MENTORIA},00</span>
        </h2>
        <p className="mt-4 max-w-[760px] text-[clamp(15px,1.4vw,18px)] leading-[1.6] text-[#CFC5BE] [text-wrap:balance]">
          <strong className="font-bold text-white">12 meses</strong> de estratégia, cronograma personalizado e análise de desempenho.
        </p>
        <ContagemDoPreco />
        <div className="mt-[clamp(26px,3vw,36px)] flex flex-wrap justify-center gap-3">
          <Link
            href="/mentorias?escolher=1"
            className="btn-q btn-q-laranja h-[52px] rounded-[11px] px-[26px] text-[15.5px] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_16px_36px_-16px_rgba(242,90,12,0.9)] hover:-translate-y-0.5"
          >
            Garantir minha mentoria →
          </Link>
          <Link
            href="/mentorias"
            className="btn-q h-[52px] rounded-[11px] border-[1.5px] border-white/[0.22] px-6 text-[15.5px] text-white hover:border-laranja-claro hover:bg-laranja/[0.08] hover:text-white"
          >
            Ver detalhes da oferta
          </Link>
        </div>
      </div>
    </section>
  );
}
