import Link from "next/link";
import Kicker from "./Kicker";

const dotColors: Record<string, string> = {
  aberta: "bg-[#5FBF6C]",
  breve: "bg-blue",
  encerrada: "bg-steel",
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
    <div className="absolute left-0 top-[calc(100%+1px)] w-[640px] border border-dark bg-navy-mid shadow-md">
      <div className="grid grid-cols-[1fr_260px]">
        <div className="grid grid-cols-2 content-start gap-1 p-5">
          {items.length === 0 && (
            <p className="col-span-2 px-3 py-2.5 text-sm text-steel-light">Nada aberto no momento.</p>
          )}
          {items.map((it) => (
            <Link
              key={it.href + it.nome}
              href={it.href}
              className="focus-ring block border-l-2 border-transparent px-3 py-2.5 transition-colors hover:border-blue hover:bg-white/5"
            >
              <span className="font-display text-sm font-bold text-offwhite">{it.nome}</span>
              <div className="mt-1 flex items-center gap-1.5">
                {it.status && <span className={`h-1.5 w-1.5 rounded-full ${dotColors[it.status]}`} />}
                <span className="text-xs text-steel-light">{it.meta}</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="flex flex-col justify-between border-l border-dark bg-navy-deep p-6">
          <div>
            <Kicker color="text-blue">{featured.eyebrow}</Kicker>
            <h3 className="font-display mt-2.5 mb-2 text-lg font-bold leading-tight text-offwhite">
              {featured.title}
            </h3>
            <p className="text-[13px] leading-relaxed text-steel-light">{featured.desc}</p>
            {featured.meta && (
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-blue">{featured.meta}</p>
            )}
          </div>
          <Link href={featured.ctaHref} className="btn btn-blue mt-5 block text-center text-xs">
            {featured.ctaLabel}
          </Link>
        </div>
      </div>
      <div className="border-t border-dark px-5 py-3">
        <Link
          href={viewAllHref}
          className="focus-ring font-display text-xs font-semibold uppercase tracking-wide text-blue hover:text-blue-dark"
        >
          {viewAllLabel} →
        </Link>
      </div>
    </div>
  );
}
