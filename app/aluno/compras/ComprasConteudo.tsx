"use client";

import { useState } from "react";
import EstadoLista from "@/components/EstadoLista";
import { listarMinhasComprasEmReais, type Compra } from "@/lib/api";
import { formatarData, formatarValor } from "@/lib/format";
import { useCarregar } from "@/lib/useCarregar";
import { useCarregandoUsuario, useUsuarioAtual } from "@/lib/usuario";

const carregarCompras = () => listarMinhasComprasEmReais();

const situacao: Record<Compra["situacao"], { label: string; classe: string }> = {
  PAGA: { label: "Pago", classe: "bg-[#E4EFE5] text-[#33693A]" },
  AGUARDANDO_PAGAMENTO: { label: "Aguardando pagamento", classe: "bg-[#FFF6DD] text-[#7A5A00]" },
  CRIADA: { label: "Em processamento", classe: "bg-[#ECE9E1] text-steel" },
  RECUSADA: { label: "Recusado", classe: "bg-[#9B3535]/10 text-[#9B3535]" },
  EXPIRADA: { label: "Expirado", classe: "bg-[#ECE9E1] text-steel" },
  CANCELADA: { label: "Cancelado", classe: "bg-[#ECE9E1] text-steel" },
  ESTORNADA: { label: "Estornado", classe: "bg-[#ECE9E1] text-steel" },
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
      <div className="mt-3 text-xs text-steel">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() =>
              navigator.clipboard
                .writeText(codigo)
                .then(() => setCopia("copiado"))
                .catch(() => setCopia("falhou"))
            }
            className="btn btn-outline-dark px-4 py-2 text-xs"
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
              className="w-full border border-light bg-offwhite px-3 py-2 font-mono text-xs text-navy"
            />
          </div>
        )}
      </div>
    );
  }
  if (compra.formaDePagamento === "BOLETO" && linkDoBoleto) {
    return (
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-steel">
        <a href={linkDoBoleto} target="_blank" rel="noopener noreferrer" className="btn btn-outline-dark px-4 py-2 text-xs">
          Ver boleto
        </a>
        {boleto?.venceEm && <span>Vence em {formatarData(boleto.venceEm)}</span>}
      </div>
    );
  }
  return null;
}

export default function ComprasConteudo() {
  const usuario = useUsuarioAtual();
  const carregandoUsuario = useCarregandoUsuario();
  const alunoId = usuario?.aluno?.id ?? null;
  const { carregando, dados, erro, tentarNovamente } = useCarregar(alunoId, carregarCompras);
  const semCadastroDeAluno = !carregandoUsuario && !alunoId;
  const compras = dados ?? [];

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
      <div className="border border-light bg-white">
        {compras.map((c, i) => {
          const valor = c.pagamento?.valorEmCentavos;
          return (
            <div key={c.id} className={`px-5 py-4 ${i !== compras.length - 1 ? "border-b border-light" : ""}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[15px] font-semibold">
                    {c.item.nome}
                    {c.quantidade > 1 && ` × ${c.quantidade}`}
                  </div>
                  <div className="text-xs text-steel">
                    {formatarData(c.pagaEm ?? c.criadaEm)} · {descreverPagamento(c)}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {valor != null && (
                    <span className="font-display text-base font-bold text-navy">{formatarValor(valor / 100)}</span>
                  )}
                  <span className={`px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${situacao[c.situacao].classe}`}>
                    {situacao[c.situacao].label}
                  </span>
                </div>
              </div>
              {c.situacao === "AGUARDANDO_PAGAMENTO" && <PagamentoPendente compra={c} />}
            </div>
          );
        })}
      </div>
    </EstadoLista>
  );
}
