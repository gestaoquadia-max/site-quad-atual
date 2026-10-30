import Image from "next/image";
import Link from "next/link";
import InsigniaDaTurma from "./turmas/InsigniaDaTurma";

// Decisão de 30/10/2026: cada submenu mostra no máximo 4 itens (no computador e no celular); o resto fica no "Ver todos".
export const ITENS_NO_MENU = 4;

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
  // Cor do ponto no lugar da cor da situação (ex.: o turno da turma). Classe Tailwind de fundo.
  corDoPonto?: string;
  // Insígnia ao lado do nome (turmas). null = item que tem insígnia mas sem arquivo: a marca do Quad no lugar.
  // Ausente = item sem insígnia (planos, materiais, eventos).
  insignia?: string | null;
};

export type MegaMenuFeatured = {
  eyebrow: string;
  title: string;
  desc: string;
  meta?: string;
  ctaLabel: string;
  ctaHref: string;
  // Imagem do destaque (insígnia da turma, capa do material). Sem ela, o logo do Quad em marca d'água.
  imagem?: string | null;
  // Vinho nas Mentorias; azul no resto.
  tom?: "azul" | "vinho";
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

const FUNDO_DO_DESTAQUE = {
  azul: "bg-[linear-gradient(160deg,#1A4278,#0B1C33_80%)]",
  vinho: "bg-[linear-gradient(160deg,#5A1424,#1A060C_80%)]",
};

// Painel azul-marinho solto abaixo da barra, no estilo de cartão: à esquerda o nome da seção e até 4 itens, em duas
// colunas (dois e dois); à direita o destaque, com imagem pequena, título e o botão.
export default function NavMegaMenu({
  rotulo,
  items,
  featured,
  viewAllHref,
  viewAllLabel,
  vinho = false,
}: {
  // Nas páginas das Mentorias o painel acompanha o topo vinho (components/Navbar.tsx).
  vinho?: boolean;
  rotulo: string;
  items: MegaMenuItem[];
  featured: MegaMenuFeatured;
  viewAllHref: string;
  viewAllLabel: string;
}) {
  const visiveis = items.slice(0, ITENS_NO_MENU);
  const tom = featured.tom ?? "azul";
  return (
    // A centralização (translate) fica no elemento de fora; a animação de entrada, que também usa transform, no de dentro.
    <div className="absolute left-1/2 top-full w-[min(980px,calc(100vw-40px))] -translate-x-1/2 pt-2.5">
      <div className={`grid animate-[q-surgir_200ms_cubic-bezier(.2,.7,.2,1)_both] grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] gap-2 rounded-[20px] border p-2.5 shadow-[0_30px_70px_-24px_rgba(0,0,0,0.75)] ${vinho ? "border-[rgba(243,163,177,0.16)] bg-[#24080F]" : "border-[rgba(111,174,255,0.16)] bg-marinho-900"}`}>
        <div className="flex flex-col px-5 pb-3 pt-5">
          <span className="mb-2 text-xs font-medium text-[#8FA0B8]">{rotulo}</span>
          {visiveis.length === 0 && <p className="py-2 text-sm text-prata">Nada aberto no momento.</p>}
          <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
            {visiveis.map((it) => (
              <li key={it.href + it.nome}>
                <LinkDoMenu
                  href={it.href}
                  className="flex items-center gap-3 rounded-[10px] px-3 py-3 text-white transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  {it.insignia !== undefined && <InsigniaDaTurma insignia={it.insignia} tamanho={44} sizes="44px" className="h-11 w-11 flex-none" />}
                  <span className="flex min-w-0 flex-col gap-1.5">
                    <span className="font-display text-[15px] font-bold tracking-[-0.01em]">{it.nome}</span>
                    <span className="flex items-center gap-2 whitespace-nowrap text-[12.5px] text-prata">
                      <span className={`h-1.5 w-1.5 flex-none rounded-full ${it.corDoPonto ?? CORES_DO_PONTO[it.status ?? "breve"]}`} />
                      {it.meta}
                    </span>
                  </span>
                </LinkDoMenu>
              </li>
            ))}
          </ul>
          <LinkDoMenu
            href={viewAllHref}
            className="mt-auto inline-flex min-h-[44px] items-center gap-1.5 px-3 pt-3 text-xs font-bold uppercase tracking-[0.1em] text-azul-ceu transition-colors hover:text-white"
          >
            {viewAllLabel} →
          </LinkDoMenu>
        </div>

        <div className={`relative flex min-h-[230px] flex-col justify-end overflow-hidden rounded-[14px] p-5 text-white ${FUNDO_DO_DESTAQUE[tom]}`}>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_80%_10%,rgba(255,255,255,0.12),transparent_70%)]" />
          {featured.imagem ? (
            <Image
              src={featured.imagem}
              alt=""
              width={96}
              height={96}
              sizes="96px"
              className="pointer-events-none absolute right-5 top-4 h-[72px] w-[72px] object-contain [filter:drop-shadow(0_10px_16px_rgba(0,0,0,0.55))]"
            />
          ) : (
            <Image
              src="/images/quad-logo-branco.png"
              alt=""
              aria-hidden="true"
              width={236}
              height={88}
              className="pointer-events-none absolute right-5 top-5 w-[96px] opacity-[0.14]"
            />
          )}
          <div className="relative flex flex-col gap-2">
            <span className={`text-[11px] font-bold uppercase tracking-[0.16em] ${tom === "vinho" ? "text-vinho-rosa" : "text-azul-ceu"}`}>{featured.eyebrow}</span>
            <span className="max-w-[300px] font-display text-[22px] font-extrabold leading-[1.15] tracking-[-0.02em]">{featured.title}</span>
            <span className="line-clamp-2 max-w-[340px] text-[13.5px] leading-[1.5] text-[#C9D5E5]">{featured.desc}</span>
            {featured.meta && <span className="text-xs font-bold uppercase tracking-[0.1em] text-white/80">{featured.meta}</span>}
            <LinkDoMenu
              href={featured.ctaHref}
              className={`btn-q mt-2 h-11 self-start rounded-[9px] px-[18px] text-sm ${tom === "vinho" ? "btn-q-vinho" : "btn-q-azul"}`}
            >
              {featured.ctaLabel}
            </LinkDoMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
