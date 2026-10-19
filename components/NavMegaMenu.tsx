import Link from "next/link";

// Ponto colorido ao lado de cada item: verde = aberto, azul = informativo, cinza = encerrado.
const CORES_DO_PONTO = {
  aberta: "bg-[#3FD38A] shadow-[0_0_8px_#3FD38A]",
  breve: "bg-[#4D9BFF] shadow-[0_0_8px_#4D9BFF]",
  encerrada: "bg-[#6B7A90]",
};

export type MegaMenuItem = {
  href: string;
  nome: string;
  meta: string;
  status?: "aberta" | "breve" | "encerrada";
};

export type MegaMenuFeatured = {
  eyebrow: string;
  title: string;
  desc: string;
  meta?: string;
  ctaLabel: string;
  ctaHref: string;
};

// Links para fora do site (landing das Mentorias) abrem na mesma aba, como os demais itens do menu.
function LinkDoMenu({ href, className, children }: { href: string; className: string; children: React.ReactNode }) {
  return href.startsWith("http") ? (
    <a href={href} className={className}>
      {children}
    </a>
  ) : (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export default function NavMegaMenu({
  items,
  featured,
  viewAllHref,
  viewAllLabel,
}: {
  items: MegaMenuItem[];
  featured: MegaMenuFeatured;
  viewAllHref: string;
  viewAllLabel: string;
}) {
  return (
    // A centralização (translate) fica no elemento de fora; a animação de entrada, que também usa transform, no de dentro.
    <div className="absolute left-1/2 top-full w-[min(940px,calc(100vw-40px))] -translate-x-1/2 pt-px">
      <div className="animate-[q-surgir_200ms_cubic-bezier(.2,.7,.2,1)_both] grid grid-cols-[minmax(0,1fr)_300px] overflow-hidden rounded-b-2xl border border-t-0 border-[rgba(111,174,255,0.16)] bg-marinho-900 shadow-[0_40px_80px_-28px_rgba(0,0,0,0.75)]">
        <div className="flex flex-col">
          <div className="grid grid-cols-2 content-start gap-1 p-4">
            {items.length === 0 && <p className="col-span-2 px-[18px] py-4 text-sm text-prata">Nada aberto no momento.</p>}
            {items.map((it) => (
              <LinkDoMenu
                key={it.href + it.nome}
                href={it.href}
                className="flex flex-col gap-[7px] rounded-[10px] px-[18px] py-4 text-white transition-colors hover:bg-azul/[0.12] hover:text-white"
              >
                <span className="font-display text-[15px] font-bold tracking-[-0.01em]">{it.nome}</span>
                <span className="flex items-center gap-2 text-[13px] text-prata">
                  <span className={`h-1.5 w-1.5 flex-none rounded-full ${CORES_DO_PONTO[it.status ?? "breve"]}`} />
                  {it.meta}
                </span>
              </LinkDoMenu>
            ))}
          </div>
          <LinkDoMenu
            href={viewAllHref}
            className="mt-auto flex min-h-[52px] items-center border-t border-white/[0.07] px-[34px] text-xs font-bold uppercase tracking-[0.1em] text-azul-ceu transition-colors hover:text-white"
          >
            {viewAllLabel} →
          </LinkDoMenu>
        </div>
        <div className="relative flex flex-col gap-3 border-l border-white/[0.07] bg-[radial-gradient(90%_70%_at_100%_0%,rgba(0,107,255,0.22),transparent_70%),#102641] px-[26px] py-7">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-azul-ceu">{featured.eyebrow}</span>
          <span className="font-display text-[21px] font-extrabold leading-[1.15] tracking-[-0.02em] text-white">{featured.title}</span>
          <span className="text-sm leading-[1.55] text-[#B4C1D3]">{featured.desc}</span>
          {featured.meta && <span className="text-xs font-bold uppercase tracking-[0.1em] text-[#4D9BFF]">{featured.meta}</span>}
          <LinkDoMenu
            href={featured.ctaHref}
            className="btn-q btn-q-azul mt-auto h-[46px] rounded-[9px] px-[18px] text-sm"
          >
            {featured.ctaLabel}
          </LinkDoMenu>
        </div>
      </div>
    </div>
  );
}
