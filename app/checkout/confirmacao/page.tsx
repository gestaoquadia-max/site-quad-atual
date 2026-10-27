import type { Metadata } from "next";
import Link from "next/link";
import LimparCarrinho from "./LimparCarrinho";
import Etapas from "@/components/compra/Etapas";
import { NOME_DO_SITE, resumir } from "@/lib/seo";

type Status = "aprovado" | "pendente" | "recusado" | "inscricao" | "matricula";

const telas: Record<
  Status,
  { titulo: string; tom: "sucesso" | "espera" | "erro"; texto: (metodo?: string) => string; cta: { href: string; label: string }; limpar: boolean }
> = {
  aprovado: {
    titulo: "Pagamento aprovado",
    tom: "sucesso",
    texto: () =>
      "Sua compra está confirmada e o acesso já está liberado na sua área do aluno.",
    cta: { href: "/aluno", label: "Ir para a área do aluno" },
    limpar: true,
  },
  pendente: {
    titulo: "Aguardando pagamento",
    tom: "espera",
    texto: () =>
      "Seu pedido foi registrado. Pague o PIX pela página do pedido; assim que o pagamento for confirmado, o acesso é liberado automaticamente na sua área do aluno.",
    cta: { href: "/aluno", label: "Ir para a área do aluno" },
    limpar: true,
  },
  recusado: {
    titulo: "Pagamento não aprovado",
    tom: "erro",
    texto: () =>
      "O pagamento não foi autorizado e nada foi cobrado. Confira os dados do cartão ou escolha outra forma de pagamento.",
    cta: { href: "/checkout", label: "Tentar novamente" },
    limpar: false,
  },
  inscricao: {
    titulo: "Inscrição confirmada",
    tom: "sucesso",
    texto: () => "Sua inscrição está garantida. Os detalhes ficam na sua área do aluno.",
    cta: { href: "/aluno/eventos", label: "Ver meus eventos" },
    limpar: true,
  },
  matricula: {
    titulo: "Matrícula confirmada",
    tom: "sucesso",
    texto: () => "Você está matriculado na turma. Horários, materiais e avisos ficam na sua área do aluno.",
    cta: { href: "/aluno/turmas", label: "Ver minhas turmas" },
    limpar: false,
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
    <div className="bg-nevoa">
      {tela.limpar && <LimparCarrinho />}
      <div className="mx-auto max-w-[760px] px-[clamp(20px,4vw,32px)] pb-[clamp(64px,9vw,120px)] pt-[clamp(36px,5vw,64px)]">
        <Etapas atual="Confirmação" />
        <div className="rounded-[20px] border border-linha bg-white p-[clamp(28px,5vw,48px)] shadow-[0_20px_40px_-30px_rgba(7,20,38,0.3)]">
          <IconeDoResultado tom={tela.tom} />
          <h1 className="mb-3 mt-5 font-display text-[clamp(1.8rem,3.6vw,2.4rem)] font-extrabold leading-[1.1] tracking-[-0.03em]">{tela.titulo}</h1>
          <p className="text-[15.5px] leading-[1.6] text-ardosia">{tela.texto(typeof metodo === "string" ? metodo : undefined)}</p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <Link href={tela.cta.href} className="btn-q btn-q-azul h-12 px-[22px] text-[15px]">
              {tela.cta.label}
            </Link>
            <Link href="/" className="btn-q btn-q-contorno h-12 px-5 text-[15px]">
              Voltar ao início
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconeDoResultado({ tom }: { tom: "sucesso" | "espera" | "erro" }) {
  const cores = { sucesso: "bg-[#E3F3EA] text-[#13774A]", espera: "bg-[#FFF4D6] text-[#8A5A00]", erro: "bg-[#FDECEC] text-[#B42323]" };
  return (
    <div aria-hidden="true" className={`grid h-14 w-14 place-items-center rounded-2xl ${cores[tom]}`}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {tom === "sucesso" && <path d="M5 12.5l4.5 4.5L19 7.5" />}
        {tom === "espera" && (
          <>
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 7.5V12l3 2" />
          </>
        )}
        {tom === "erro" && <path d="M7 7l10 10M17 7L7 17" />}
      </svg>
    </div>
  );
}
