"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Barcode, CreditCard, PixLogo } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { ErroDaApi } from "@/lib/http";
import { buscarConfiguracaoDoPagamento, emReais, fecharCarrinho, type ConfiguracaoDoPagamento, type DadosDoFechamento } from "@/lib/loja";
import { ErroDoCartao, formatarNumeroDoCartao, formatarValidade, problemaNoCartao, tokenizarCartao, type DadosDoCartao } from "@/lib/pagarme";
import { rotaComDestino } from "@/lib/redirecionamento";
import type { Carreira } from "@/lib/simulados";
import { usePedido } from "@/lib/usePedido";
import { useTokenDeAcesso } from "@/lib/usuario";
import { CLASSE_DO_CAMPO, CLASSE_DO_ROTULO } from "../acesso/Campos";
import { ehFisico, motivoDaIndisponibilidade, ROTULO_DO_TIPO } from "./Carrinho";
import Etapas from "./Etapas";

// Formas de pagamento e seus ícones (Phosphor, a mesma biblioteca para todos).
const METODOS = [
  { id: "CARTAO", rotulo: "Cartão", Icone: CreditCard },
  { id: "PIX", rotulo: "PIX", Icone: PixLogo },
  { id: "BOLETO", rotulo: "Boleto", Icone: Barcode },
] as const;
type Metodo = (typeof METODOS)[number]["id"];

const CARTAO = "rounded-[18px] border border-linha bg-white p-6";
const AVISO_DE_ERRO = "rounded-xl border border-[#F1C4C4] bg-[#FFF5F5] p-4 text-sm leading-[1.55] text-[#9B1C1C]";
const PAGAMENTO_INDISPONIVEL = "O pagamento online está indisponível no momento. Tente mais tarde ou fale com o nosso atendimento pelo WhatsApp.";

function horaCurta(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function Vazio() {
  return (
    <div className="grid justify-items-center gap-3 rounded-[18px] border border-linha bg-white p-[clamp(36px,6vw,64px)] text-center">
      <h2 className="font-display text-[22px] font-extrabold">Seu carrinho está vazio</h2>
      <p className="max-w-[400px] text-[15px] text-ardosia">Escolha uma turma, material ou evento para continuar.</p>
      <div className="mt-2.5 flex flex-wrap justify-center gap-2.5">
        <Link href="/turmas" className="btn-q btn-q-azul h-12 px-[22px] text-[15px]">
          Ver turmas
        </Link>
        <Link href="/produtos" className="btn-q btn-q-contorno h-12 px-[22px] text-[15px]">
          Ver materiais
        </Link>
      </div>
    </div>
  );
}

// Sem login: a compra é feita na conta do aluno (o carrinho fica guardado no navegador até ele voltar).
function PedirLogin() {
  return (
    <div className="grid justify-items-center gap-3 rounded-[18px] border border-linha bg-white p-[clamp(36px,6vw,64px)] text-center">
      <h2 className="font-display text-[22px] font-extrabold">Entre para finalizar a compra</h2>
      <p className="max-w-[440px] text-[15px] leading-[1.55] text-ardosia">
        A compra fica registrada na sua conta, e é lá que você acessa turmas, materiais e eventos. Seu carrinho continua guardado.
      </p>
      <div className="mt-2.5 flex flex-wrap justify-center gap-2.5">
        <Link href={rotaComDestino("/entrar", "/checkout")} className="btn-q btn-q-azul h-12 px-[22px] text-[15px]">
          Entrar
        </Link>
        <Link href={rotaComDestino("/cadastro", "/checkout")} className="btn-q btn-q-contorno h-12 px-[22px] text-[15px]">
          Criar conta
        </Link>
      </div>
    </div>
  );
}

export default function Checkout({ carreiras }: { carreiras: Carreira[] | null }) {
  const router = useRouter();
  const { items, carregado, clear } = useCart();
  const token = useTokenDeAcesso();
  const logado = !!token;
  const { estado, cupom, aplicarCupom, refazer } = usePedido(items, carregado && logado && items.length > 0);
  const [config, setConfig] = useState<ConfiguracaoDoPagamento | null>(null);
  const [metodo, setMetodo] = useState<Metodo>("CARTAO");
  const [parcelas, setParcelas] = useState(1);
  const [cartao, setCartao] = useState<DadosDoCartao>({ numero: "", nome: "", validade: "", cvv: "" });
  const [cupomDigitado, setCupomDigitado] = useState("");
  const [erroDoCupom, setErroDoCupom] = useState("");
  const [aplicandoCupom, setAplicandoCupom] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  // Mesma chave enquanto o aluno tenta pagar o mesmo pedido: um reenvio não vira uma segunda cobrança.
  const chaveDoPagamento = useRef<string | null>(null);

  useEffect(() => {
    if (!logado) return;
    buscarConfiguracaoDoPagamento()
      .then(setConfig)
      .catch(() => setConfig({ disponivel: false, chavePublica: null, parcelasMaximas: 1, cartoesMaximos: 1, valorMinimoPorCartaoEmCentavos: 0 }));
  }, [logado]);

  const pedido = estado.fase === "pronto" ? estado.pedido : null;
  const simulacao = pedido?.simulacao ?? null;
  const total = simulacao?.totalEmCentavos ?? 0;
  const gratuito = !!simulacao?.gratuita;
  const recusados = new Map(pedido?.recusados ?? []);
  for (const i of items) {
    const motivo = motivoDaIndisponibilidade(i, carreiras);
    if (motivo && !recusados.has(i.id)) recusados.set(i.id, motivo);
  }
  const temRecusado = recusados.size > 0;
  const temTurma = items.some((i) => i.tipo === "turma");
  const temFisico = items.some(ehFisico);
  const pagamentoDisponivel = !!config?.disponivel;
  const maxParcelas = Math.max(1, config?.parcelasMaximas ?? 1);
  const podePagar = !!pedido && !!simulacao && !temRecusado && !enviando && (gratuito || pagamentoDisponivel);

  async function aplicar(codigo: string | null) {
    setErroDoCupom("");
    setAplicandoCupom(true);
    try {
      await aplicarCupom(codigo);
      if (!codigo) setCupomDigitado("");
      chaveDoPagamento.current = null;
    } catch (e) {
      setErroDoCupom(e instanceof ErroDaApi ? e.message : "Não foi possível conferir o cupom agora.");
    } finally {
      setAplicandoCupom(false);
    }
  }

  async function confirmar(e: React.FormEvent) {
    e.preventDefault();
    if (!podePagar) return;
    setErro("");
    let dados: DadosDoFechamento;
    if (gratuito) {
      dados = { formaDePagamento: "CUPOM", cupom: cupom ?? undefined };
    } else if (metodo === "CARTAO") {
      const problema = problemaNoCartao(cartao);
      if (problema) return setErro(problema);
      if (!config?.chavePublica) return setErro(PAGAMENTO_INDISPONIVEL);
      setEnviando(true);
      try {
        const tokenDoCartao = await tokenizarCartao(config.chavePublica, cartao);
        dados = { formaDePagamento: "CARTAO", pagamento: { cartao: { token: tokenDoCartao, parcelas } }, cupom: cupom ?? undefined };
      } catch (e) {
        setEnviando(false);
        return setErro(e instanceof ErroDoCartao ? e.message : "Não foi possível validar o cartão.");
      }
    } else {
      dados = { formaDePagamento: metodo, cupom: cupom ?? undefined };
    }

    setEnviando(true);
    chaveDoPagamento.current ??= crypto.randomUUID();
    try {
      const fechamento = await fecharCarrinho(dados, chaveDoPagamento.current);
      if (fechamento.situacao === "PAGA") {
        clear();
        router.push(`/checkout/confirmacao?status=${gratuito ? "inscricao" : "aprovado"}`);
      } else if (fechamento.situacao === "AGUARDANDO_PAGAMENTO" || fechamento.situacao === "CRIADA") {
        clear();
        router.push(`/checkout/pagamento/${fechamento.id}`);
      } else {
        // Recusado: outra tentativa é outro pagamento, com outra chave; as reservas são refeitas.
        chaveDoPagamento.current = null;
        setErro(fechamento.pagamento?.cartao?.recusa?.mensagem ?? "O pagamento não foi aprovado e nada foi cobrado. Confira os dados ou escolha outra forma de pagamento.");
        setEnviando(false);
        refazer();
      }
    } catch (e) {
      setEnviando(false);
      if (e instanceof ErroDaApi && e.codigo === "PAGAMENTO_INDISPONIVEL") return setErro(PAGAMENTO_INDISPONIVEL);
      // Erro de regra (vaga acabou, reserva venceu...): não houve cobrança; refaz o pedido para mostrar o que mudou.
      if (e instanceof ErroDaApi && e.status >= 400 && e.status < 500) {
        chaveDoPagamento.current = null;
        refazer();
      }
      setErro(e instanceof ErroDaApi ? e.message : "Não foi possível concluir o pagamento. Verifique sua internet e tente novamente.");
    }
  }

  const titulo = gratuito ? "Confirmar inscrição" : temTurma ? "Finalizar matrícula" : "Finalizar compra";

  return (
    <div className="bg-nevoa">
      <div className="mx-auto max-w-[1120px] px-[clamp(20px,4vw,32px)] pb-[clamp(64px,8vw,96px)] pt-[clamp(36px,5vw,64px)]">
        <Etapas atual="Pagamento" />
        <h1 className="mb-7 font-display text-[clamp(2rem,4vw,2.8rem)] font-extrabold tracking-[-0.03em]">{titulo}</h1>

        {/* Ainda lendo o carrinho e a sessão salvos no navegador: a área reservada evita que o rodapé pule (CLS). */}
        {!carregado || token === undefined ? (
          <div role="status" aria-label="Carregando" className="min-h-[50vh]" />
        ) : items.length === 0 ? (
          <Vazio />
        ) : !logado ? (
          <PedirLogin />
        ) : estado.fase === "erro" ? (
          <div className="grid justify-items-start gap-4 rounded-[18px] border border-linha bg-white p-6">
            <p role="alert" className={AVISO_DE_ERRO}>
              {estado.mensagem}
            </p>
            <button type="button" onClick={refazer} className="btn-q btn-q-contorno h-11 px-5 text-sm">
              Tentar novamente
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-start gap-6">
            <form onSubmit={confirmar} noValidate className="flex min-w-0 flex-[999_1_520px] flex-col gap-5">
              {gratuito ? (
                <section className={CARTAO}>
                  <h2 className="font-display text-[17px] font-extrabold">Sem custo</h2>
                  <p className="mt-2 text-[15px] leading-[1.6] text-ardosia-escura">
                    Nenhum pagamento é necessário. Ao confirmar, seu pedido é registrado e os detalhes são enviados para o seu e-mail.
                  </p>
                </section>
              ) : (
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
                          className={`flex items-center gap-3 rounded-xl border-[1.5px] px-4 py-3.5 text-left transition-colors hover:border-azul ${
                            marcado ? "border-azul bg-azul-gelo" : "border-linha-forte bg-white"
                          }`}
                        >
                          <span aria-hidden="true" className={`grid h-[18px] w-[18px] place-items-center rounded-full border-2 ${marcado ? "border-azul" : "border-[#B5C1D1]"}`}>
                            {marcado && <span className="h-2 w-2 rounded-full bg-azul" />}
                          </span>
                          <span className="font-display text-[15px] font-bold">{rotulo}</span>
                          <Icone size={24} weight={marcado ? "duotone" : "regular"} aria-hidden="true" className={`ml-auto ${marcado ? "text-azul" : "text-ardosia"}`} />
                        </button>
                      );
                    })}
                  </div>

                  {metodo === "CARTAO" && (
                    <div className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-4">
                      <CampoDoCartao
                        rotulo="Número do cartão"
                        placeholder="0000 0000 0000 0000"
                        autoComplete="cc-number"
                        valor={cartao.numero}
                        aoMudar={(v) => setCartao((c) => ({ ...c, numero: formatarNumeroDoCartao(v) }))}
                        className="col-span-full"
                      />
                      <CampoDoCartao rotulo="Validade" placeholder="MM/AA" autoComplete="cc-exp" valor={cartao.validade} aoMudar={(v) => setCartao((c) => ({ ...c, validade: formatarValidade(v) }))} />
                      <CampoDoCartao rotulo="CVV" placeholder="123" autoComplete="cc-csc" valor={cartao.cvv} aoMudar={(v) => setCartao((c) => ({ ...c, cvv: v.replace(/\D/g, "").slice(0, 4) }))} />
                      <CampoDoCartao
                        rotulo="Nome impresso no cartão"
                        placeholder="Como está no cartão"
                        autoComplete="cc-name"
                        valor={cartao.nome}
                        aoMudar={(v) => setCartao((c) => ({ ...c, nome: v }))}
                        className="col-span-full"
                        texto
                      />
                      <label className="col-span-full flex flex-col gap-[7px]">
                        <span className={CLASSE_DO_ROTULO}>Parcelamento</span>
                        <select value={parcelas} onChange={(e) => setParcelas(Number(e.target.value))} className={CLASSE_DO_CAMPO}>
                          {Array.from({ length: maxParcelas }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={n}>
                              {n}x de {emReais(Math.ceil(total / n))}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  )}
                  {metodo === "PIX" && (
                    <p className="mt-5 rounded-xl bg-nevoa p-4 text-[14.5px] leading-[1.6] text-ardosia-escura">
                      Ao confirmar, aparece o QR Code e o código PIX para copiar. O acesso é liberado assim que o pagamento é confirmado.
                    </p>
                  )}
                  {metodo === "BOLETO" && (
                    <p className="mt-5 rounded-xl bg-nevoa p-4 text-[14.5px] leading-[1.6] text-ardosia-escura">
                      Ao confirmar, aparece a linha digitável e o PDF do boleto. A compensação leva de 1 a 2 dias úteis depois do pagamento.
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-2 text-[12.5px] text-ardosia">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <rect x="4" y="11" width="16" height="10" rx="2" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                    Processado com segurança via Pagar.me · Os dados do cartão não passam pelo nosso servidor
                  </div>
                </fieldset>
              )}

              {temFisico && (
                <section className={CARTAO}>
                  <h2 className="font-display text-[17px] font-extrabold">Entrega</h2>
                  <p className="mt-1.5 text-[14.5px] text-ardosia-escura">Retirada gratuita na sede do Quad. Você recebe o aviso quando o material estiver disponível.</p>
                </section>
              )}

              {config && !pagamentoDisponivel && !gratuito && (
                <p role="alert" className={AVISO_DE_ERRO}>
                  {PAGAMENTO_INDISPONIVEL}
                </p>
              )}
              {temRecusado && (
                <p role="alert" className={AVISO_DE_ERRO}>
                  Há itens que não podem ser comprados agora (veja no resumo).{" "}
                  <Link href="/carrinho" className="font-semibold underline underline-offset-2">
                    Revise o carrinho
                  </Link>{" "}
                  para continuar.
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
                aria-busy={enviando || undefined}
                className="btn-q btn-q-azul h-14 w-full rounded-xl text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_12px_26px_-14px_rgba(0,107,255,1)] disabled:cursor-not-allowed disabled:bg-[#C9D3E0] disabled:shadow-none"
              >
                {enviando ? "Processando…" : gratuito ? "Confirmar pedido" : metodo === "CARTAO" ? "Pagar com cartão" : metodo === "PIX" ? "Gerar PIX" : "Gerar boleto"}
              </button>
            </form>

            <aside className="flex-[1_1_300px] rounded-[18px] border border-linha bg-white p-6 lg:sticky lg:top-[120px]">
              <h2 className="mb-3.5 font-display text-lg font-extrabold">Pedido</h2>
              {estado.fase === "preparando" ? (
                <div role="status" className="py-6 text-sm text-ardosia">
                  Reservando seus itens…
                </div>
              ) : (
                <>
                  <ul>
                    {items.map((item) => {
                      const linha = pedido?.linhas.get(item.id);
                      const linhaSimulada = simulacao?.linhas.find((l) => l.linhaId === linha?.id);
                      const motivo = recusados.get(item.id);
                      return (
                        <li key={item.id} className="flex justify-between gap-3 border-b border-[#EEF2F7] py-2.5 text-sm">
                          <span className="min-w-0">
                            <span className="block font-semibold">
                              {linha?.nome ?? item.nome}
                              {item.quantidade > 1 && ` × ${item.quantidade}`}
                            </span>
                            <span className="text-[12.5px] text-ardosia">
                              {ROTULO_DO_TIPO[item.tipo]}
                              {item.tag ? ` · ${item.tag}` : ""}
                            </span>
                            {motivo && <span className="mt-1 block text-[12.5px] font-semibold text-[#B42323]">{motivo}</span>}
                          </span>
                          <span className="whitespace-nowrap font-semibold [font-variant-numeric:tabular-nums]">{linhaSimulada ? emReais(linhaSimulada.subtotalEmCentavos) : "—"}</span>
                        </li>
                      );
                    })}
                  </ul>

                  {simulacao && simulacao.descontoEmCentavos > 0 && (
                    <div className="flex items-center justify-between border-b border-[#EEF2F7] py-2.5 text-sm">
                      <span className="flex items-center gap-2 text-ardosia-escura">
                        Cupom <span className="font-semibold text-azul-forte">{cupom}</span>
                        <button type="button" onClick={() => aplicar(null)} aria-label="Remover cupom" className="text-ardosia hover:text-[#B42323]">
                          ✕
                        </button>
                      </span>
                      <span className="font-semibold text-[#13774A]">− {emReais(simulacao.descontoEmCentavos)}</span>
                    </div>
                  )}

                  {simulacao && !cupom && (
                    <div className="border-b border-[#EEF2F7] py-3.5">
                      <form
                        className="flex gap-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (cupomDigitado.trim()) aplicar(cupomDigitado.trim());
                        }}
                      >
                        <label className="sr-only" htmlFor="cupom">
                          Cupom de desconto
                        </label>
                        <input
                          id="cupom"
                          value={cupomDigitado}
                          onChange={(e) => setCupomDigitado(e.target.value)}
                          placeholder="Cupom de desconto"
                          className="h-11 w-full rounded-[10px] border border-linha-forte bg-white px-3 text-sm text-tinta outline-none placeholder:text-[#97A3B4] focus:border-azul"
                        />
                        <button type="submit" disabled={aplicandoCupom} className="btn-q btn-q-contorno h-11 px-4 text-sm disabled:opacity-60">
                          {aplicandoCupom ? "…" : "Aplicar"}
                        </button>
                      </form>
                      {erroDoCupom && (
                        <p role="alert" className="mt-2 text-[12.5px] text-[#B42323]">
                          {erroDoCupom}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-3.5 flex items-baseline justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-display text-[26px] font-extrabold tracking-[-0.03em] [font-variant-numeric:tabular-nums]">
                      {gratuito ? "Gratuito" : simulacao ? emReais(total) : "—"}
                    </span>
                  </div>
                  {pedido?.expiraEm && pedido.linhas.size > 0 && (
                    <p className="mt-2 text-[12.5px] text-ardosia">Itens reservados para você até {horaCurta(pedido.expiraEm)}.</p>
                  )}
                </>
              )}
              <Link href="/carrinho" className="mt-3 flex min-h-11 items-center justify-center text-sm font-semibold text-[#3E4A5E] hover:text-azul">
                Editar carrinho
              </Link>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

function CampoDoCartao({
  rotulo,
  placeholder,
  autoComplete,
  valor,
  aoMudar,
  className = "",
  texto = false,
}: {
  rotulo: string;
  placeholder: string;
  autoComplete: string;
  valor: string;
  aoMudar: (v: string) => void;
  className?: string;
  texto?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-[7px] ${className}`}>
      <span className={CLASSE_DO_ROTULO}>{rotulo}</span>
      <input
        type="text"
        inputMode={texto ? undefined : "numeric"}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        className={CLASSE_DO_CAMPO}
      />
    </label>
  );
}
