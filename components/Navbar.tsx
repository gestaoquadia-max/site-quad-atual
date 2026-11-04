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
import NavMegaMenu, { ITENS_NO_MENU, type MegaMenuFeatured, type MegaMenuItem } from "./NavMegaMenu";

// Cores do topo: azul em todo o site e vinho nas páginas das Mentorias (barra de avisos, menu e botões).
// Atrás da cápsula fica a própria primeira dobra da página (ver `.com-menu-flutuante` em app/globals.css).
const TEMAS = {
  azul: {
    capsula: "bg-[rgba(10,26,48,0.93)]",
    painelDoCelular: "bg-marinho-950",
    botao: "btn-q-azul shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_8px_20px_-10px_rgba(0,107,255,0.8)]",
    selo: "bg-azul shadow-[0_0_0_2px_#071426]",
  },
  vinho: {
    capsula: "bg-[rgba(40,10,19,0.93)]",
    painelDoCelular: "bg-[#1A060C]",
    botao: "btn-q-vinho shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_20px_-10px_rgba(196,42,68,0.9)]",
    selo: "bg-vinho-forte shadow-[0_0_0_2px_#1A060C]",
  },
};
type Tema = (typeof TEMAS)["azul"];

function ehDasMentorias(caminho: string) {
  return caminho === "/mentorias" || caminho.startsWith("/mentorias/");
}

function IconeCarrinho({ quantidade, selo }: { quantidade: number; selo: string }) {
  return (
    <>
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {quantidade > 0 && (
        <span className={`absolute right-1 top-[5px] grid h-[17px] min-w-[17px] place-items-center rounded-full px-1 text-[10.5px] font-bold text-white ${selo}`}>
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
  menu?: { rotulo: string; items: MegaMenuItem[]; featured: MegaMenuFeatured; viewAllHref: string; viewAllLabel: string };
};


// Turmas e eventos vêm da vitrine da API (lida no servidor, em app/layout.tsx). Sem nenhum aberto, o destaque
// vira um convite para a página da lista.
// Ponto de cada turma no menu: a cor do turno, na escala de azul das etiquetas dos cartões (manhã clara, noite
// escura). Turma lotada fica com a cor da situação.
// Com o mesmo brilho dos pontos dos outros itens do submenu (fundo azul-marinho).
const COR_DO_TURNO: Record<string, string> = {
  Manhã: "bg-[#CFE2FF] shadow-[0_0_8px_#CFE2FF]",
  Tarde: "bg-[#6FAEFF] shadow-[0_0_8px_#6FAEFF]",
  Noite: "bg-[#2F6BFF] shadow-[0_0_8px_#2F6BFF]",
};

function montarLinks(turmas: Turma[], eventos: Evento[], materiais: Produto[]): LinkDoMenu[] {
  const kit = materiais.find(ehKit);
  const turmaDestaque = turmas.find((t) => t.status === "aberta") ?? turmas[0];
  return [
    { href: "/", label: "Início" },
    {
      href: "/turmas",
      label: "Turmas Presenciais",
      menu: {
        rotulo: "Turmas com matrículas",
        // O turno junto das vagas ("Manhã · 40 vagas restantes"): turmas da mesma modalidade se distinguem por ele.
        items: turmas.map((t) => ({
          href: `/turmas/${t.slug}`,
          nome: t.nome,
          meta: [t.turno, t.statusLabel].filter(Boolean).join(" · "),
          status: t.status,
          corDoPonto: t.status === "encerrada" ? undefined : COR_DO_TURNO[t.turno ?? ""],
          insignia: t.insignia,
        })),
        featured: turmaDestaque
          ? {
              eyebrow: "Turma em destaque",
              title: turmaDestaque.nome,
              desc: turmaDestaque.desc,
              meta: turmaDestaque.statusLabel,
              imagem: turmaDestaque.insignia,
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
        rotulo: "Planos",
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
          tom: "vinho",
        },
        viewAllHref: "/mentorias",
        viewAllLabel: "Ver Mentorias do Quad",
      },
    },
    {
      href: "/produtos",
      label: "Materiais",
      menu: {
        rotulo: "Apostilas e kits",
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
    {
      href: "/eventos",
      label: "Eventos",
      menu: {
        rotulo: "Agenda",
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
    // Decisão de 30/10/2026: a Loja vem por último no menu.
    { href: "/loja", label: "Loja" },
  ];
}

function estaAtivo(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function ItemSanfona({ link, aberto, onAlternar }: { link: LinkDoMenu; aberto: boolean; onAlternar: () => void }) {
  if (!link.menu) {
    return (
      <li className="border-b border-white/[0.08] last:border-b-0">
        <Link href={link.href} className="flex min-h-[52px] items-center font-display text-base font-bold text-[#DCE4EF]">
          {link.label}
        </Link>
      </li>
    );
  }
  return (
    <li className="border-b border-white/[0.08] last:border-b-0">
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
          {link.menu.items.slice(0, ITENS_NO_MENU).map((it) => (
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
  const vinho = ehDasMentorias(pathname);
  const tema: Tema = vinho ? TEMAS.vinho : TEMAS.azul;
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
    <div className="com-menu-flutuante sticky top-0 z-[60] -mb-[34px]">
      <NewsTicker turmas={turmas} eventos={eventos} vinho={vinho} />
      {/* Menu em cápsula, sempre flutuando: fica por cima da página (não ocupa espaço) e o conteúdo passa por trás,
          desfocado. A área em volta da cápsula não recebe cliques; só a cápsula, o submenu e o menu do celular. Sem
          respiro embaixo da cápsula: o submenu começa colado nela, e o mouse não "sai" do menu no caminho até ele. */}
      <nav
        aria-label="Principal"
        onMouseLeave={() => setSuspenso(null)}
        className="pointer-events-none absolute inset-x-0 top-full px-[clamp(10px,2.5vw,40px)] pt-2"
      >
        <div
          className={`pointer-events-auto mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-6 rounded-full border border-white/[0.1] pl-4 pr-1.5 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.75),0_0_0_1px_rgba(0,0,0,0.2)] backdrop-blur-[12px] min-[1220px]:h-[60px] min-[1220px]:pl-6 min-[1220px]:pr-2 ${tema.capsula}`}
        >
          <Link href="/" aria-label="Quad Concursos — início" className="flex flex-none items-center rounded-lg transition-opacity hover:opacity-85">
            <Image src="/images/quad-logo-branco.png" alt="Quad Concursos" width={118} height={44} priority className="h-9 w-auto min-[1220px]:h-10" />
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
                    className={`flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full px-[clamp(10px,1vw,14px)] text-sm transition-colors ${
                      ativo ? "bg-white/[0.09] font-semibold" : "font-medium"
                    } ${ativo || aberto ? "text-white" : "text-prata hover:bg-white/[0.05] hover:text-white"}`}
                  >
                    {l.label}
                    {l.menu && <Seta className="opacity-70" />}
                  </Link>
                  {/* O <li> não é posicionado: o submenu se alinha ao centro da barra inteira. */}
                  {l.menu && aberto && <NavMegaMenu {...l.menu} vinho={vinho} />}
                </li>
              );
            })}
            <li className="ml-2">
              <Link
                href="/carrinho"
                aria-label={rotuloDoCarrinho}
                className="relative grid h-11 w-11 place-items-center rounded-full text-prata transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <IconeCarrinho quantidade={totalCount} selo={tema.selo} />
              </Link>
            </li>
            <li className="ml-1.5">
              <Link
                href={acesso.href}
                className={`btn-q h-11 rounded-full px-5 text-sm hover:-translate-y-px ${tema.botao}`}
              >
                {acesso.label}
              </Link>
            </li>
          </ul>

          <div className="flex items-center gap-1 min-[1220px]:hidden">
            <Link href="/carrinho" aria-label={rotuloDoCarrinho} className="relative grid h-11 w-11 place-items-center text-prata">
              <IconeCarrinho quantidade={totalCount} selo={tema.selo} />
            </Link>
            <Link href={acesso.href} className={`btn-q h-10 rounded-full px-4 text-sm ${tema.botao}`}>
              {acesso.label}
            </Link>
            <button
              type="button"
              aria-label={menuCelular ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuCelular}
              onClick={() => setMenuCelular((v) => !v)}
              className="flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-full"
            >
              <span className={`block h-0.5 w-5 rounded bg-[#DCE4EF] transition-transform duration-200 ${menuCelular ? "translate-y-[7px] rotate-45" : ""}`} />
              <span className={`block h-0.5 w-5 rounded bg-[#DCE4EF] transition-opacity duration-200 ${menuCelular ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-5 rounded bg-[#DCE4EF] transition-transform duration-200 ${menuCelular ? "-translate-y-[7px] -rotate-45" : ""}`} />
            </button>
          </div>
        </div>

        {menuCelular && (
          <div
            className={`pointer-events-auto mx-auto mt-2 max-h-[calc(100dvh-130px)] max-w-[1440px] overflow-y-auto rounded-[22px] border border-white/[0.1] ${tema.painelDoCelular} px-[clamp(18px,4vw,28px)] pb-4 pt-1 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.7)] min-[1220px]:hidden`}
          >
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
