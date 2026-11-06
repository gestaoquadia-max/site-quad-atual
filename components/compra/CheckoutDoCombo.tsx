"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CreditCard, PixLogo } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { precoDoCombo, rotuloDaParte, type Combo } from "@/lib/combos";
import { ErroDaApi } from "@/lib/http";
import { buscarConfiguracaoDoPagamento, emReais, fecharCombo, type ConfiguracaoDoPagamento, type DadosDaCompraDoCombo } from "@/lib/loja";
import { ErroDoCartao, problemaNoCartao, tokenizarCartao, type DadosDoCartao } from "@/lib/pagarme";
import { rotaComDestino } from "@/lib/redirecionamento";
import { useSessaoAtiva } from "@/lib/usuario";
import { CLASSE_DO_CAMPO, CLASSE_DO_ROTULO } from "../acesso/Campos";
import { acrescimoDe, AVISO_DE_ERRO, CamposDoCartao, CARTAO, CARTAO_VAZIO, PAGAMENTO_INDISPONIVEL, useParcelas } from "./Checkout";
import Etapas from "./Etapas";
import RevisaoDoPedido from "./RevisaoDoPedido";

// Pagamento de um combo (lib/combos.ts): sem carrinho e sem cupom, uma cobrança só, no cartão (um) ou no PIX. As
// regras de pagamento são as do checkout do carrinho (components/compra/Checkout.tsx), de onde vêm os campos do cartão.
const METODOS = [
  { id: "CARTAO", rotulo: "Cartão", Icone: CreditCard },
  { id: "PIX", rotulo: "PIX", Icone: PixLogo },
] as const;
type Metodo = (typeof METODOS)[number]["id"];

export default function CheckoutDoCombo({ combo }: { combo: Combo }) {
  const router = useRouter();
  const sessaoAtiva = useSessaoAtiva();
  const logado = !!sessaoAtiva;
  const [config, setConfig] = useState<ConfiguracaoDoPagamento | null>(null);
  const [metodo, setMetodo] = useState<Metodo>("CARTAO");
  const [parcelas, setParcelas] = useState(1);
  const [cartao, setCartao] = useState<DadosDoCartao>(CARTAO_VAZIO);
  // Item com variações (a camisa P, M, G): id do item → id da variação escolhida.
  const [variacoes, setVariacoes] = useState<Record<string, string>>({});
  const [revisando, setRevisando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  // Mesma chave enquanto o aluno tenta pagar o mesmo combo: um reenvio não vira uma segunda cobrança.
  const chaveDoPagamento = useRef<string | null>(null);

  useEffect(() => {
    if (!logado) return;
    buscarConfiguracaoDoPagamento()
      .then(setConfig)
      .catch(() => setConfig({ disponivel: false, chavePublica: null, parcelasMaximas: 1, cartoesMaximos: 1, valorMinimoPorCartaoEmCentavos: 0 }));
  }, [logado]);

  const total = precoDoCombo(combo);
  const comVariacoes = combo.componentes.filter((p) => p.tipo === "ITEM" && p.variacoes.length > 0);
  const faltaVariacao = comVariacoes.find((p) => !variacoes[p.id]);
  const pagamentoDisponivel = !!config?.disponivel;
  const maxParcelas = Math.max(1, config?.parcelasMaximas ?? 1);
  const opcoes = useParcelas(total, logado && pagamentoDisponivel && metodo === "CARTAO");
  const acrescimo = metodo === "PIX" ? 0 : acrescimoDe(opcoes, parcelas);
  const podePagar = combo.disponivel && pagamentoDisponivel && !enviando;

  function problemaAntesDePagar(): string | null {
    if (faltaVariacao) return `Escolha a opção de "${faltaVariacao.nome}".`;
    if (acrescimo === null) return "Aguarde o cálculo das parcelas e confirme de novo.";
    if (metodo === "PIX") return null;
    return problemaNoCartao(cartao) ?? (config?.chavePublica ? null : PAGAMENTO_INDISPONIVEL);
  }

  function revisar(e: React.FormEvent) {
    e.preventDefault();
    if (!podePagar) return;
    const problema = problemaAntesDePagar();
    setErro(problema ?? "");
    if (!problema) setRevisando(true);
  }

  async function confirmar() {
    if (!podePagar || acrescimo === null) return;
    setErro("");
    setEnviando(true);
    let dados: DadosDaCompraDoCombo;
    const escolhidas = Object.entries(variacoes).map(([itemId, variacaoId]) => ({ itemId, variacaoId }));
    try {
      if (metodo === "CARTAO") {
        const token = await tokenizarCartao(config!.chavePublica!, cartao);
        dados = { formaDePagamento: "CARTAO", pagamento: { cartao: { token, parcelas, acrescimoVistoEmCentavos: acrescimo } } };
      } else {
        dados = { formaDePagamento: "PIX" };
      }
      if (escolhidas.length) dados.variacoes = escolhidas;
    } catch (e) {
      setEnviando(false);
      setRevisando(false);
      return setErro(e instanceof ErroDoCartao ? e.message : "Não foi possível validar o cartão.");
    }

    chaveDoPagamento.current ??= crypto.randomUUID();
    try {
      const fechamento = await fecharCombo(combo.id, dados, chaveDoPagamento.current);
      if (fechamento.situacao === "PAGA") router.push("/checkout/confirmacao?status=aprovado");
      else if (fechamento.situacao === "AGUARDANDO_PAGAMENTO" || fechamento.situacao === "CRIADA") router.push(`/checkout/pagamento/${fechamento.id}`);
      else {
        chaveDoPagamento.current = null;
        setErro("O cartão não foi aprovado e nada foi cobrado. Confira os dados do cartão, use outro ou pague com PIX.");
        setEnviando(false);
        setRevisando(false);
      }
    } catch (e) {
      setEnviando(false);
      setRevisando(false);
      if (e instanceof ErroDaApi && e.status >= 400 && e.status < 500) chaveDoPagamento.current = null;
      if (e instanceof ErroDaApi && e.codigo === "PAGAMENTO_INDISPONIVEL") return setErro(PAGAMENTO_INDISPONIVEL);
      if (e instanceof ErroDaApi && e.codigo === "COMBO_INDISPONIVEL") return setErro("Alguma parte deste combo saiu de venda agora, e nada foi cobrado. Volte à página do combo para ver.");
      setErro(e instanceof ErroDaApi ? e.message : "Não foi possível concluir o pagamento. Verifique sua internet e tente novamente.");
    }
  }

  const detalheDaParte = (p: Combo["componentes"][number]) => {
    const variacao = p.variacoes.find((v) => v.id === variacoes[p.id]);
    return `${rotuloDaParte(p)}${variacao ? ` · ${variacao.nome}` : ""}`;
  };

  return (
    <div className="bg-nevoa">
      <div className="mx-auto max-w-[1120px] px-[clamp(20px,4vw,32px)] pb-[clamp(64px,8vw,96px)] pt-[clamp(36px,5vw,64px)]">
        <Etapas atual="Pagamento" />
        <h1 className="mb-7 font-display text-[clamp(2rem,4vw,2.8rem)] font-extrabold tracking-[-0.03em]">Comprar combo</h1>

        {sessaoAtiva === undefined ? (
          <div role="status" aria-label="Carregando" className="min-h-[50vh]" />
        ) : !logado ? (
          <div className="grid justify-items-center gap-3 rounded-[18px] border border-linha bg-superficie shadow-cartao p-[clamp(36px,6vw,64px)] text-center">
            <h2 className="font-display text-[22px] font-extrabold">Entre para comprar o combo</h2>
            <p className="max-w-[440px] text-[15px] leading-[1.55] text-ardosia">A compra fica registrada na sua conta, e é lá que você acessa o que comprou.</p>
            <div className="mt-2.5 flex flex-wrap justify-center gap-2.5">
              <Link href={rotaComDestino("/entrar", `/checkout/combo/${combo.slug}`)} className="btn-q btn-q-azul h-12 px-[22px] text-[15px]">
                Entrar
              </Link>
              <Link href={rotaComDestino("/cadastro", `/checkout/combo/${combo.slug}`)} className="btn-q btn-q-contorno h-12 px-[22px] text-[15px]">
                Criar conta
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-start gap-6">
            <form onSubmit={revisar} noValidate className="flex min-w-0 flex-[999_1_520px] flex-col gap-5">
              {comVariacoes.length > 0 && (
                <section className={CARTAO}>
                  <h2 className="font-display text-[17px] font-extrabold">Escolha as opções</h2>
                  <div className="mt-4 flex flex-col gap-4">
                    {comVariacoes.map((p) => (
                      <label key={p.id} className="flex flex-col gap-[7px]">
                        <span className={CLASSE_DO_ROTULO}>{p.nome}</span>
                        <select value={variacoes[p.id] ?? ""} onChange={(e) => setVariacoes((v) => ({ ...v, [p.id]: e.target.value }))} className={CLASSE_DO_CAMPO}>
                          <option value="" disabled>
                            Escolha
                          </option>
                          {p.variacoes.map((v) => (
                            <option key={v.id} value={v.id} disabled={v.restantes <= 0}>
                              {v.nome}
                              {v.restantes <= 0 ? " (esgotado)" : ""}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>
                </section>
              )}

              <fieldset className={CARTAO} disabled={enviando}>
                <legend className="px-1.5 font-display text-[17px] font-extrabold">Forma de pagamento</legend>
                <div role="radiogroup" aria-label="Forma de pagamento" className="mt-1 grid grid-cols-[repeat(auto-fit,minmax(min(100%,150px),1fr))] gap-2.5">
                  {METODOS.map(({ id, rotulo, Icone }) => {
                    const marcado = metodo === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        role="radio"
                        aria-checked={marcado}
                        onClick={() => setMetodo(id)}
                        className={`flex items-center gap-3 rounded-xl border-[1.5px] px-4 py-3.5 text-left transition-colors hover:border-azul ${marcado ? "border-azul bg-azul/15" : "border-linha-forte bg-superficie"}`}
                      >
                        <span aria-hidden="true" className={`grid h-[18px] w-[18px] place-items-center rounded-full border-2 ${marcado ? "border-azul" : "border-linha-forte"}`}>
                          {marcado && <span className="h-2 w-2 rounded-full bg-azul" />}
                        </span>
                        <span className="font-display text-[15px] font-bold">{rotulo}</span>
                        <Icone size={24} weight={marcado ? "duotone" : "regular"} aria-hidden="true" className={`ml-auto ${marcado ? "text-azul-ceu" : "text-ardosia"}`} />
                      </button>
                    );
                  })}
                </div>
                {metodo === "CARTAO" ? (
                  <div className="mt-5">
                    <CamposDoCartao cartao={cartao} setCartao={setCartao} parcelas={parcelas} setParcelas={setParcelas} maxParcelas={maxParcelas} valorEmCentavos={total} opcoes={opcoes} />
                  </div>
                ) : (
                  <p className="mt-5 rounded-xl bg-nevoa p-4 text-[14.5px] leading-[1.6] text-ardosia-escura">
                    Ao confirmar, aparece o QR Code e o código PIX para copiar. O acesso é liberado assim que o pagamento é confirmado.
                  </p>
                )}
              </fieldset>

              {config && !pagamentoDisponivel && <p role="alert" className={AVISO_DE_ERRO}>{PAGAMENTO_INDISPONIVEL}</p>}
              {!combo.disponivel && (
                <p role="alert" className={AVISO_DE_ERRO}>
                  Este combo está indisponível agora: alguma parte dele saiu de venda.
                </p>
              )}
              {erro && (
                <p role="alert" className={AVISO_DE_ERRO}>
                  {erro}
                </p>
              )}

              <button
                type="submit"
                disabled={!podePagar}
                className="btn-q btn-q-azul h-14 w-full rounded-xl text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_12px_26px_-14px_rgba(0,107,255,1)] disabled:cursor-not-allowed disabled:bg-linha-forte disabled:shadow-none"
              >
                {enviando ? "Processando…" : metodo === "CARTAO" ? "Pagar com cartão" : "Gerar PIX"}
              </button>
            </form>

            <aside className="flex-[1_1_300px] rounded-[18px] border border-linha bg-superficie shadow-cartao p-6 lg:sticky lg:top-[120px]">
              <h2 className="mb-1 font-display text-lg font-extrabold">Combo</h2>
              <p className="mb-3 text-[14px] font-semibold text-azul-ceu">{combo.nome}</p>
              <ul>
                {combo.componentes.map((p) => (
                  <li key={p.tipo + p.id} className="flex justify-between gap-3 border-b border-linha py-2.5 text-sm">
                    <span className="min-w-0">
                      <span className="block font-semibold">{p.nome}</span>
                      <span className="text-[12.5px] text-ardosia">{detalheDaParte(p)}</span>
                    </span>
                    {p.precoEmCentavos !== null && <s className="whitespace-nowrap text-ardosia [font-variant-numeric:tabular-nums]">{emReais(p.precoEmCentavos)}</s>}
                  </li>
                ))}
              </ul>
              {!!acrescimo && (
                <div className="flex items-center justify-between gap-3 border-b border-linha py-2.5 text-sm">
                  <span className="text-ardosia-escura">Acréscimo do parcelamento</span>
                  <span className="whitespace-nowrap font-semibold [font-variant-numeric:tabular-nums]">+ {emReais(acrescimo)}</span>
                </div>
              )}
              <div className="mt-3.5 flex items-baseline justify-between">
                <span className="font-semibold">Total do combo</span>
                <span className="font-display text-[26px] font-extrabold tracking-[-0.03em] [font-variant-numeric:tabular-nums]">{emReais(total + (acrescimo ?? 0))}</span>
              </div>
              {!!combo.economiaEmCentavos && <p className="mt-2 text-[13px] font-semibold text-[#5FD39A]">Você economiza {emReais(combo.economiaEmCentavos)}.</p>}
              <Link href={`/combos/${combo.slug}`} className="mt-3 flex min-h-11 items-center justify-center text-sm font-semibold text-ardosia-escura hover:text-azul-ceu">
                Voltar ao combo
              </Link>
            </aside>

            {revisando && (
              <RevisaoDoPedido
                linhas={combo.componentes.map((p) => ({ id: p.tipo + p.id, nome: p.nome, detalhe: detalheDaParte(p), valorEmCentavos: p.precoEmCentavos }))}
                desconto={combo.economiaEmCentavos ? { rotulo: "Desconto do combo", valorEmCentavos: combo.economiaEmCentavos } : null}
                acrescimoEmCentavos={acrescimo ?? 0}
                totalEmCentavos={total + (acrescimo ?? 0)}
                gratuito={false}
                pagamento={[
                  metodo === "PIX"
                    ? "PIX · o QR Code e o código para copiar aparecem na próxima tela"
                    : `Cartão final ${cartao.numero.replace(/\D/g, "").slice(-4)} · ${
                        parcelas === 1 ? "à vista" : `${parcelas}x de ${emReais(opcoes?.opcoes.find((o) => o.parcelas === parcelas)?.parcelaEmCentavos ?? 0)}`
                      }`,
                ]}
                rotuloDoBotao={metodo === "PIX" ? "Confirmar e gerar PIX" : "Confirmar e pagar"}
                enviando={enviando}
                onConfirmar={confirmar}
                onVoltar={() => setRevisando(false)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
