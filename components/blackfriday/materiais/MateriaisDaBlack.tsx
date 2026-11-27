"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Trilha from "@/components/Trilha";
import { useCart } from "@/lib/cart";
import { idDoItem } from "@/lib/itens";
import { LEQUE_DO_COMBO, LEQUE_DOS_MODULOS, TEXTOS, VADE_MECUM, codigoNormalizado } from "@/lib/black/catalogo";
import type { MaterialDaBlack } from "@/lib/vitrine";
import { LequeDeCapas, Livro3D, PrecoDeAte, SeloDaContagem, emReais } from "./PartesDosMateriais";
import { TelaDoCombo, TelaDosModulos, type Adicionar } from "./TelasDeCompra";

// A aba Materiais da Black Friday (entrega da designer de 25/11/2026, LEIA-ME seção 3): a lista com os cartões do Combo
// de Simulados, dos Módulos teóricos e do Vade Mecum, o banner dos Simulados do Quad e as telas de compra. A tela
// aberta fica no endereço (?tela=combo|modulos&concurso=…&forma=pacote|avulso), para o Voltar do navegador e para a
// busca levar direto a ela. Os materiais gratuitos entram depois (por último, decisão de 25/11/2026).

type Tela = "lista" | "combo" | "modulos";
type Estado = {
  tela: Tela;
  concurso: string | null;
  forma: "pacote" | "avulso" | null;
};

const INICIAL: Estado = { tela: "lista", concurso: null, forma: null };

function lerDoEndereco(): Estado {
  const p = new URLSearchParams(window.location.search);
  const tela = p.get("tela");
  const forma = p.get("forma");
  return {
    tela: tela === "combo" || tela === "modulos" ? tela : "lista",
    concurso: p.get("concurso"),
    forma: forma === "pacote" || forma === "avulso" ? forma : null,
  };
}

function enderecoDe(e: Estado) {
  if (e.tela === "lista") return window.location.pathname;
  const p = new URLSearchParams({ tela: e.tela });
  if (e.concurso) p.set("concurso", e.concurso);
  if (e.forma) p.set("forma", e.forma);
  return `${window.location.pathname}?${p}`;
}

function CartaoDeMaterial({
  visual,
  titulo,
  texto,
  preco,
  botao,
}: {
  visual: React.ReactNode;
  titulo: string;
  texto: string;
  preco: { por: number; de: number | null; prefixo: string } | null;
  botao: { rotulo: string; acao: () => void; desligado?: boolean };
}) {
  return (
    <article className="flex flex-col gap-4 rounded-3xl border-[1.5px] border-[#3A2E27] bg-breu-800 px-2.5 pb-6 pt-2.5">
      <div className="flex h-[300px] items-center justify-center overflow-hidden rounded-2xl bg-[radial-gradient(70%_60%_at_50%_40%,rgba(242,90,12,0.45),#120F0D_75%)]">
        {visual}
      </div>
      <div className="flex flex-col gap-2 px-3.5">
        <h2 className="font-display text-2xl font-extrabold text-white">{titulo}</h2>
        <p className="text-[15px] leading-[1.45] text-[#D6CCC5]">{texto}</p>
      </div>
      {/* O preço nunca quebra linha; sem espaço, o botão desce para baixo dele (LEIA-ME 3.2). */}
      <div className="mt-auto flex flex-wrap items-end justify-between gap-3 px-3.5">
        {preco ? (
          <PrecoDeAte por={preco.por} de={preco.de} prefixo={preco.prefixo} />
        ) : (
          <span className="font-display text-xl font-extrabold text-[#A39790]">Em breve</span>
        )}
        <button
          type="button"
          onClick={botao.acao}
          disabled={botao.desligado}
          className="btn-q h-12 whitespace-nowrap rounded-xl bg-[linear-gradient(180deg,#FF7A2E,#E5530A)] px-5 text-base text-white hover:text-white disabled:cursor-not-allowed disabled:bg-none disabled:bg-[#2A221D] disabled:text-[#8A7F78]"
        >
          {botao.rotulo}
        </button>
      </div>
    </article>
  );
}

function BannerDosSimulados() {
  return (
    <div className="flex flex-wrap items-stretch overflow-hidden rounded-3xl border border-[#33281F] bg-[#241C18]">
      <div className="flex min-w-0 flex-[1_1_380px] flex-col justify-center gap-[18px] p-[clamp(28px,4vw,48px)]">
        <span className="inline-flex items-center gap-[7px] self-start rounded-full bg-[rgba(242,90,12,0.16)] px-2.5 py-1 text-[13px] font-bold text-laranja-claro">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
          Presenciais, individuais e combos
        </span>
        <h2 className="font-display text-[clamp(2.2rem,3.8vw,3.4rem)] font-extrabold leading-none tracking-[-0.045em] text-white">Simulados do Quad</h2>
        <p className="max-w-[520px] text-lg leading-normal text-[#D6CCC5]">
          Simulados presenciais todo domingo, edições anteriores em PDF ou impressas a partir de R$ 5 e combos para a sua preparação.
        </p>
        <div className="mt-1.5 flex flex-wrap gap-3">
          <Link href="/simulados" className="btn-q h-[54px] rounded-xl bg-laranja px-[26px] text-[17px] text-white hover:bg-laranja-claro hover:text-white">
            Explorar simulados
          </Link>
          <Link
            href="/eventos#calendario"
            className="btn-q h-[54px] rounded-xl border border-[#4A3B32] px-[26px] text-[17px] text-white hover:border-white/50 hover:text-white"
          >
            Ver calendário
          </Link>
        </div>
      </div>
      <div className="relative min-h-[300px] flex-[1_1_420px] bg-[#120F0D]">
        <Image
          src="/images/capa-simulados/banner-simulado-black.png"
          alt="Painel de desempenho nos simulados do Quad, com cartão-resposta e gráfico de evolução"
          fill
          sizes="(min-width: 900px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}

export default function MateriaisDaBlack({ materiais }: { materiais: MaterialDaBlack[] | null }) {
  const { addItem } = useCart();
  const [estado, setEstado] = useState<Estado>(INICIAL);

  // O endereço manda na tela: ao abrir a página (link da busca) e no Voltar/Avançar do navegador.
  useEffect(() => {
    const sincronizar = () => setEstado(lerDoEndereco());
    sincronizar();
    window.addEventListener("popstate", sincronizar);
    return () => window.removeEventListener("popstate", sincronizar);
  }, []);

  const ir = useCallback((novo: Estado) => {
    window.history.pushState(null, "", enderecoDe(novo));
    setEstado(novo);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const router = useRouter();
  const adicionar: Adicionar = (m, nome, tag) =>
    // O pacote de módulos é um combo da loja: vai para a página de pagamento do combo, fora do carrinho.
    m.comboSlug
      ? router.push(`/checkout/combo/${m.comboSlug}`)
      : addItem(
          m.simulado
            ? // O combo cadastrado como simulado em PDF: a atividade SIMULADO, com o id que as sugestões também usam.
              {
                id: `simulado:${m.idNaApi}:pdf`,
                tipo: "simulado",
                nome,
                tag,
                preco: emReais(m.preco),
                alvo: { atividade: { tipo: "SIMULADO", id: m.idNaApi } },
                imagem: m.imagem ?? undefined,
              }
            : {
                id: idDoItem("produto", m.slug),
                tipo: "produto",
                nome,
                tag,
                preco: emReais(m.preco),
                formato: "digital",
                alvo: { itemId: m.idNaApi, plataforma: "DIGITAL" },
                imagem: m.imagem ?? undefined,
              },
        );

  const lista = materiais ?? [];
  const menor = (tipo: MaterialDaBlack["tipo"]) => lista.filter((m) => m.tipo === tipo).sort((a, b) => a.preco - b.preco)[0] ?? null;
  const combo = menor("combo");
  const modulo = menor("modulo") ?? menor("pacote");
  const vade = lista.find((m) => m.tipo === "vade" && (!m.concurso || VADE_MECUM.codigos.includes(codigoNormalizado(m.concurso.codigo)))) ?? null;

  const trilha =
    estado.tela === "lista"
      ? [{ rotulo: "Início", href: "/" }, { rotulo: "Materiais" }]
      : [
          { rotulo: "Início", href: "/" },
          { rotulo: "Materiais", href: "/produtos" },
          {
            rotulo: estado.tela === "combo" ? TEXTOS.combo.titulo : TEXTOS.modulos.titulo,
          },
        ];

  return (
    <section className="relative -mt-[106px] min-h-[70vh] bg-[radial-gradient(520px_520px_at_0%_420px,rgba(255,110,20,0.5),rgba(242,90,12,0.16)_45%,transparent_75%),radial-gradient(520px_380px_at_100%_0%,rgba(255,122,46,0.3),transparent_70%),linear-gradient(180deg,#1A0F0A_0,#120F0D_520px)] pb-[clamp(64px,8vw,96px)] pt-[calc(106px+clamp(24px,3vw,40px))] text-white min-[1220px]:-mt-[110px] min-[1220px]:pt-[calc(110px+clamp(24px,3vw,40px))]">
      <div className="conteiner flex flex-col gap-10">
        {/* A trilha volta à lista pelo estado, sem recarregar a página. */}
        <div
          onClickCapture={(e) => {
            const alvo = (e.target as HTMLElement).closest("a");
            if (alvo?.getAttribute("href") === "/produtos") {
              e.preventDefault();
              ir(INICIAL);
            }
          }}
        >
          <Trilha itens={trilha} className="!text-[15px] !text-[#A39790] [&_a]:text-[#A39790]" />
        </div>

        {materiais === null && (
          <p role="alert" className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-[15px] text-[#D6CCC5]">
            Não foi possível carregar os preços agora. Tente de novo em instantes.
          </p>
        )}

        {estado.tela === "combo" && <TelaDoCombo materiais={lista} concursoInicial={estado.concurso} aoVoltar={() => ir(INICIAL)} adicionar={adicionar} />}
        {estado.tela === "modulos" && (
          <TelaDosModulos materiais={lista} concursoInicial={estado.concurso} formaInicial={estado.forma} aoVoltar={() => ir(INICIAL)} adicionar={adicionar} />
        )}

        {estado.tela === "lista" && (
          <>
            <div className="flex flex-wrap items-end justify-between gap-8">
              <h1 className="max-w-[680px] font-display text-[clamp(2.4rem,5vw,3.5rem)] font-extrabold leading-[1.02] tracking-[-0.04em] [text-wrap:balance]">
                Simulados, módulos e <span className="bg-[linear-gradient(180deg,#FF7A2E,#FF6A1A)] bg-clip-text text-transparent">Vade Mecum</span>
              </h1>
              <SeloDaContagem grande />
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-6">
              <CartaoDeMaterial
                visual={<LequeDeCapas capas={LEQUE_DO_COMBO} alt="Combo de Simulados" />}
                titulo={TEXTOS.combo.titulo}
                texto={TEXTOS.combo.cartao}
                preco={
                  combo && {
                    por: combo.preco,
                    de: combo.precoCheio,
                    prefixo: "por",
                  }
                }
                botao={{
                  rotulo: "Escolher concurso →",
                  acao: () => ir({ tela: "combo", concurso: null, forma: null }),
                }}
              />
              <CartaoDeMaterial
                visual={<LequeDeCapas capas={LEQUE_DOS_MODULOS} alt="Módulos teóricos" />}
                titulo={TEXTOS.modulos.titulo}
                texto={TEXTOS.modulos.cartao}
                preco={
                  modulo && {
                    por: modulo.preco,
                    de: modulo.precoCheio,
                    prefixo: "a partir de",
                  }
                }
                botao={{
                  rotulo: "Escolher módulos →",
                  acao: () => ir({ tela: "modulos", concurso: null, forma: null }),
                }}
              />
              <CartaoDeMaterial
                visual={<Livro3D capa={VADE_MECUM.capa} alt={VADE_MECUM.nome} altura="h-[240px]" />}
                titulo={VADE_MECUM.nome}
                texto={TEXTOS.vade.cartao}
                preco={
                  vade && {
                    por: vade.preco,
                    de: vade.precoCheio,
                    prefixo: "por",
                  }
                }
                botao={{
                  rotulo: vade && !vade.aVenda ? "Em breve" : "Comprar →",
                  desligado: !vade || !vade.aVenda,
                  acao: () => vade && adicionar(vade, VADE_MECUM.nome, "Material digital · PDF"),
                }}
              />
            </div>

            <BannerDosSimulados />
          </>
        )}
      </div>
    </section>
  );
}
