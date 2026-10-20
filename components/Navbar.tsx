"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import type { Evento, Produto, Turma } from "@/lib/data";
import { ehKit } from "@/lib/materiais";
import { LINK_DAS_MENTORIAS } from "@/lib/conteudo";
import { useCart } from "@/lib/cart";
import { useUsuarioAtual } from "@/lib/usuario";
import NewsTicker from "./NewsTicker";
import NavMegaMenu, { type MegaMenuFeatured, type MegaMenuItem } from "./NavMegaMenu";

function IconeCarrinho({ quantidade }: { quantidade: number }) {
  return (
    <>
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {quantidade > 0 && (
        <span className="absolute right-1 top-[5px] grid h-[17px] min-w-[17px] place-items-center rounded-full bg-azul px-1 text-[10.5px] font-bold text-white shadow-[0_0_0_2px_#071426]">
          {quantidade}
        </span>
      )}
    </>
  );
}

function Seta({ aberta = false, className = "" }: { aberta?: boolean; className?: string }) {
  return (
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true" className={`transition-transform duration-200 ${aberta ? "rotate-180" : ""} ${className}`}>
      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

type LinkDoMenu = {
  href: string;
  label: string;
  menu?: { items: MegaMenuItem[]; featured: MegaMenuFeatured; viewAllHref: string; viewAllLabel: string };
};


// Turmas e eventos vêm da vitrine da API (lida no servidor, em app/layout.tsx). Sem nenhum aberto, o destaque
// vira um convite para a página da lista.
function montarLinks(turmas: Turma[], eventos: Evento[], materiais: Produto[]): LinkDoMenu[] {
  const kit = materiais.find(ehKit);
  const turmaDestaque = turmas.find((t) => t.status === "aberta") ?? turmas[0];
  return [
    { href: "/", label: "Início" },
    {
      href: "/turmas",
      label: "Turmas Presenciais",
      menu: {
        items: turmas.map((t) => ({ href: `/turmas/${t.slug}`, nome: t.nome, meta: t.statusLabel, status: t.status })),
        featured: turmaDestaque
          ? {
              eyebrow: "Turma em destaque",
              title: turmaDestaque.nome,
              desc: turmaDestaque.desc,
              meta: turmaDestaque.statusLabel,
              ctaLabel: "Ver turma completa",
              ctaHref: `/turmas/${turmaDestaque.slug}`,
            }
          : {
              eyebrow: "Turmas presenciais",
              title: "Novas turmas em breve",
              desc: "As próximas turmas aparecem aqui assim que as matrículas abrirem.",
              ctaLabel: "Ver turmas",
              ctaHref: "/turmas",
            },
        viewAllHref: "/turmas",
        viewAllLabel: "Ver todas as turmas",
      },
    },
    {
      href: "/mentorias",
      label: "Mentorias do Quad",
      menu: {
        items: [
          { href: `${LINK_DAS_MENTORIAS}#mentoria`, nome: "Mentoria", meta: "12 meses de acesso" },
          { href: `${LINK_DAS_MENTORIAS}#plus`, nome: "Mentoria+", meta: "3 meses de acesso", status: "aberta" },
          { href: `${LINK_DAS_MENTORIAS}#comparativo`, nome: "Combo Mentoria + Mentoria Plus", meta: "12 meses + 3 meses Plus" },
        ],
        featured: {
          eyebrow: "Mentorias do Quad",
          title: "Você estuda. O Quad direciona.",
          desc: "Estratégia, cronograma personalizado e análise de desempenho para uma preparação direcionada ao seu concurso.",
          ctaLabel: "Saiba mais sobre a mentoria",
          ctaHref: LINK_DAS_MENTORIAS,
        },
        viewAllHref: "/mentorias",
        viewAllLabel: "Ver Mentorias do Quad",
      },
    },
    {
      href: "/produtos",
      label: "Materiais",
      menu: {
        items: materiais.map((p) => ({
          href: `/produtos/${p.slug}`,
          nome: p.nome,
          meta: ehKit(p) ? "Kit" : "Apostila",
          status: ehKit(p) ? "aberta" : undefined,
        })),
        featured: kit
          ? {
              eyebrow: "Material em destaque",
              title: kit.nome,
              desc: kit.desc,
              meta: kit.preco,
              ctaLabel: "Ver material",
              ctaHref: `/produtos/${kit.slug}`,
            }
          : {
              eyebrow: "Materiais de estudo",
              title: "Apostilas do Quad",
              desc: "Teoria direto ao ponto e questões comentadas da banca.",
              ctaLabel: "Ver materiais",
              ctaHref: "/produtos",
            },
        viewAllHref: "/produtos",
        viewAllLabel: "Ver todos os materiais",
      },
    },
    { href: "/loja", label: "Loja" },
    {
      href: "/eventos",
      label: "Eventos",
      menu: {
        items: [
          { href: "/simulados", nome: "Simulados do Quad", meta: "Presenciais, individuais e combos", status: "aberta" },
          ...eventos.map((e) => ({ href: `/eventos/${e.slug}`, nome: e.nome, meta: e.tag, status: e.status })),
        ],
        featured: {
          eyebrow: "Simulados do Quad",
          title: "Presenciais, individuais e combos",
          desc: "Escolha sua carreira e encontre a melhor forma de testar seus conhecimentos.",
          ctaLabel: "Ver simulados",
          ctaHref: "/simulados",
        },
        viewAllHref: "/eventos",
        viewAllLabel: "Ver agenda completa",
      },
    },
    { href: "/blog", label: "Blog" },
  ];
}

function estaAtivo(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function ItemSanfona({ link, aberto, onAlternar }: { link: LinkDoMenu; aberto: boolean; onAlternar: () => void }) {
  if (!link.menu) {
    return (
      <li className="border-b border-white/[0.08]">
        <Link href={link.href} className="flex min-h-[52px] items-center font-display text-base font-bold text-[#DCE4EF]">
          {link.label}
        </Link>
      </li>
    );
  }
  return (
    <li className="border-b border-white/[0.08]">
      <button
        type="button"
        onClick={onAlternar}
        aria-expanded={aberto}
        className="flex min-h-[52px] w-full items-center justify-between text-left font-display text-base font-bold text-[#DCE4EF]"
      >
        {link.label}
        <Seta aberta={aberto} />
      </button>
      {aberto && (
        <ul className="mb-3 border-l-2 border-azul pb-1 pl-3.5">
          {link.menu.items.map((it) => (
            <li key={it.href + it.nome}>
              <a href={it.href} className="flex min-h-[44px] items-center text-[15px] text-[#DCE4EF] hover:text-white">
                {it.nome}
              </a>
            </li>
          ))}
          <li>
            <Link href={link.menu.viewAllHref} className="flex min-h-[44px] items-center text-xs font-semibold uppercase tracking-[0.08em] text-azul-ceu">
              {link.menu.viewAllLabel} →
            </Link>
          </li>
        </ul>
      )}
    </li>
  );
}

// Cabeçalho fixo no topo: faixa de avisos + navegação. Abaixo de 1220px de largura vira o menu do celular.
export default function Navbar({ turmas, eventos, materiais }: { turmas: Turma[]; eventos: Evento[]; materiais: Produto[] }) {
  const links = montarLinks(turmas, eventos, materiais);
  const pathname = usePathname();
  const { totalCount } = useCart();
  const usuario = useUsuarioAtual();
  const [suspenso, setSuspenso] = useState<string | null>(null);
  const [menuCelular, setMenuCelular] = useState(false);
  const [sanfona, setSanfona] = useState<string | null>(null);
  // Depois do Esc o foco volta ao link do menu; esse foco não deve reabrir o submenu.
  const ignorarProximoFoco = useRef(false);

  const [pathnameAnterior, setPathnameAnterior] = useState(pathname);
  if (pathname !== pathnameAnterior) {
    setPathnameAnterior(pathname);
    setSuspenso(null);
    setMenuCelular(false);
    setSanfona(null);
  }

  const acesso = usuario ? { href: "/aluno", label: "Área do Aluno" } : { href: "/entrar", label: "Entrar" };
  const rotuloDoCarrinho = totalCount > 0 ? `Carrinho, ${totalCount} ${totalCount === 1 ? "item" : "itens"}` : "Carrinho";

  return (
    <div className="sticky top-0 z-[60]">
      <NewsTicker turmas={turmas} eventos={eventos} />
      <nav aria-label="Principal" onMouseLeave={() => setSuspenso(null)} className="relative border-b border-white/[0.06] bg-[rgba(7,20,38,0.97)]">
        <div className="conteiner flex h-[72px] items-center justify-between gap-6">
          <Link href="/" aria-label="Quad Concursos — início" className="flex flex-none items-center rounded-lg transition-opacity hover:opacity-85">
            <Image src="/images/quad-logo-branco.png" alt="Quad Concursos" width={118} height={44} priority className="h-11 w-auto" />
          </Link>

          <ul className="hidden items-center gap-0.5 min-[1220px]:flex">
            {links.map((l) => {
              const ativo = estaAtivo(pathname, l.href);
              const aberto = !!l.menu && suspenso === l.href;
              return (
                <li
                  key={l.href}
                  onMouseEnter={() => setSuspenso(l.menu ? l.href : null)}
                  // Teclado: abre ao receber o foco, fecha quando o foco sai do item ou com Esc.
                  onFocus={() => {
                    if (ignorarProximoFoco.current) ignorarProximoFoco.current = false;
                    else setSuspenso(l.menu ? l.href : null);
                  }}
                  onBlur={(e) => {
                    if (l.menu && !e.currentTarget.contains(e.relatedTarget as Node | null)) setSuspenso(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape" && suspenso) {
                      setSuspenso(null);
                      ignorarProximoFoco.current = true;
                      (e.currentTarget.querySelector("a") as HTMLElement | null)?.focus();
                    }
                  }}
                >
                  <Link
                    href={l.href}
                    aria-current={ativo ? "page" : undefined}
                    aria-expanded={l.menu ? aberto : undefined}
                    className={`flex h-[72px] items-center gap-1.5 whitespace-nowrap px-[clamp(8px,0.9vw,12px)] text-sm transition-colors ${
                      ativo ? "font-semibold shadow-[inset_0_-2px_0_#2F86FF]" : "font-medium"
                    } ${ativo || aberto ? "text-white" : "text-prata hover:text-white"}`}
                  >
                    {l.label}
                    {l.menu && <Seta className="opacity-70" />}
                  </Link>
                  {/* O <li> não é posicionado: o submenu se alinha ao centro da barra inteira. */}
                  {l.menu && aberto && <NavMegaMenu {...l.menu} />}
                </li>
              );
            })}
            <li className="ml-2">
              <Link
                href="/carrinho"
                aria-label={rotuloDoCarrinho}
                className="relative grid h-11 w-11 place-items-center rounded-[10px] text-prata transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <IconeCarrinho quantidade={totalCount} />
              </Link>
            </li>
            <li className="ml-1.5">
              <Link
                href={acesso.href}
                className="btn-q btn-q-azul h-[42px] rounded-lg px-[18px] text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_8px_20px_-10px_rgba(0,107,255,0.8)] hover:-translate-y-px"
              >
                {acesso.label}
              </Link>
            </li>
          </ul>

          <div className="flex items-center gap-1 min-[1220px]:hidden">
            <Link href="/carrinho" aria-label={rotuloDoCarrinho} className="relative grid h-11 w-11 place-items-center text-prata">
              <IconeCarrinho quantidade={totalCount} />
            </Link>
            <Link href={acesso.href} className="btn-q btn-q-azul h-10 rounded-lg px-3.5 text-sm">
              {acesso.label}
            </Link>
            <button
              type="button"
              aria-label={menuCelular ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuCelular}
              onClick={() => setMenuCelular((v) => !v)}
              className="flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-[10px]"
            >
              <span className={`block h-0.5 w-5 rounded bg-[#DCE4EF] transition-transform duration-200 ${menuCelular ? "translate-y-[7px] rotate-45" : ""}`} />
              <span className={`block h-0.5 w-5 rounded bg-[#DCE4EF] transition-opacity duration-200 ${menuCelular ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-5 rounded bg-[#DCE4EF] transition-transform duration-200 ${menuCelular ? "-translate-y-[7px] -rotate-45" : ""}`} />
            </button>
          </div>
        </div>

        {menuCelular && (
          <div className="max-h-[calc(100vh-110px)] overflow-y-auto border-t border-white/[0.08] bg-marinho-950 px-[clamp(20px,4vw,32px)] pb-5 pt-1.5 min-[1220px]:hidden">
            <ul>
              {links.map((l) => (
                <ItemSanfona key={l.href} link={l} aberto={sanfona === l.href} onAlternar={() => setSanfona(sanfona === l.href ? null : l.href)} />
              ))}
            </ul>
          </div>
        )}
      </nav>
    </div>
  );
}
