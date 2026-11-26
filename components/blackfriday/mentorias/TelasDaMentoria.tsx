import Image from "next/image";

// As telas da plataforma da Mentoria (monitor, tablet e celular), com o brilho laranja e o selo "ESTUDO GUIADO TODOS OS
// DIAS" (prévia da designer de 26/11/2026). Caixa de 520 × 440, posicionada por quem usa (carrossel da Home e /mentorias).

const IMG = "/images/home/black";

function Aparelho({ className, moldura, tela, children }: { className: string; moldura: string; tela: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <div className={`border border-[#3A3A3E] bg-[#0B0B0C] ${moldura}`}>
        <div className={`relative overflow-hidden bg-[#17120F] ${tela}`}>{children}</div>
      </div>
    </div>
  );
}

export default function TelasDaMentoria({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none h-[440px] w-[520px] ${className}`}>
      <span className="absolute inset-0 rounded-full bg-[radial-gradient(closest-side,rgba(255,122,46,0.55),rgba(242,90,12,0.2)_60%,transparent)]" />
      <span className="absolute left-1/2 top-[68%] h-10 w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-2 border-[rgba(255,140,60,0.95)] shadow-[0_0_24px_4px_rgba(255,110,20,0.8),inset_0_0_18px_rgba(255,110,20,0.6)]" />
      <div className="absolute left-1/2 top-[-6%] h-[400px] w-[520px] -translate-x-1/2">
        <div className="absolute left-1/2 top-0 w-[440px] -translate-x-1/2 [filter:drop-shadow(0_0_30px_rgba(255,110,20,0.45))_drop-shadow(0_30px_40px_rgba(0,0,0,0.7))]">
          <Aparelho className="" moldura="rounded-[14px] p-3" tela="h-[250px] rounded">
            <Image src={`${IMG}/tela-aula.webp`} alt="" fill sizes="420px" className="object-cover object-left-top" />
          </Aparelho>
          <div className="mx-auto h-[46px] w-[70px] bg-[linear-gradient(90deg,#6E6E74,#C9C9CF_45%,#8E8E95)] [clip-path:polygon(14%_0,86%_0,100%_100%,0_100%)]" />
          <div className="mx-auto h-2.5 w-[190px] rounded-b-[10px] rounded-t-md bg-[linear-gradient(180deg,#D9D9DE,#8E8E95)] shadow-[0_8px_14px_-4px_rgba(0,0,0,0.7)]" />
        </div>
        <Aparelho
          className="absolute bottom-1.5 left-[-6px] w-[150px] -rotate-6 [filter:drop-shadow(0_24px_30px_rgba(0,0,0,0.75))]"
          moldura="rounded-2xl p-[9px]"
          tela="aspect-[3/4] rounded-lg"
        >
          <Image src={`${IMG}/tela-ipad.webp`} alt="" fill sizes="140px" className="object-cover object-top" />
        </Aparelho>
        <Aparelho
          className="absolute bottom-0 right-1 w-24 rotate-6 [filter:drop-shadow(0_24px_30px_rgba(0,0,0,0.75))]"
          moldura="rounded-[20px] p-1.5"
          tela="aspect-[9/19] rounded-[15px]"
        >
          <Image src={`${IMG}/tela-celular.webp`} alt="" fill sizes="90px" className="object-cover object-top" />
        </Aparelho>
      </div>
      <span className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[radial-gradient(circle_at_35%_30%,#FFB27A,#F25A0C_60%,#B23E06)] px-[18px] py-2 font-display text-[15px] font-extrabold tracking-[0.14em] text-white shadow-[0_0_24px_rgba(255,110,20,0.6),0_14px_30px_-8px_rgba(0,0,0,0.6)]">
        ESTUDO GUIADO TODOS OS DIAS
      </span>
    </div>
  );
}
