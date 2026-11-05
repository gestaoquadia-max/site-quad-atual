"use client";

import { useState } from "react";
import EstadoLista from "@/components/EstadoLista";
import { CLASSE_DO_BOTAO_PEQUENO, CLASSE_DO_CARTAO, Etiqueta } from "@/components/aluno/CabecalhoDoAluno";
import { baixarMaterialComprado, desistirDaCompra, listarMinhasComprasEmReais, type Compra } from "@/lib/api";
import { institucional, linkDoWhatsApp } from "@/lib/institucional";
import { salvarArquivo } from "@/lib/download";
import { formatarData, formatarValor } from "@/lib/format";
import { ErroDaApi } from "@/lib/http";
import { useCarregar } from "@/lib/useCarregar";
import { useCarregandoUsuario, useUsuarioAtual } from "@/lib/usuario";

const carregarCompras = () => listarMinhasComprasEmReais();

const situacao: Record<Compra["situacao"], { label: string; tom: "verde" | "amarelo" | "vermelho" | "cinza" }> = {
  PAGA: { label: "Pago", tom: "verde" },
  AGUARDANDO_PAGAMENTO: { label: "Aguardando pagamento", tom: "amarelo" },
  CRIADA: { label: "Em processamento", tom: "cinza" },
  RECUSADA: { label: "Recusado", tom: "vermelho" },
  EXPIRADA: { label: "Expirado", tom: "cinza" },
  CANCELADA: { label: "Cancelado", tom: "cinza" },
  ESTORNADA: { label: "Estornado", tom: "cinza" },
};

function descreverPagamento(c: Compra) {
  const cartao = c.pagamento?.cartao;
  if (c.formaDePagamento === "CARTAO") {
    const final = cartao?.ultimosDigitos ? ` final ${cartao.ultimosDigitos}` : "";
    const parcelas = cartao?.parcelas && cartao.parcelas > 1 ? ` · ${cartao.parcelas}x` : "";
    return `Cartão${final}${parcelas}`;
  }
  return c.formaDePagamento === "PIX" ? "PIX" : "Boleto";
}

function PagamentoPendente({ compra }: { compra: Compra }) {
  const [copia, setCopia] = useState<"inicial" | "copiado" | "falhou">("inicial");
  const pix = compra.pagamento?.pix;
  const boleto = compra.pagamento?.boleto;
  const linkDoBoleto = boleto?.url || boleto?.pdf;

  if (compra.formaDePagamento === "PIX" && pix?.codigo) {
    const codigo = pix.codigo;
    return (
      <div className="mt-3 text-[13px] text-ardosia">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() =>
              navigator.clipboard
                .writeText(codigo)
                .then(() => setCopia("copiado"))
                .catch(() => setCopia("falhou"))
            }
            className="inline-flex h-10 items-center rounded-[9px] bg-azul px-4 font-display text-[13.5px] font-bold text-white transition-colors hover:bg-azul-forte"
          >
            {copia === "copiado" ? "Código copiado ✓" : "Copiar código PIX"}
          </button>
          {pix.expiraEm && <span>Vence em {formatarData(pix.expiraEm)}</span>}
        </div>
        {/* Alguns navegadores bloqueiam a cópia automática: aí o código aparece para copiar à mão. */}
        {copia === "falhou" && (
          <div className="mt-2">
            <p className="mb-1">Não foi possível copiar automaticamente. Selecione e copie o código:</p>
            <input
              readOnly
              value={codigo}
              onFocus={(e) => e.currentTarget.select()}
              aria-label="Código PIX"
              className="w-full rounded-[9px] border border-linha-forte bg-nevoa px-3 py-2 font-mono text-xs text-tinta"
            />
          </div>
        )}
      </div>
    );
  }
  if (compra.formaDePagamento === "BOLETO" && linkDoBoleto) {
    return (
      <div className="mt-3 flex flex-wrap items-center gap-3 text-[13px] text-ardosia">
        <a href={linkDoBoleto} target="_blank" rel="noopener noreferrer" className={CLASSE_DO_BOTAO_PEQUENO}>
          Ver boleto
        </a>
        {boleto?.venceEm && <span>Vence em {formatarData(boleto.venceEm)}</span>}
      </div>
    );
  }
  return null;
}

// O material digital (PDF) se baixa pela própria compra paga; o nome do arquivo é o do material.
function BaixarPdf({ compra }: { compra: Compra }) {
  const [baixando, setBaixando] = useState(false);
  const [erro, setErro] = useState("");

  async function baixar() {
    setErro("");
    setBaixando(true);
    try {
      salvarArquivo(await baixarMaterialComprado(compra.id), `${compra.item.nome}.pdf`);
    } catch (e) {
      setErro(e instanceof ErroDaApi ? e.message : "Não foi possível baixar. Verifique sua internet e tente novamente.");
    } finally {
      setBaixando(false);
    }
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <button type="button" onClick={baixar} disabled={baixando} className={CLASSE_DO_BOTAO_PEQUENO}>
        {baixando ? "Baixando..." : "Baixar PDF"}
      </button>
      {erro && (
        <span role="alert" className="text-[13px] text-[#B42323]">
          {erro}
        </span>
      )}
    </div>
  );
}

// Hoje no calendário do Quad ("2026-11-05"), para contar os dias até o fim do prazo como a API conta.
function hojeNaBahia() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bahia" }).format(new Date());
}

function diasAte(dia: string) {
  const [a, m, d] = dia.split("-").map(Number);
  const [ha, hm, hd] = hojeNaBahia().split("-").map(Number);
  return Math.round((Date.UTC(a, m - 1, d) - Date.UTC(ha, hm - 1, hd)) / 86_400_000);
}

// A frase do prazo, a partir do que a API calculou (o site não refaz a regra).
function frasesDoPrazo(d: NonNullable<Compra["desistencia"]>) {
  if (d.limite === "ATE_A_RETIRADA") return "Você pode desistir enquanto não retirar o produto na recepção.";
  if (!d.ate) return "";
  const faltam = diasAte(d.ate);
  const quando = faltam <= 0 ? "hoje é o último dia" : faltam === 1 ? "falta 1 dia" : `faltam ${faltam} dias`;
  const ate = formatarData(d.ate);
  return d.limite === "VESPERA_DA_ATIVIDADE"
    ? `Você pode desistir até ${ate}, a véspera da atividade (${quando}).`
    : `Você pode desistir até ${ate} (${quando}).`;
}

const MOTIVO_DO_IMPEDIMENTO: Partial<Record<NonNullable<NonNullable<Compra["desistencia"]>["impedimento"]>, string>> = {
  PRAZO_VENCIDO: "O prazo para desistir desta compra terminou.",
  ATIVIDADE_JA_COMECOU: "Não dá mais para desistir: a atividade é hoje ou já aconteceu.",
  ITEM_JA_RETIRADO: "Não dá mais para desistir: o produto já foi retirado na recepção.",
};

// Desistir de uma compra paga dentro do prazo. Pede confirmação (a API não aceita repetir o pedido) e, no fim,
// troca a compra da lista pela resposta da API, já estornada.
function Desistencia({ compra, aoDesistir }: { compra: Compra; aoDesistir: (c: Compra) => void }) {
  const [etapa, setEtapa] = useState<"inicial" | "confirmando" | "enviando">("inicial");
  const [erro, setErro] = useState("");
  const d = compra.desistencia;
  if (!d || compra.formaDePagamento === "BOLETO") return null;

  const atendimento = (
    <a href={linkDoWhatsApp(institucional.whatsapp)} target="_blank" rel="noopener noreferrer" className="font-semibold text-azul-forte underline underline-offset-4">
      fale com o atendimento
    </a>
  );

  if (!d.permitida) {
    const motivo = d.impedimento ? MOTIVO_DO_IMPEDIMENTO[d.impedimento] : undefined;
    if (!motivo) return null;
    return (
      <p className="mt-3 text-[13px] text-ardosia">
        {motivo} Se precisar de ajuda, {atendimento}.
      </p>
    );
  }

  const valor = compra.aPagarEmCentavos ?? compra.pagamento?.valorEmCentavos;
  const devolucao = compra.formaDePagamento === "CARTAO" ? "O estorno aparece na fatura do cartão." : "O valor volta para a conta que pagou o PIX.";

  async function confirmar() {
    setErro("");
    setEtapa("enviando");
    try {
      aoDesistir(await desistirDaCompra(compra.id));
    } catch (e) {
      setErro(e instanceof ErroDaApi ? e.message : "Não foi possível desistir agora. Verifique sua internet e tente novamente.");
      setEtapa("confirmando");
    }
  }

  if (etapa === "inicial") {
    return (
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-ardosia">
        <span>{frasesDoPrazo(d)}</span>
        <button type="button" onClick={() => setEtapa("confirmando")} className="font-semibold text-[#B42323] underline underline-offset-4 hover:text-[#8E1B1B]">
          Desistir da compra
        </button>
      </div>
    );
  }

  return (
    <div role="group" aria-label="Confirmar desistência" className="mt-3 rounded-[12px] border border-[#F3C9C9] bg-[#FFF6F6] p-4 text-[13.5px] text-tinta">
      <p className="font-semibold">Desistir de “{compra.item.nome}”?</p>
      <p className="mt-1 text-ardosia">
        {valor != null ? `Você recebe ${formatarValor(valor / 100)} de volta. ` : ""}
        {devolucao} A vaga e o acesso desta compra são cancelados, e isso não pode ser desfeito.
      </p>
      {erro && (
        <p role="alert" className="mt-2 text-[#B42323]">
          {erro}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={confirmar}
          disabled={etapa === "enviando"}
          className="inline-flex h-10 items-center rounded-[9px] bg-[#B42323] px-4 font-display text-[13.5px] font-bold text-white transition-colors hover:bg-[#8E1B1B] disabled:opacity-60"
        >
          {etapa === "enviando" ? "Desistindo..." : "Sim, desistir"}
        </button>
        <button type="button" onClick={() => setEtapa("inicial")} disabled={etapa === "enviando"} className={CLASSE_DO_BOTAO_PEQUENO}>
          Voltar
        </button>
      </div>
    </div>
  );
}

// Na compra estornada: quanto voltou e quando. No estorno manual, o financeiro devolve por transferência.
function Devolucao({ compra }: { compra: Compra }) {
  const e = compra.estorno;
  if (!e) return null;
  const valor = e.valorEmCentavos != null ? `${formatarValor(e.valorEmCentavos / 100)} ` : "";
  return (
    <p className="mt-3 text-[13px] text-ardosia">
      {e.manual
        ? `Devolução de ${valor}registrada em ${formatarData(e.em)}. O financeiro do Quad faz a transferência e avisa você.`
        : `Devolução de ${valor}feita em ${formatarData(e.em)}. ${compra.formaDePagamento === "CARTAO" ? "O prazo para aparecer na fatura depende do banco do cartão." : "O valor volta para a conta que pagou o PIX."}`}
    </p>
  );
}

export default function ComprasConteudo() {
  const usuario = useUsuarioAtual();
  const carregandoUsuario = useCarregandoUsuario();
  const alunoId = usuario?.aluno?.id ?? null;
  const { carregando, dados, erro, tentarNovamente } = useCarregar(alunoId, carregarCompras);
  const semCadastroDeAluno = !carregandoUsuario && !alunoId;
  // As compras que mudaram nesta visita (a desistência responde a compra já estornada).
  const [atualizadas, setAtualizadas] = useState<Record<string, Compra>>({});
  const compras = (dados ?? []).map((c) => atualizadas[c.id] ?? c);

  return (
    <EstadoLista
      carregando={!semCadastroDeAluno && (carregandoUsuario || carregando)}
      erro={semCadastroDeAluno ? null : erro}
      onTentarNovamente={tentarNovamente}
      vazio={semCadastroDeAluno || compras.length === 0}
      vazioTitulo="Nenhuma compra ainda"
      vazioTexto="Suas turmas, materiais e inscrições pagas aparecem aqui."
      vazioAcao={{ href: "/turmas", label: "Ver turmas" }}
    >
      <div className={`${CLASSE_DO_CARTAO} overflow-hidden`}>
        {compras.map((c, i) => {
          // O que ESTA compra pagou; o valor do pagamento é o do carrinho inteiro, quando ele tinha várias compras.
          const valor = c.aPagarEmCentavos ?? c.pagamento?.valorEmCentavos;
          return (
            <div key={c.id} className={`px-[22px] py-4 ${i > 0 ? "border-t border-[#EEF2F7]" : ""}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[15px] font-semibold">
                    {c.item.nome}
                    {c.quantidade > 1 && ` × ${c.quantidade}`}
                  </div>
                  <div className="mt-0.5 text-[13px] text-ardosia">
                    {formatarData(c.pagaEm ?? c.criadaEm)} · {descreverPagamento(c)}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {valor != null && (
                    <span className="font-display text-[17px] font-extrabold text-tinta">{formatarValor(valor / 100)}</span>
                  )}
                  <Etiqueta tom={situacao[c.situacao].tom}>{situacao[c.situacao].label}</Etiqueta>
                </div>
              </div>
              {c.situacao === "AGUARDANDO_PAGAMENTO" && <PagamentoPendente compra={c} />}
              {c.situacao === "PAGA" && c.item.plataforma === "DIGITAL" && <BaixarPdf compra={c} />}
              {c.situacao === "PAGA" && <Desistencia compra={c} aoDesistir={(nova) => setAtualizadas((a) => ({ ...a, [nova.id]: nova }))} />}
              {c.situacao === "ESTORNADA" && <Devolucao compra={c} />}
            </div>
          );
        })}
      </div>
    </EstadoLista>
  );
}
