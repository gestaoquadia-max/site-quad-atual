"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Post } from "@/lib/data";
import Trilha from "../Trilha";

// Busca sem acento e sem diferenciar maiúsculas.
function normalizar(texto: string) {
  return texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function IconeDeImagem() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

// Imagem do artigo; sem imagem cadastrada, um fundo escuro com ícone.
export function ImagemDoArtigo({ post, className = "", tamanhos }: { post: Post; className?: string; tamanhos: string }) {
  return (
    <div className={`relative grid place-items-center overflow-hidden bg-[#14284A] bg-[image:radial-gradient(70%_60%_at_20%_10%,rgba(47,134,255,0.22),transparent_70%)] text-white/25 ${className}`}>
      {post.imagemUrl ? <Image src={post.imagemUrl} alt="" fill sizes={tamanhos} className="object-cover" /> : <IconeDeImagem />}
    </div>
  );
}

export function Assinatura({ post, className = "" }: { post: Post; className?: string }) {
  return (
    <span className={className}>
      {post.autor} · {post.data} · {post.tempoLeitura} de leitura
    </span>
  );
}

function CartaoDoArtigo({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="flex h-full flex-col overflow-hidden rounded-[18px] border border-linha bg-white text-tinta shadow-[0_18px_36px_-28px_rgba(7,20,38,0.35)] transition-[transform,border-color] duration-200 hover:-translate-y-[3px] hover:border-azul/45 hover:text-tinta"
    >
      <ImagemDoArtigo post={post} className="aspect-[3/2]" tamanhos="(min-width: 1024px) 420px, 90vw" />
      <div className="flex flex-1 flex-col px-[22px] pb-5 pt-5">
        <span className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-azul-forte">{post.categoria}</span>
        <h3 className="mb-2 mt-2.5 font-display text-xl font-extrabold leading-[1.2] tracking-[-0.015em] [text-wrap:balance]">{post.titulo}</h3>
        <p className="flex-1 text-[14.5px] leading-[1.6] text-ardosia">{post.resumo}</p>
        <Assinatura post={post} className="mt-4 border-t border-linha pt-3 text-[12.5px] text-ardosia" />
      </div>
    </Link>
  );
}

export default function ListaDoBlog({ posts, categoriaInicial, buscaInicial }: { posts: Post[]; categoriaInicial: string | null; buscaInicial: string }) {
  const [busca, setBusca] = useState(buscaInicial);
  const [categoria, setCategoria] = useState<string | null>(categoriaInicial);
  const categorias = [...new Set(posts.map((p) => p.categoria))];

  const termo = normalizar(busca.trim());
  const filtrando = termo !== "" || categoria !== null;
  const resultado = posts.filter(
    (p) => (!categoria || p.categoria === categoria) && (!termo || normalizar(`${p.titulo} ${p.resumo} ${p.categoria}`).includes(termo)),
  );
  const [destaque, ...demais] = posts;
  const lateral = demais.slice(0, 2);
  const mais = demais.slice(2);

  // Mantém a busca e a categoria no endereço (/blog?cat=Editais&q=prf), para compartilhar o resultado.
  function atualizarEndereco(c: string | null, q: string) {
    const url = new URL(window.location.href);
    if (c) url.searchParams.set("cat", c);
    else url.searchParams.delete("cat");
    if (q.trim()) url.searchParams.set("q", q.trim());
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url);
  }

  return (
    <>
      <section className="relative overflow-hidden bg-marinho-950 pb-[clamp(48px,6vw,64px)] pt-[clamp(40px,5vw,64px)] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_60%_at_80%_0%,rgba(0,107,255,0.24),transparent_70%)]" />
        <div className="conteiner relative">
          <Trilha itens={[{ rotulo: "Início", href: "/" }, { rotulo: "Blog" }]} className="mb-[clamp(24px,3vw,36px)]" />
          <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-6">
            <div className="max-w-[620px]">
              <h1 className="mb-3 font-display text-[clamp(2.6rem,5.6vw,4.4rem)] font-extrabold leading-none tracking-[-0.045em]">Blog</h1>
              <p className="text-[clamp(16px,1.4vw,18px)] leading-[1.6] text-[#B4C1D3]">
                Editais, método de estudo e bastidores da preparação — direto de quem está na banca todos os dias.
              </p>
            </div>
            <label className="relative block w-full max-w-[380px]">
              <span className="sr-only">Pesquisar artigos</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8FA0B8" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
              <input
                type="search"
                value={busca}
                onChange={(e) => {
                  setBusca(e.target.value);
                  atualizarEndereco(categoria, e.target.value);
                }}
                placeholder="Pesquisar artigos"
                className="h-[52px] w-full rounded-xl border border-white/[0.14] bg-white/[0.05] pl-[46px] pr-4 text-[15px] text-white outline-none transition-colors placeholder:text-[#8FA0B8] focus:border-azul-vivo focus:bg-white/[0.08]"
              />
            </label>
          </div>
          <div role="group" aria-label="Categoria" className="mt-7 flex flex-wrap gap-2">
            {[null, ...categorias].map((c) => {
              const ligado = categoria === c;
              return (
                <button
                  key={c ?? "todos"}
                  type="button"
                  aria-pressed={ligado}
                  onClick={() => {
                    setCategoria(c);
                    atualizarEndereco(c, busca);
                  }}
                  className={`h-10 whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition-colors ${
                    ligado ? "border-white bg-white text-marinho-950" : "border-white/[0.14] bg-white/[0.04] text-[#DCE4EF] hover:border-white/40"
                  }`}
                >
                  {c ?? "Todos"}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-nevoa py-[clamp(48px,6vw,72px)]">
        <div className="conteiner flex flex-col gap-[clamp(40px,5vw,64px)]">
          {filtrando ? (
            <div>
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <h2 className="titulo-secao">{categoria ?? "Resultados da busca"}</h2>
                <span className="text-sm text-ardosia" aria-live="polite">
                  {resultado.length === 1 ? "1 artigo" : `${resultado.length} artigos`}
                </span>
              </div>
              {resultado.length > 0 ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-5">
                  {resultado.map((p) => (
                    <CartaoDoArtigo key={p.slug} post={p} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 rounded-[18px] border-[1.5px] border-dashed border-[#C9D3E0] px-5 py-12 text-center">
                  <span className="font-display text-xl font-extrabold">Nenhum artigo encontrado</span>
                  <button
                    type="button"
                    onClick={() => {
                      setBusca("");
                      setCategoria(null);
                      atualizarEndereco(null, "");
                    }}
                    className="btn-q btn-q-contorno h-11 px-5 text-sm"
                  >
                    Limpar busca
                  </button>
                </div>
              )}
            </div>
          ) : (
            destaque && (
              <>
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)]">
                  <Link
                    href={`/blog/${destaque.slug}`}
                    className="group grid overflow-hidden rounded-[22px] bg-marinho-900 text-white shadow-[0_40px_80px_-40px_rgba(7,20,38,0.8)] hover:text-white md:grid-cols-2"
                  >
                    <ImagemDoArtigo post={destaque} className="min-h-[240px]" tamanhos="(min-width: 1024px) 440px, 90vw" />
                    <div className="flex flex-col justify-center p-[clamp(24px,3vw,40px)]">
                      <span className="text-xs font-bold uppercase tracking-[0.14em] text-azul-ceu">Destaque · {destaque.categoria}</span>
                      <h2 className="mb-3 mt-3 font-display text-[clamp(1.8rem,2.8vw,2.4rem)] font-extrabold leading-[1.05] tracking-[-0.03em] [text-wrap:balance]">{destaque.titulo}</h2>
                      <p className="text-[16px] leading-[1.6] text-[#C9D5E5]">{destaque.resumo}</p>
                      <Assinatura post={destaque} className="mt-5 border-t border-white/10 pt-4 text-[13.5px] text-prata" />
                      <span className="mt-3 inline-flex items-center gap-2 font-display text-[15px] font-bold text-azul-ceu group-hover:text-white">
                        Ler artigo <span aria-hidden="true">→</span>
                      </span>
                    </div>
                  </Link>
                  <div className="grid gap-5">
                    {lateral.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/blog/${p.slug}`}
                        className="grid grid-cols-[120px_minmax(0,1fr)] gap-4 rounded-[18px] border border-linha bg-white p-3.5 text-tinta transition-colors hover:border-azul/45 hover:text-tinta"
                      >
                        <ImagemDoArtigo post={p} className="aspect-square rounded-xl" tamanhos="120px" />
                        <span className="flex flex-col gap-1.5 py-1">
                          <span className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-azul-forte">{p.categoria}</span>
                          <span className="font-display text-[17px] font-extrabold leading-[1.2]">{p.titulo}</span>
                          <span className="text-[12.5px] text-ardosia">
                            {p.data} · {p.tempoLeitura} de leitura
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
                {mais.length > 0 && (
                  <div>
                    <h2 className="titulo-secao mb-6">Mais artigos</h2>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-5">
                      {mais.map((p) => (
                        <CartaoDoArtigo key={p.slug} post={p} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )
          )}
        </div>
      </section>
    </>
  );
}
