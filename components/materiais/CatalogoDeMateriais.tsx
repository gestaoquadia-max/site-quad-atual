"use client";

import Link from "next/link";
import { useState } from "react";
import type { Produto } from "@/lib/data";
import { ehKit } from "@/lib/materiais";
import CartaoMaterial from "../home/CartaoMaterial";
import CapaDoLivro, { CORES_DA_CAPA } from "../CapaDoLivro";

type Tipo = "todos" | "avulso" | "kit";

const TIPOS: { valor: Tipo; rotulo: string }[] = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "avulso", rotulo: "Por disciplina" },
  { valor: "kit", rotulo: "Kits" },
];

// Busca sem acento e sem diferenciar maiúsculas: "portugues" acha "Português".
function normalizar(texto: string) {
  return texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// `lista` null = a API não respondeu.
export default function CatalogoDeMateriais({ produtos: lista }: { produtos: Produto[] | null }) {
  const produtos = lista ?? [];
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState<Tipo>("todos");

  const termo = normalizar(busca.trim());
  const filtrando = termo !== "" || tipo !== "todos";
  const kit = produtos.find(ehKit);
  const avulsos = produtos.filter((p) => !ehKit(p));
  const resultado = produtos.filter(
    (p) => (tipo === "todos" || (tipo === "kit") === ehKit(p)) && (!termo || normalizar(`${p.nome} ${p.desc}`).includes(termo)),
  );
  const grade = filtrando ? resultado : avulsos;
  const titulo = !filtrando ? "Por disciplina" : tipo === "kit" ? "Kits" : tipo === "avulso" ? "Por disciplina" : "Resultados da busca";

  return (
    <>
      <section className="relative overflow-hidden bg-marinho-950 pb-[clamp(56px,6vw,80px)] pt-[clamp(40px,5vw,64px)] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_60%_at_80%_0%,rgba(0,107,255,0.24),transparent_70%)]" />
        <div className="conteiner relative">
          <nav aria-label="Trilha" className="mb-[clamp(28px,4vw,48px)] flex gap-2 text-[13px] text-[#7F90A8]">
            <Link href="/" className="text-prata hover:text-white">
              Início
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-[#DCE4EF]">
              Materiais
            </span>
          </nav>
          <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-8">
            <div className="max-w-[760px] flex-[1_1_480px]">
              <h1 className="mb-[18px] font-display text-[clamp(2.6rem,5.6vw,5rem)] font-extrabold leading-none tracking-[-0.045em]">Materiais de estudo</h1>
              <p className="max-w-[540px] text-[clamp(16px,1.4vw,18.5px)] leading-[1.6] text-[#B4C1D3]">
                Material direto ao ponto, atualizado com as últimas provas. Acesso imediato após a compra.
              </p>
            </div>
            <div className="flex w-full max-w-[460px] flex-[1_1_340px] flex-col gap-3">
              <label className="relative block">
                <span className="sr-only">Buscar materiais</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8FA0B8" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
                <input
                  type="search"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por disciplina ou material"
                  className="h-[54px] w-full rounded-xl border border-white/[0.14] bg-white/[0.05] pl-[46px] pr-4 text-[15px] text-white outline-none transition-colors placeholder:text-[#8FA0B8] focus:border-azul-vivo focus:bg-white/[0.08]"
                />
              </label>
              <div role="group" aria-label="Tipo de material" className="flex flex-wrap gap-2">
                {TIPOS.map((t) => (
                  <button
                    key={t.valor}
                    type="button"
                    aria-pressed={tipo === t.valor}
                    onClick={() => setTipo(t.valor)}
                    className={`h-[38px] whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition-colors ${
                      tipo === t.valor ? "border-white bg-white text-marinho-950" : "border-white/[0.14] bg-white/[0.04] text-[#DCE4EF] hover:border-white/40"
                    }`}
                  >
                    {t.rotulo}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-nevoa py-[clamp(48px,6vw,72px)]">
        <div className="conteiner flex flex-col gap-[clamp(32px,4vw,48px)]">
          {!filtrando && kit && (
            <Link
              href={`/produtos/${kit.slug}`}
              className="group relative grid grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] items-center gap-[clamp(28px,4vw,56px)] overflow-hidden rounded-[22px] bg-[radial-gradient(60%_80%_at_20%_50%,rgba(0,107,255,0.30),transparent_70%),linear-gradient(135deg,#0B1C33,#12305A)] p-[clamp(28px,4vw,56px)] text-white shadow-[0_40px_80px_-40px_rgba(7,20,38,0.8)] transition-transform hover:-translate-y-0.5 hover:text-white"
            >
              {/* Três capas em leque, representando os materiais do kit. */}
              <div aria-hidden="true" className="flex justify-center py-4">
                {avulsos.slice(0, 3).map((p, i) => (
                  <div
                    key={p.slug}
                    className="relative w-[clamp(120px,13vw,170px)]"
                    style={{
                      marginLeft: i ? -48 : 0,
                      transform: `rotate(${(i - 1) * 6}deg) translateY(${i === 1 ? -10 : 0}px)`,
                      zIndex: i === 1 ? 3 : 2 - Math.abs(i - 1),
                    }}
                  >
                    <CapaDoLivro titulo={p.nome} cor={CORES_DA_CAPA[i]} tamanhoDoTitulo={15} />
                  </div>
                ))}
              </div>
              <div>
                <span className="inline-flex h-7 items-center rounded-full bg-azul px-3 text-xs font-bold">{kit.tag.replace("PDFs", "materiais")}</span>
                <h2 className="mb-3 mt-4 font-display text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">{kit.nome}</h2>
                <p className="max-w-[520px] text-[16.5px] leading-[1.6] text-[#C9D5E5]">{kit.detalhe?.lead.split(" — ")[0] ?? kit.desc}</p>
                <div className="mt-6 flex flex-wrap items-center gap-5">
                  <span className="font-display text-[clamp(28px,3vw,36px)] font-extrabold tracking-[-0.03em]">{kit.preco}</span>
                  <span className="btn-q h-12 bg-white px-5 text-[15px] text-marinho-950 group-hover:bg-azul-palido">Ver o kit</span>
                </div>
              </div>
            </Link>
          )}

          <Link
            href="/simulados?modo=individual"
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-linha bg-white px-6 py-5 text-tinta shadow-[0_1px_2px_rgba(16,27,45,0.04)] transition-colors hover:border-azul/50 hover:text-tinta"
          >
            <span className="flex flex-col gap-1">
              <span className="font-display text-xl font-extrabold tracking-[-0.01em]">Simulados do Quad</span>
              <span className="text-sm text-ardosia">Individuais e combos · PDF, plataforma ou impresso</span>
            </span>
            <span className="font-display text-sm font-bold text-azul-forte">Ver edições →</span>
          </Link>

          <div>
            <div className="mb-[clamp(20px,2.4vw,28px)] flex flex-wrap items-end justify-between gap-3">
              <h2 className="titulo-secao">{titulo}</h2>
              <span className="text-sm text-ardosia" aria-live="polite">
                {grade.length === 1 ? "1 material" : `${grade.length} materiais`}
              </span>
            </div>
            {lista === null ? (
              <p role="alert" className="rounded-2xl border border-[#9B3535]/30 bg-[#9B3535]/[0.06] p-6 text-center text-sm text-[#9B3535]">
                Não foi possível carregar os materiais agora. Tente novamente em instantes.
              </p>
            ) : produtos.length === 0 ? (
              <p className="rounded-[18px] border-[1.5px] border-dashed border-[#C9D3E0] px-5 py-12 text-center font-display text-xl font-extrabold">
                Nenhum material à venda no momento
              </p>
            ) : grade.length > 0 ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-5">
                {grade.map((p) => (
                  <CartaoMaterial key={p.slug} produto={p} indice={produtos.indexOf(p)} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-[18px] border-[1.5px] border-dashed border-[#C9D3E0] px-5 py-12 text-center">
                <span className="font-display text-xl font-extrabold">Nenhum material encontrado</span>
                <button
                  type="button"
                  onClick={() => {
                    setBusca("");
                    setTipo("todos");
                  }}
                  className="btn-q btn-q-contorno h-11 px-5 text-sm"
                >
                  Limpar busca
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
