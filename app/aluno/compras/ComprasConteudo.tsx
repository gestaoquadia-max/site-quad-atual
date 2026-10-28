"use client";

import { useState } from "react";
import EstadoLista from "@/components/EstadoLista";
import { CLASSE_DO_BOTAO_PEQUENO, CLASSE_DO_CARTAO, Etiqueta } from "@/components/aluno/CabecalhoDoAluno";
import { baixarMaterialComprado, listarMinhasComprasEmReais, type Compra } from "@/lib/api";
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
      <div className={`${CLASSE_DO_CARTAO} overflow-hidden`}>
        {compras.map((c, i) => {
          const valor = c.pagamento?.valorEmCentavos;
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
            </div>
          );
        })}
      </div>
    </EstadoLista>
  );
}
