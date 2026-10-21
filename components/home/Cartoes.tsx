import Image from "next/image";
import Link from "next/link";
import type { Aprovado, Post, Professor } from "@/lib/data";
import { categoriasDaLoja, type Modalidade, type ProdutoDaLoja } from "@/lib/conteudo";
import { getIniciais, precoSemCentavosZerados } from "@/lib/format";
import { Brilho } from "../Brilho";

function IconeDeImagem({ className = "" }: { className?: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

export function SeloExemplo() {
  return (
    <span className="pointer-events-none inline-flex h-6 items-center whitespace-nowrap rounded-full border border-dashed border-[#9DB0C8] bg-white/90 px-[9px] text-[11px] font-semibold text-[#4A5A70]">
      Exemplo ilustrativo
    </span>
  );
}

export function CartaoModalidade({ modalidade }: { modalidade: Modalidade }) {
  return (
    <Link
      href={`/turmas?m=${modalidade.id}`}
      className="relative flex h-full flex-col overflow-hidden rounded-[20px] border border-white/[0.08] bg-[linear-gradient(180deg,#0F2645,#0B1C33_70%)] p-[clamp(20px,2vw,28px)] text-white transition-[transform,border-color] duration-200 hover:-translate-y-[3px] hover:border-[rgba(111,174,255,0.5)] hover:text-white"
    >
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[130px] aspect-square w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(47,134,255,0.32),transparent)]" />
      <Image
        src={modalidade.insignia}
        alt={`Insígnia ${modalidade.nome}`}
        width={200}
        height={200}
        className="relative mx-auto mb-[18px] block aspect-square h-auto w-[clamp(150px,13vw,200px)] object-contain [filter:drop-shadow(0_16px_24px_rgba(0,0,0,0.6))]"
      />
      <span className="relative flex flex-wrap items-baseline justify-between gap-3">
        <span className="font-display text-[26px] font-extrabold tracking-[0.02em]">{modalidade.nome}</span>
        <span className="whitespace-nowrap text-[13px] font-bold text-azul-ceu">{modalidade.nivel}</span>
      </span>
      <span className="relative mt-2.5 block flex-1 text-[14.5px] leading-[1.55] text-[#B4C1D3] [text-wrap:pretty]">{modalidade.perfil}</span>
      <span className="btn-q btn-q-azul relative mt-5 h-[46px] text-[15px]">Ver turmas {modalidade.nome}</span>
    </Link>
  );
}

export function CartaoMentoria({ nome, duracao, descricao, destaque }: { nome: string; duracao: string; descricao: string; destaque: boolean }) {
  return (
    <Link
      href="/mentorias"
      className={`flex h-full flex-col gap-4 rounded-[20px] p-[clamp(22px,2.2vw,30px)] text-white transition-transform duration-200 hover:-translate-y-[3px] hover:text-white ${
        destaque ? "border border-[rgba(240,122,142,0.45)] bg-[rgba(142,27,46,0.38)]" : "border border-white/10 bg-white/[0.04]"
      }`}
    >
      <span className="flex flex-wrap items-end justify-between gap-3">
        <span className="font-display text-[clamp(26px,2.4vw,32px)] font-extrabold leading-none tracking-[-0.035em]">{nome}</span>
        <span className="whitespace-nowrap text-[13.5px] font-bold text-vinho-rosa">{duracao}</span>
      </span>
      <span className="flex-1 text-[15px] leading-[1.55] text-[#E2DAE4] [text-wrap:pretty]">{descricao}</span>
      <span
        className={`inline-flex h-11 items-center self-start rounded-[10px] px-[18px] font-display text-[14.5px] font-bold ${
          destaque ? "bg-vinho" : "border border-white/25"
        }`}
      >
        Conhecer
      </span>
    </Link>
  );
}

// fundo: "nevoa" na home (seção branca); "branco" na página da loja (seção névoa).
export function CartaoProdutoDaLoja({ produto, fundo = "nevoa" }: { produto: ProdutoDaLoja; fundo?: "nevoa" | "branco" }) {
  const variacoes = produto.variacoes
    .filter((v) => v.opcoes.length > 0)
    .map((v) => `${v.nome}: ${v.opcoes.join(", ")}`)
    .join(" · ");
  const legenda = variacoes || categoriasDaLoja.find((c) => c.id === produto.categoria)?.nome || "";
  const preco = produto.preco === null ? "A confirmar" : precoSemCentavosZerados(produto.preco);
  return (
    <Link
      href={`/loja/${produto.id}`}
      className={`flex h-full flex-col rounded-[18px] border border-linha ${fundo === "branco" ? "bg-white shadow-[0_1px_2px_rgba(16,27,45,0.05),0_12px_28px_-22px_rgba(7,20,38,0.25)]" : "bg-nevoa"} p-2 text-tinta transition-[transform,border-color] duration-200 hover:-translate-y-[3px] hover:border-azul/45 hover:text-tinta`}
    >
      <div className="relative grid aspect-square place-items-center overflow-hidden rounded-xl bg-[#E6ECF4] text-[#8A97AA]">
        {produto.imagemUrl ? <Image src={produto.imagemUrl} alt="" fill sizes="(min-width: 1024px) 320px, 50vw" className="object-cover" /> : <IconeDeImagem />}
        {produto.exemplo && (
          <span className="absolute left-2.5 top-2.5">
            <SeloExemplo />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-2.5 pb-2 pt-4">
        <h3 className="font-display text-[19px] font-extrabold tracking-[-0.02em]">{produto.nome}</h3>
        <span className="text-[13.5px] text-ardosia">{legenda}</span>
        <div className="mt-auto flex items-center justify-between gap-2.5 pt-3">
          <span className="whitespace-nowrap font-display text-[17px] font-extrabold">{preco}</span>
          <span className="btn-q btn-q-azul h-10 rounded-[9px] px-3.5 text-[13.5px]">Ver produto</span>
        </div>
      </div>
    </Link>
  );
}

export function CartaoProfessor({ professor }: { professor: Professor }) {
  return (
    <Link
      href={`/professores/${professor.slug}`}
      className="flex h-full flex-col overflow-hidden rounded-[18px] border border-white/[0.08] bg-marinho-900 p-1.5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-[3px] hover:border-[rgba(111,174,255,0.5)] hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_28px_50px_-26px_rgba(0,0,0,0.85)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[13px] bg-[linear-gradient(160deg,#1B3A63_0%,#0B1C33_70%)]">
        <div aria-hidden="true" className="absolute inset-0 grid place-items-center font-display text-[64px] font-extrabold tracking-[-0.04em] text-white/10">
          {getIniciais(professor.nome)}
        </div>
        {professor.fotoUrl && (
          <Image src={professor.fotoUrl} alt={professor.nome} fill sizes="(min-width: 1024px) 320px, 80vw" className="object-cover" />
        )}
        <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(0deg,rgba(7,20,38,0.96)_10%,rgba(7,20,38,0))] px-4 pb-3.5 pt-14">
          <div className="font-display text-[19px] font-extrabold tracking-[-0.015em]">{professor.nome}</div>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3.5 px-3 py-3.5">
        {professor.bio ? <p className="flex-1 text-[13.5px] leading-[1.55] text-prata">{professor.bio}</p> : <span className="flex-1" />}
        {professor.materia && (
          <span className="self-start rounded-md border border-[rgba(111,174,255,0.22)] bg-azul/[0.14] px-2.5 py-[5px] text-[11.5px] font-semibold uppercase tracking-[0.06em] text-azul-ceu">
            {professor.materia}
          </span>
        )}
      </div>
    </Link>
  );
}

// "Soldado PM-BA — 8º lugar geral" → cargo + resultado.
export function CartaoAprovado({ aprovado }: { aprovado: Aprovado }) {
  const [cargo, resultado = "Aprovado"] = aprovado.concurso.split(" — ");
  return (
    <article className="flex h-full min-h-[240px] gap-2 overflow-hidden rounded-[18px] border border-linha bg-white p-2 shadow-[0_1px_2px_rgba(16,27,45,0.05),0_12px_28px_-22px_rgba(7,20,38,0.25)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-[3px] hover:border-azul/40 hover:shadow-[0_1px_2px_rgba(16,27,45,0.05),0_28px_52px_-26px_rgba(7,20,38,0.45)]">
      <div className="relative flex-[0_0_38%] overflow-hidden rounded-xl bg-[linear-gradient(160deg,#1B3A63_0%,#071426_80%)]">
        <div aria-hidden="true" className="absolute inset-0 grid place-items-center font-display text-[60px] font-extrabold tracking-[-0.04em] text-white/10">
          {getIniciais(aprovado.nome)}
        </div>
        {aprovado.fotoUrl && <Image src={aprovado.fotoUrl} alt={aprovado.nome} fill sizes="240px" className="object-cover" />}
      </div>
      <div className="flex flex-1 flex-col justify-center p-[clamp(16px,2.6vw,28px)]">
        <span className="inline-flex items-center gap-1.5 self-start rounded-md bg-azul py-[5px] pl-2 pr-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8.5l3.2 3L13 4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Quad Aprovado
        </span>
        <p className="mt-4 font-display text-[clamp(22px,2.4vw,27px)] font-extrabold leading-[1.12] tracking-[-0.025em]">
          {cargo} <span className="block text-azul">{resultado}</span>
        </p>
        <p className="mt-3.5 text-[14.5px] font-semibold text-[#3E4A5E]">{aprovado.nome}</p>
      </div>
    </article>
  );
}

export function CartaoArtigo({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      data-glow=""
      className="relative flex h-full flex-col rounded-[18px] border border-white/[0.08] bg-marinho-800 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-[3px] hover:border-[rgba(111,174,255,0.45)] hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_28px_50px_-26px_rgba(0,0,0,0.8)]"
    >
      <Brilho raio={320} />
      <div className="relative mx-1.5 mt-1.5 grid aspect-[16/10] place-items-center overflow-hidden rounded-[13px] bg-[#0B1C33] bg-[image:radial-gradient(70%_60%_at_20%_10%,rgba(47,134,255,0.22),transparent_70%)] text-[rgba(201,213,229,0.35)]">
        {post.imagemUrl ? <Image src={post.imagemUrl} alt="" fill sizes="(min-width: 1024px) 440px, 86vw" className="object-cover" /> : <IconeDeImagem />}
      </div>
      <div className="relative flex flex-1 flex-col px-[22px] pb-[22px] pt-5">
        <span className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-azul-ceu">{post.categoria}</span>
        <h3 className="mb-3 mt-3.5 font-display text-xl font-extrabold leading-[1.25] tracking-[-0.015em] [text-wrap:balance]">{post.titulo}</h3>
        <p className="mb-[22px] flex-1 text-[14.5px] leading-[1.6] text-prata [text-wrap:pretty]">{post.resumo}</p>
        <span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-[9px] border border-white/[0.14] text-azul-ceu">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
