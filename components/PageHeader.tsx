import Trilha from "./Trilha";

// Topo escuro das páginas internas no novo visual: trilha, sobretítulo, título e descrição.
export default function PageHeader({
  eyebrow,
  title,
  desc,
  children,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-marinho-950 pb-[clamp(48px,5vw,72px)] pt-[clamp(28px,3vw,40px)] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_70%_at_80%_20%,rgba(0,107,255,0.26),transparent_70%)]" />
      <div className="conteiner relative">
        <Trilha itens={[{ rotulo: "Início", href: "/" }, { rotulo: title }]} className="mb-[clamp(28px,4vw,48px)]" />
        {eyebrow && <span className="text-xs font-bold uppercase tracking-[0.14em] text-azul-ceu">{eyebrow}</span>}
        <h1 className="mb-3.5 mt-2.5 font-display text-[clamp(2.6rem,5.2vw,4.4rem)] font-extrabold leading-[0.98] tracking-[-0.045em] [text-wrap:balance]">{title}</h1>
        {desc && <p className="max-w-[600px] text-[clamp(16px,1.4vw,18px)] leading-[1.6] text-[#B4C1D3]">{desc}</p>}
        {children}
      </div>
    </section>
  );
}
