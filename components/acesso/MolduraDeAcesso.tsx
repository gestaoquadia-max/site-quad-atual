import Image from "next/image";
import Link from "next/link";
import BotaoWhatsApp from "../BotaoWhatsApp";

export function VoltarAoSite({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-[9px] border border-white/[0.14] px-3.5 text-sm font-semibold text-[#DCE4EF] transition-colors hover:border-azul-ceu hover:text-white ${className}`}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Voltar ao site
    </Link>
  );
}

// Entrar, criar conta e recuperar a senha: topo enxuto, painel escuro à esquerda e o formulário à direita.
export default function MolduraDeAcesso({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-marinho-950">
      <header className="border-b border-white/[0.06] bg-marinho-950">
        <div className="conteiner flex h-[68px] items-center justify-between gap-4">
          <Link href="/" aria-label="Quad Concursos — voltar ao site" className="flex">
            <Image src="/images/quad-logo-branco.png" alt="Quad Concursos" width={110} height={40} priority className="h-10 w-auto" />
          </Link>
          <VoltarAoSite />
        </div>
      </header>
      <div className="flex flex-1 flex-wrap bg-nevoa">
        <section className="relative flex min-h-[clamp(240px,40vw,720px)] flex-[1_1_520px] flex-col justify-center overflow-hidden bg-marinho-950 px-[clamp(24px,5vw,80px)] py-[clamp(36px,5vw,72px)] text-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[image:radial-gradient(55%_55%_at_70%_35%,rgba(0,107,255,0.32),transparent_70%),radial-gradient(40%_40%_at_10%_100%,rgba(20,74,255,0.18),transparent_70%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[length:64px_64px] [mask-image:radial-gradient(55%_60%_at_65%_40%,#000,transparent_75%)]"
          />
          <div className="relative max-w-[520px]">
            <p className="mb-[18px] font-display text-[clamp(2.6rem,5vw,4.8rem)] font-extrabold leading-[0.98] tracking-[-0.045em] [text-wrap:balance]">
              Sua preparação em{" "}
              <span className="bg-[linear-gradient(100deg,#9CCBFF_0%,#4D9BFF_40%,#1F5BFF_100%)] bg-clip-text text-transparent">um só lugar</span>
            </p>
            <p className="text-[clamp(15.5px,1.3vw,17.5px)] leading-[1.6] text-[#B4C1D3]">Acesse suas turmas, materiais e compras.</p>
          </div>
        </section>
        <section className="flex flex-[1_1_480px] items-center justify-center px-[clamp(20px,4vw,64px)] py-[clamp(32px,5vw,72px)]">
          <div className="flex w-full max-w-[480px] flex-col gap-6">{children}</div>
        </section>
      </div>
      <BotaoWhatsApp />
    </div>
  );
}
