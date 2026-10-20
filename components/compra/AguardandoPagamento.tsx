"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ErroDaApi } from "@/lib/http";
import { buscarFechamento, conferirPagamento, emReais, type Fechamento } from "@/lib/loja";
import { rotaComDestino } from "@/lib/redirecionamento";
import { useTokenDeAcesso } from "@/lib/usuario";
import Etapas from "./Etapas";

const INTERVALO_DA_CONSULTA_MS = 5000;

function dataEHora(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function BotaoCopiar({ texto, rotulo }: { texto: string; rotulo: string }) {
  const [estado, setEstado] = useState<"inicial" | "copiado" | "falhou">("inicial");
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() =>
          navigator.clipboard
            .writeText(texto)
            .then(() => setEstado("copiado"))
            .catch(() => setEstado("falhou"))
        }
        className="btn-q btn-q-azul h-12 px-5 text-[15px]"
      >
        {estado === "copiado" ? "Copiado ✓" : rotulo}
      </button>
      {/* Alguns navegadores bloqueiam a cópia automática: aí o código fica selecionável. */}
      {estado === "falhou" && <p className="text-[13px] text-ardosia">Não foi possível copiar automaticamente. Selecione o código acima e copie.</p>}
    </div>
  );
}

function Cartao({ children }: { children: React.ReactNode }) {
  return <div className="rounded-[20px] border border-linha bg-white p-[clamp(24px,4vw,40px)] shadow-[0_20px_40px_-30px_rgba(7,20,38,0.3)]">{children}</div>;
}

export default function AguardandoPagamento({ id }: { id: string }) {
  const token = useTokenDeAcesso();
  const [fechamento, setFechamento] = useState<Fechamento | null>(null);
  const [erro, setErro] = useState("");
  const [conferindo, setConferindo] = useState(false);
  const [avisoDaConferencia, setAvisoDaConferencia] = useState("");

  const aguardando = !fechamento || fechamento.situacao === "AGUARDANDO_PAGAMENTO" || fechamento.situacao === "CRIADA";

  // Consulta a situação até o pagamento ser confirmado (ou vencer). O aviso do Pagar.me chega à API, não ao site.
  useEffect(() => {
    if (!token || !aguardando) return;
    let cancelado = false;
    const consultar = () =>
      buscarFechamento(id)
        .then((f) => !cancelado && setFechamento(f))
        .catch((e) => !cancelado && setErro(e instanceof ErroDaApi && e.status === 404 ? "Pedido não encontrado." : "Não foi possível consultar o pagamento agora."));
    consultar();
    const intervalo = setInterval(consultar, INTERVALO_DA_CONSULTA_MS);
    return () => {
      cancelado = true;
      clearInterval(intervalo);
    };
  }, [id, token, aguardando]);

  async function jaPaguei() {
    setConferindo(true);
    setAvisoDaConferencia("");
    try {
      const f = await conferirPagamento(id);
      setFechamento(f);
      if (f.situacao !== "PAGA") setAvisoDaConferencia("Ainda não recebemos a confirmação. Pagamentos por PIX costumam cair em poucos minutos.");
    } catch (e) {
      setAvisoDaConferencia(e instanceof ErroDaApi ? e.message : "Não foi possível conferir agora. Tente de novo em instantes.");
    } finally {
      setConferindo(false);
    }
  }

  const pix = fechamento?.pagamento?.pix;
  const boleto = fechamento?.pagamento?.boleto;

  let conteudo: React.ReactNode;
  if (token === null) {
    conteudo = (
      <Cartao>
        <h1 className="mb-3 font-display text-[clamp(1.8rem,3.6vw,2.4rem)] font-extrabold tracking-[-0.03em]">Entre para ver o seu pagamento</h1>
        <Link href={rotaComDestino("/entrar", `/checkout/pagamento/${id}`)} className="btn-q btn-q-azul mt-4 h-12 px-[22px] text-[15px]">
          Entrar
        </Link>
      </Cartao>
    );
  } else if (erro && !fechamento) {
    conteudo = (
      <Cartao>
        <h1 className="mb-3 font-display text-[clamp(1.8rem,3.6vw,2.4rem)] font-extrabold tracking-[-0.03em]">{erro}</h1>
        <Link href="/aluno/compras" className="btn-q btn-q-contorno mt-4 h-12 px-[22px] text-[15px]">
          Ver minhas compras
        </Link>
      </Cartao>
    );
  } else if (!fechamento) {
    conteudo = <div role="status" aria-label="Carregando" className="min-h-[50vh]" />;
  } else if (fechamento.situacao === "PAGA") {
    conteudo = (
      <Cartao>
        <div aria-hidden="true" className="grid h-14 w-14 place-items-center rounded-2xl bg-[#E3F3EA] text-[#13774A]">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </div>
        <h1 role="status" className="mb-3 mt-5 font-display text-[clamp(1.8rem,3.6vw,2.4rem)] font-extrabold tracking-[-0.03em]">
          Pagamento confirmado
        </h1>
        <p className="text-[15.5px] leading-[1.6] text-ardosia">Sua compra está confirmada e o acesso já está liberado na sua área do aluno.</p>
        <Link href="/aluno" className="btn-q btn-q-azul mt-7 h-12 px-[22px] text-[15px]">
          Ir para a área do aluno
        </Link>
      </Cartao>
    );
  } else if (!aguardando) {
    conteudo = (
      <Cartao>
        <h1 className="mb-3 font-display text-[clamp(1.8rem,3.6vw,2.4rem)] font-extrabold tracking-[-0.03em]">
          {fechamento.situacao === "EXPIRADA" ? "O prazo para pagar venceu" : "Este pedido não está mais ativo"}
        </h1>
        <p className="text-[15.5px] leading-[1.6] text-ardosia">Nada foi cobrado. Se ainda quiser os itens, faça o pedido de novo.</p>
        <Link href="/" className="btn-q btn-q-azul mt-7 h-12 px-[22px] text-[15px]">
          Voltar ao início
        </Link>
      </Cartao>
    );
  } else {
    conteudo = (
      <Cartao>
        <h1 className="mb-2 font-display text-[clamp(1.8rem,3.6vw,2.4rem)] font-extrabold tracking-[-0.03em]">{pix ? "Pague com PIX" : "Pague o boleto"}</h1>
        <p className="text-[15.5px] leading-[1.6] text-ardosia">
          Total de <strong className="text-tinta">{emReais(fechamento.totalEmCentavos)}</strong>. Esta página atualiza sozinha quando o pagamento for confirmado.
        </p>

        {pix && (
          <div className="mt-6 grid items-start gap-6 sm:grid-cols-[220px_minmax(0,1fr)]">
            {pix.imagemUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- QR Code gerado pelo Pagar.me, endereço temporário
              <img src={pix.imagemUrl} alt="QR Code do PIX" width={220} height={220} className="rounded-xl border border-linha bg-white p-2" />
            )}
            <div className="flex min-w-0 flex-col gap-3">
              <span className="text-[13.5px] font-semibold">PIX copia e cola</span>
              {pix.codigo && (
                <>
                  <code className="block max-h-28 overflow-auto break-all rounded-xl bg-nevoa p-3 text-xs text-tinta">{pix.codigo}</code>
                  <BotaoCopiar texto={pix.codigo} rotulo="Copiar código PIX" />
                </>
              )}
              {pix.expiraEm && <p className="text-[13px] text-ardosia">Válido até {dataEHora(pix.expiraEm)}.</p>}
            </div>
          </div>
        )}

        {boleto && (
          <div className="mt-6 flex flex-col gap-3">
            <span className="text-[13.5px] font-semibold">Linha digitável</span>
            {boleto.linhaDigitavel && (
              <>
                <code className="block break-all rounded-xl bg-nevoa p-3 text-sm text-tinta">{boleto.linhaDigitavel}</code>
                <div className="flex flex-wrap gap-2.5">
                  <BotaoCopiar texto={boleto.linhaDigitavel} rotulo="Copiar linha digitável" />
                  {(boleto.pdf || boleto.url) && (
                    <a href={boleto.pdf ?? boleto.url ?? ""} target="_blank" rel="noopener noreferrer" className="btn-q btn-q-contorno h-12 px-5 text-[15px]">
                      Abrir o boleto (PDF)<span className="sr-only"> (abre em nova aba)</span>
                    </a>
                  )}
                </div>
              </>
            )}
            {boleto.venceEm && <p className="text-[13px] text-ardosia">Vence em {dataEHora(boleto.venceEm)}. A compensação leva de 1 a 2 dias úteis.</p>}
          </div>
        )}

        <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-[#EEF2F7] pt-5">
          <button type="button" onClick={jaPaguei} disabled={conferindo} className="btn-q btn-q-contorno h-11 px-5 text-sm disabled:opacity-60">
            {conferindo ? "Conferindo…" : "Já paguei"}
          </button>
          <span role="status" className="text-[13px] text-ardosia">
            {avisoDaConferencia || "Aguardando a confirmação do pagamento…"}
          </span>
        </div>
      </Cartao>
    );
  }

  return (
    <div className="bg-nevoa">
      <div className="mx-auto max-w-[860px] px-[clamp(20px,4vw,32px)] pb-[clamp(64px,9vw,120px)] pt-[clamp(36px,5vw,64px)]">
        <Etapas atual="Confirmação" />
        {conteudo}
      </div>
    </div>
  );
}
