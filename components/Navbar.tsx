"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { turmas, produtos, eventos, cursosOnline } from "@/lib/data";
import { useCart } from "@/lib/cart";
import NavMegaMenu, { type MegaMenuFeatured, type MegaMenuItem } from "./NavMegaMenu";

function CartIcon({ count }: { count: number }) {
  return (
    <span className="relative flex items-center">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue text-[10px] font-bold text-navy-deep">
          {count}
        </span>
      )}
    </span>
  );
}

const turmaDestaque = turmas[0];
const kitCompleto = produtos.find((p) => p.slug === "kit-completo-cfp")!;
const eventoDestaque = eventos.find((e) => e.status === "breve") ?? eventos[0];
const cursoDestaque = cursosOnline[0];

const links: {
  href: string;
  label: string;
  menu?: { items: MegaMenuItem[]; featured: MegaMenuFeatured; viewAllHref: string; viewAllLabel: string };
}[] = [
  { href: "/", label: "Início" },
  {
    href: "/turmas",
    label: "Turmas",
    menu: {
      items: turmas.map((t) => ({
        href: t.detalhe ? `/turmas/${t.slug}` : "/turmas",
        nome: t.nome,
        meta: t.statusLabel,
        status: t.status,
      })),
      featured: {
        eyebrow: "Turma em destaque",
        title: turmaDestaque.nome,
        desc: turmaDestaque.detalhe!.lead.split(". ")[0] + ".",
        meta: turmaDestaque.statusLabel,
        ctaLabel: "Ver turma completa",
        ctaHref: `/turmas/${turmaDestaque.slug}`,
      },
      viewAllHref: "/turmas",
      viewAllLabel: "Ver todas as turmas",
    },
  },
  {
    href: "/produtos",
    label: "Materiais",
    menu: {
      items: produtos.map((p) => ({
        href: `/produtos/${p.slug}`,
        nome: p.nome,
        meta: p.tag,
      })),
      featured: {
        eyebrow: "Combo em destaque",
        title: kitCompleto.nome,
        desc: kitCompleto.detalhe!.lead.split(". ")[0] + ".",
        meta: kitCompleto.preco,
        ctaLabel: "Ver kit completo",
        ctaHref: `/produtos/${kitCompleto.slug}`,
      },
      viewAllHref: "/produtos",
      viewAllLabel: "Ver todos os materiais",
    },
  },
  {
    href: "/eventos",
    label: "Eventos",
    menu: {
      items: eventos.map((e) => ({
        href: "/eventos",
        nome: e.nome,
        meta: e.tag,
        status: e.status,
      })),
      featured: {
        eyebrow: "Próximo evento",
        title: eventoDestaque.nome,
        desc: eventoDestaque.desc,
        meta: eventoDestaque.tag,
        ctaLabel: "Ver todos os eventos",
        ctaHref: "/eventos",
      },
      viewAllHref: "/eventos",
      viewAllLabel: "Ver agenda completa",
    },
  },
  {
    href: "/cursos",
    label: "Cursos Online",
    menu: {
      items: cursosOnline.map((c) => ({
        href: "/cursos",
        nome: c.nome,
        meta: c.tag,
      })),
      featured: {
        eyebrow: "Curso em destaque",
        title: cursoDestaque.nome,
        desc: cursoDestaque.desc,
        meta: cursoDestaque.preco + (cursoDestaque.precoSufixo ?? ""),
        ctaLabel: "Ver cursos online",
        ctaHref: "/cursos",
      },
      viewAllHref: "/cursos",
      viewAllLabel: "Ver todos os cursos",
    },
  },
  { href: "/blog", label: "Blog" },
];

function MobileAccordionRow({
  link,
  isOpen,
  onToggle,
}: {
  link: (typeof links)[number];
  isOpen: boolean;
  onToggle: () => void;
}) {
  if (!link.menu) {
    return (
      <li>
        <Link
          href={link.href}
          className="focus-ring block py-3.5 font-display text-sm font-semibold uppercase tracking-wide text-steel-light transition-colors hover:text-blue"
        >
          {link.label}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="focus-ring flex w-full items-center justify-between py-3.5 font-display text-sm font-semibold uppercase tracking-wide text-steel-light"
      >
        {link.label}
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <ul className="pb-3 pl-3">
            {link.menu.items.map((it) => (
              <li key={it.href + it.nome}>
                <Link
                  href={it.href}
                  className="focus-ring block py-2 text-sm text-steel-light transition-colors hover:text-blue"
                >
                  {it.nome}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={link.menu.viewAllHref}
                className="focus-ring block py-2 text-xs font-semibold uppercase tracking-wide text-blue"
              >
                {link.menu.viewAllLabel} →
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </li>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalCount } = useCart();

  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 bg-navy-deep border-b border-dark">
      <div className="max-w-site mx-auto px-6 h-[68px] flex items-center justify-between">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.svg" alt="Quad Concursos" className="h-12 w-auto" />
        </Link>
        <ul className="hidden md:flex gap-7 items-center">
          {links.map((l) => (
            <li
              key={l.href}
              className="relative"
              onMouseEnter={() => l.menu && setOpenMenu(l.href)}
              onMouseLeave={() => l.menu && setOpenMenu(null)}
            >
              <Link
                href={l.href}
                className={`focus-ring flex items-center gap-1 text-sm font-medium transition-colors ${
                  pathname === l.href ? "text-blue" : "text-steel-light hover:text-blue"
                }`}
              >
                {l.label}
                {l.menu && (
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="mt-px">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                )}
              </Link>
              {l.menu && openMenu === l.href && (
                <NavMegaMenu
                  items={l.menu.items}
                  featured={l.menu.featured}
                  viewAllHref={l.menu.viewAllHref}
                  viewAllLabel={l.menu.viewAllLabel}
                />
              )}
            </li>
          ))}
          <li>
            <Link href="/carrinho" aria-label="Carrinho" className="focus-ring text-steel-light transition-colors hover:text-blue">
              <CartIcon count={totalCount} />
            </Link>
          </li>
          <li>
            <Link
              href="/entrar"
              className="focus-ring bg-blue hover:bg-blue-dark text-navy-deep font-display font-semibold text-[13px] uppercase tracking-wide px-4 py-2 transition-colors"
            >
              Área do Aluno
            </Link>
          </li>
        </ul>
        <div className="flex items-center gap-4 md:hidden">
          <Link href="/carrinho" aria-label="Carrinho" className="focus-ring text-steel-light">
            <CartIcon count={totalCount} />
          </Link>
          <Link
            href="/entrar"
            className="focus-ring bg-blue text-navy-deep font-display font-semibold text-xs uppercase px-3 py-2"
          >
            Entrar
          </Link>
          <button
            type="button"
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="focus-ring flex h-8 w-8 flex-col items-center justify-center gap-[5px]"
          >
            <span
              className={`block h-[2px] w-5 bg-steel-light transition-transform duration-200 ${
                mobileOpen ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-[2px] w-5 bg-steel-light transition-opacity duration-200 ${
                mobileOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-[2px] w-5 bg-steel-light transition-transform duration-200 ${
                mobileOpen ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>

      <div
        className={`grid md:hidden transition-[grid-template-rows] duration-300 ease-in-out ${
          mobileOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <ul className="divide-y divide-dark border-t border-dark bg-navy-deep px-6 shadow-md">
            {links.map((l) => (
              <MobileAccordionRow
                key={l.href}
                link={l}
                isOpen={openMenu === l.href}
                onToggle={() => setOpenMenu(openMenu === l.href ? null : l.href)}
              />
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
