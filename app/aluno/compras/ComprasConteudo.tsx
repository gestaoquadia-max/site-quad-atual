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

// A retirada do impresso na recepção (versão impressa do simulado; guia da API de 13/11/2026).
const ENTREGA: Record<NonNullable<Compra["entrega"]>, string> = {
  PENDENTE: "Impresso: aguardando separação",
  PRONTA: "Impresso: pronto para retirada na recepção",
  CONCLUIDA: "Impresso: retirado",
};

function descreverPagamento(c: Compra) {
  const cartao = c.pagamento?.cartao;
  if (c.formaDePagamento === "CARTAO") {
    const final = cartao?.ultimosDigitos ? ` final ${cartao.ultimosDigitos}` : "";
    const parcelas = cartao?.parcelas && cartao.parcelas > 1 ? ` · ${cartao.parcelas}x` : "";
    return `Cartão${final}${parcelas}`;
  }
  if (c.formaDePagamento === "CUPOM") return "Cupom";
  return "PIX";
}

// "05/11 às 15:42": o PIX vale 30 minutos, então o dia sozinho não diz quando ele vence.
function dataEHora(iso: string) {
  const d = new Date(iso);
  const dia = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "America/Bahia" });
  const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Bahia" });
  return `${dia} às ${hora}`;
}

function PagamentoPendente({ compra }: { compra: Compra }) {
  const [copia, setCopia] = useState<"inicial" | "copiado" | "falhou">("inicial");
  // A hora em que a lista abriu: basta para a validade do PIX, que é de 30 minutos.
  const [agora] = useState(() => Date.now());
  const pix = compra.pagamento?.pix;

  // PIX vencido (a validade é o expiraEm da API): o código não paga mais, então não se oferece a cópia. A compra
  // continua "Aguardando pagamento" até a API expirá-la.
  if (compra.formaDePagamento === "PIX" && pix?.expiraEm && Date.parse(pix.expiraEm) <= agora) {
    return (
      <p className="mt-3 text-[13px] text-ardosia">
        Este PIX venceu em {dataEHora(pix.expiraEm)} e não pode mais ser pago. Se ainda quiser, faça a compra de novo.
      </p>
    );
  }

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
          {pix.expiraEm && <span>Vence em {dataEHora(pix.expiraEm)}</span>}
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
  if (!d) return null;

  const atendimento = (
    <a href={linkDoWhatsApp(institucional.whatsapp)} target="_blank" rel="noopener noreferrer" className="font-semibold text-azul-forte underline underline-offset-4">
      fale com o atendimento
    </a>
  );

  if (!d.permitida) {
    // O material digital fica "entregue" assim que é pago (o PDF já está liberado): a API responde ITEM_JA_RETIRADO,
    // mas não houve retirada na recepção.
    const digital = compra.item.plataforma === "DIGITAL" && d.impedimento === "ITEM_JA_RETIRADO";
    const motivo = digital
      ? "Não dá para desistir de um material digital: o PDF já foi liberado para você."
      : d.impedimento
        ? MOTIVO_DO_IMPEDIMENTO[d.impedimento]
        : undefined;
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
            <div key={c.id} className={`px-[22px] py-4 ${i > 0 ? "border-t border-linha" : ""}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[15px] font-semibold">
                    {c.item.nome}
                    {c.quantidade > 1 && ` × ${c.quantidade}`}
                  </div>
                  <div className="mt-0.5 text-[13px] text-ardosia">
                    {formatarData(c.pagaEm ?? c.criadaEm)} · {descreverPagamento(c)}
                  </div>
                  {c.situacao === "PAGA" && c.entrega && c.item.plataforma !== "DIGITAL" && (
                    <div className="mt-0.5 text-[13px] font-semibold text-azul-forte">{ENTREGA[c.entrega]}</div>
                  )}
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
