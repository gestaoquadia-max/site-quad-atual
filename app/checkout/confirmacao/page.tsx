import type { Metadata } from "next";
import Link from "next/link";
import LimparCarrinho from "./LimparCarrinho";
import { NOME_DO_SITE, resumir } from "@/lib/seo";

type Status = "aprovado" | "pendente" | "recusado" | "inscricao";

const telas: Record<
  Status,
  { titulo: string; icone: string; texto: (metodo?: string) => string; cta: { href: string; label: string }; limpar: boolean }
> = {
  aprovado: {
    titulo: "Pagamento aprovado",
    icone: "✓",
    texto: () =>
      "Sua compra está confirmada. Enviamos os detalhes para o seu e-mail e o acesso já está liberado na sua área do aluno.",
    cta: { href: "/aluno", label: "Ir para a área do aluno" },
    limpar: true,
  },
  pendente: {
    titulo: "Aguardando pagamento",
    icone: "…",
    texto: (metodo) =>
      metodo === "boleto"
        ? "Seu pedido foi registrado e o boleto foi enviado para o seu e-mail. Ele vence em 3 dias úteis, e o acesso é liberado após a compensação (1 a 2 dias úteis depois do pagamento)."
        : "Seu pedido foi registrado. Pague o PIX enviado para o seu e-mail; assim que o pagamento for confirmado, o acesso é liberado automaticamente na sua área do aluno.",
    cta: { href: "/aluno", label: "Ir para a área do aluno" },
    limpar: true,
  },
  recusado: {
    titulo: "Pagamento não aprovado",
    icone: "✕",
    texto: () =>
      "O pagamento não foi autorizado e nada foi cobrado. Confira os dados do cartão ou escolha outra forma de pagamento.",
    cta: { href: "/checkout", label: "Tentar novamente" },
    limpar: false,
  },
  inscricao: {
    titulo: "Inscrição confirmada",
    icone: "✓",
    texto: () => "Sua inscrição está garantida. Enviamos os detalhes para o seu e-mail.",
    cta: { href: "/aluno/eventos", label: "Ver meus eventos" },
    limpar: true,
  },
};

function lerStatus(valor: string | string[] | undefined): Status {
  return typeof valor === "string" && valor in telas ? (valor as Status) : "aprovado";
}

type Props = { searchParams: Promise<{ status?: string | string[]; metodo?: string | string[] }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { status, metodo } = await searchParams;
  const tela = telas[lerStatus(status)];
  // absolute: o título simples do layout do checkout corta o modelo " — Quad Concursos" do layout raiz.
  return {
    title: { absolute: `${tela.titulo} — ${NOME_DO_SITE}` },
    description: resumir(tela.texto(typeof metodo === "string" ? metodo : undefined)),
  };
}

export default async function ConfirmacaoPage({ searchParams }: Props) {
  const { status, metodo } = await searchParams;
  const tela = telas[lerStatus(status)];

  return (
    <div className="flex min-h-[calc(100vh-68px)] items-center justify-center bg-navy-deep px-6 py-12 text-center">
      {tela.limpar && <LimparCarrinho />}
      <div className="max-w-[480px]">
        <div className="hexagon mx-auto mb-7 flex h-[72px] w-[72px] items-center justify-center bg-blue text-[32px] text-navy-deep">
          {tela.icone}
        </div>
        <h1 className="font-display mb-3 text-h2 font-bold uppercase text-offwhite">{tela.titulo}</h1>
        <p className="mb-8 text-steel-light">{tela.texto(typeof metodo === "string" ? metodo : undefined)}</p>
        <Link href={tela.cta.href} className="btn btn-blue">
          {tela.cta.label}
        </Link>
      </div>
    </div>
  );
}
