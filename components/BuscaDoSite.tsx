"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { GRUPOS_DA_BUSCA, procurar, type ItemDaBusca, type TipoNaBusca } from "@/lib/busca";
import { EM_ESPERA, type AreaDoSite } from "@/lib/em-espera";
import { useVeAreasEmEspera } from "./AreaEmEspera";
import { PAINEL_DO_TOPO } from "./NavMegaMenu";
import type { TomDoTopo } from "./NewsTicker";

// A lupa do menu do topo (18/11/2026): ao clicar (ou com a tecla "/"), abre logo abaixo da cápsula a caixa de busca, já
// pronta para digitar. O índice (app/busca/indice/route.ts) só é baixado na primeira abertura. Setas escolhem o
// resultado, Enter abre e Esc fecha.

const MAXIMO_NA_LISTA = 8;

// As áreas em espera (lib/em-espera.ts) ficam fora da busca, como ficam fora do menu; o administrador vê tudo.
const AREA_DO_TIPO: Partial<Record<TipoNaBusca, AreaDoSite>> = { material: "materiais", loja: "loja", mentoria: "mentorias" };

function Lupa({ tamanho = 20 }: { tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </svg>
  );
}

let indiceBaixado: Promise<ItemDaBusca[]> | null = null;
function baixarIndice() {
  indiceBaixado ??= fetch("/busca/indice")
    .then((r) => (r.ok ? (r.json() as Promise<ItemDaBusca[]>) : Promise.reject(new Error(String(r.status)))))
    .catch((e) => {
      // Na próxima abertura tenta de novo.
      indiceBaixado = null;
      throw e;
    });
  return indiceBaixado;
}

export default function BuscaDoSite({ tomDoTopo, aberta, onAbrir, onFechar }: { tomDoTopo: TomDoTopo; aberta: boolean; onAbrir: () => void; onFechar: () => void }) {
  const router = useRouter();
  const veEmEspera = useVeAreasEmEspera();
  const [indice, setIndice] = useState<ItemDaBusca[] | null>(null);
  const [falhou, setFalhou] = useState(false);
  const [texto, setTexto] = useState("");
  const [marcado, setMarcado] = useState(0);
  const campo = useRef<HTMLInputElement>(null);
  const painel = useRef<HTMLDivElement>(null);
  const botao = useRef<HTMLButtonElement>(null);
  const idDaLista = useId();

  // Abrir: foco na caixa e o índice (uma vez só).
  useEffect(() => {
    if (!aberta) return;
    campo.current?.focus();
    if (indice) return;
    let ativo = true;
    baixarIndice()
      .then((i) => {
        if (!ativo) return;
        setIndice(i);
        setFalhou(false);
      })
      .catch(() => {
        if (ativo) setFalhou(true);
      });
    return () => {
      ativo = false;
    };
  }, [aberta, indice]);

  // Tecla "/" abre a busca (fora de campos de texto); clique fora do painel fecha. O menu tem uma lupa no computador e
  // outra no celular: só a que está visível na tela atende.
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement | null;
      const digitando = alvo?.closest("input, textarea, select, [contenteditable='true']");
      if (e.key === "/" && !digitando && !e.ctrlKey && !e.metaKey && !e.altKey && botao.current?.offsetParent) {
        e.preventDefault();
        onAbrir();
      }
    };
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [onAbrir]);

  useEffect(() => {
    if (!aberta) return;
    const aoClicar = (e: PointerEvent) => {
      const alvo = e.target as Node;
      if (!painel.current?.contains(alvo) && !botao.current?.contains(alvo)) onFechar();
    };
    document.addEventListener("pointerdown", aoClicar);
    return () => document.removeEventListener("pointerdown", aoClicar);
  }, [aberta, onFechar]);

  const resultados = useMemo(() => {
    const visiveis = (indice ?? []).filter((i) => veEmEspera || !AREA_DO_TIPO[i.tipo] || !EM_ESPERA[AREA_DO_TIPO[i.tipo]!]);
    return procurar(visiveis, texto);
  }, [indice, texto, veEmEspera]);
  const naLista = resultados.slice(0, MAXIMO_NA_LISTA);
  const grupos = GRUPOS_DA_BUSCA.map((g) => ({ ...g, itens: naLista.filter((i) => i.tipo === g.tipo) })).filter((g) => g.itens.length > 0);
  // A ordem na tela (por grupo) é a mesma de `naLista`: procurar() já ordena pelos grupos.
  const atual = naLista[Math.min(marcado, naLista.length - 1)];

  function fechar() {
    onFechar();
    setTexto("");
    setMarcado(0);
    botao.current?.focus();
  }

  function aoTeclarNaCaixa(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      fechar();
    } else if (e.key === "ArrowDown" && naLista.length) {
      e.preventDefault();
      setMarcado((m) => (m + 1) % naLista.length);
    } else if (e.key === "ArrowUp" && naLista.length) {
      e.preventDefault();
      setMarcado((m) => (m - 1 + naLista.length) % naLista.length);
    } else if (e.key === "Enter" && atual) {
      e.preventDefault();
      router.push(atual.href);
      fechar();
    }
  }

  const termo = texto.trim();

  return (
    <>
      <button
        ref={botao}
        type="button"
        aria-label="Buscar no site"
        aria-expanded={aberta}
        aria-keyshortcuts="/"
        onClick={() => (aberta ? fechar() : onAbrir())}
        className={`grid h-11 w-10 place-items-center rounded-full min-[420px]:w-11 transition-colors hover:bg-white/[0.06] hover:text-white ${aberta ? "bg-white/[0.08] text-white" : "text-prata"}`}
      >
        <Lupa />
      </button>

      {aberta && (
        // Sem pai posicionado entre a lupa e o <nav>: o painel se alinha ao centro da barra inteira, como os submenus.
        <div ref={painel} className="pointer-events-auto absolute left-1/2 top-full w-[min(680px,calc(100vw-20px))] -translate-x-1/2 pt-2.5">
          <div className={`animate-[q-surgir_200ms_cubic-bezier(.2,.7,.2,1)_both] overflow-hidden rounded-[20px] border shadow-[0_30px_70px_-24px_rgba(0,0,0,0.75)] ${PAINEL_DO_TOPO[tomDoTopo]}`}>
            <div className="flex items-center gap-3 border-b border-white/[0.08] px-5">
              <span className="text-prata">
                <Lupa tamanho={19} />
              </span>
              <input
                ref={campo}
                type="search"
                value={texto}
                onChange={(e) => {
                  setTexto(e.target.value);
                  setMarcado(0);
                }}
                onKeyDown={aoTeclarNaCaixa}
                placeholder="Buscar turmas, simulados, materiais, eventos…"
                aria-label="Buscar no site"
                role="combobox"
                aria-expanded={naLista.length > 0}
                aria-controls={idDaLista}
                aria-activedescendant={atual ? `${idDaLista}-${naLista.indexOf(atual)}` : undefined}
                autoComplete="off"
                enterKeyHint="search"
                maxLength={80}
                // Sem o contorno de foco do site (app/globals.css): a caixa aberta, com o cursor piscando, já mostra onde se digita.
                // "outline: none" de verdade: o outline-none do Tailwind só deixa o contorno transparente, e o tema da
                // Black Friday (app/tema-black.css) troca a cor dele por laranja.
                className="h-[58px] min-w-0 flex-1 bg-transparent text-[16px] text-white placeholder:text-[#8FA0B8] [outline:none] focus-visible:[outline:none] [&::-webkit-search-cancel-button]:hidden"
              />
              <button type="button" onClick={fechar} className="flex-none rounded-md border border-white/15 px-2 py-0.5 text-[11px] font-semibold text-prata hover:text-white">
                Esc
              </button>
            </div>

            <div className="max-h-[min(60dvh,480px)] overflow-y-auto p-2" aria-live="polite">
              {!termo ? (
                <p className="px-3 py-4 text-sm text-prata">Digite o nome do concurso, da turma ou do material. Ex.: &quot;simulado pmba&quot;.</p>
              ) : falhou && !indice ? (
                <p className="px-3 py-4 text-sm text-prata">Não foi possível carregar a busca agora. Feche e tente de novo em instantes.</p>
              ) : !indice ? (
                <p className="px-3 py-4 text-sm text-prata">Carregando…</p>
              ) : naLista.length === 0 ? (
                <p className="px-3 py-4 text-sm text-prata">
                  Nada encontrado para &quot;{termo}&quot;. Tente outra palavra ou o nome do concurso.
                </p>
              ) : (
                <ul id={idDaLista} role="listbox" aria-label="Resultados da busca">
                  {grupos.map((g) => (
                    <li key={g.tipo} role="presentation">
                      <span className="block px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8FA0B8]">{g.rotulo}</span>
                      <ul role="presentation">
                        {g.itens.map((item) => {
                          const posicao = naLista.indexOf(item);
                          const ativo = item === atual;
                          return (
                            <li key={item.href + item.titulo} id={`${idDaLista}-${posicao}`} role="option" aria-selected={ativo}>
                              <Link
                                href={item.href}
                                onClick={fechar}
                                onMouseEnter={() => setMarcado(posicao)}
                                tabIndex={-1}
                                className={`flex min-h-[52px] items-center justify-between gap-4 rounded-xl px-3 py-2 transition-colors ${ativo ? "bg-white/[0.08]" : ""}`}
                              >
                                <span className="min-w-0">
                                  <span className="block truncate font-display text-[15px] font-bold text-white">{item.titulo}</span>
                                  {item.detalhe && <span className="block truncate text-[12.5px] text-prata">{item.detalhe}</span>}
                                </span>
                                {(item.esgotado || item.preco) && (
                                  <span className={`flex-none text-[13.5px] font-semibold ${item.esgotado ? "text-prata" : "text-white"}`}>{item.esgotado ? "Esgotado" : item.preco}</span>
                                )}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
              {termo && indice && resultados.length > MAXIMO_NA_LISTA && (
                <p className="px-3 pb-2 pt-3 text-[12.5px] text-[#8FA0B8]">
                  Mostrando {MAXIMO_NA_LISTA} de {resultados.length}. Digite mais uma palavra para refinar.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
