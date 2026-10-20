// Tela cheia de aviso (404 e erro): número/ícone, título, texto e ações, no topo escuro do novo visual.
export default function TelaDeAviso({ selo, titulo, texto, children }: { selo: string; titulo: string; texto: string; children: React.ReactNode }) {
  return (
    <section className="relative flex min-h-[calc(100vh-140px)] items-center overflow-hidden bg-marinho-950 py-[clamp(56px,8vw,120px)] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_60%_at_75%_30%,rgba(0,107,255,0.28),transparent_70%)]" />
      <div className="conteiner relative">
        <div className="max-w-[640px]">
          <p
            aria-hidden="true"
            className="bg-[linear-gradient(100deg,#9CCBFF_0%,#4D9BFF_40%,#1F5BFF_100%)] bg-clip-text font-display text-[clamp(5rem,14vw,10rem)] font-extrabold leading-[0.9] tracking-[-0.06em] text-transparent"
          >
            {selo}
          </p>
          <h1 className="mb-4 mt-6 font-display text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-[1.05] tracking-[-0.035em]">{titulo}</h1>
          <p className="mb-8 max-w-[520px] text-[17px] leading-[1.6] text-[#B4C1D3]">{texto}</p>
          <div className="flex flex-wrap gap-3">{children}</div>
        </div>
      </div>
    </section>
  );
}
