import { fetchAutenticado } from "./auth";
import { lerErro } from "./http";

// Compra em reais pelo carrinho do servidor (docs/pedidos-backend.md, 5.1):
// o site reserva cada item (30 min), simula o total com o cupom e fecha tudo numa cobrança só.
// Todas as rotas exigem login.

// O que é comprado: um item da loja (material, produto, com ou sem variação) ou uma atividade (turma, evento, simulado).
export type Alvo = {
  itemId?: string;
  variacaoId?: string;
  atividade?: { tipo: "TURMA" | "EVENTO" | "SIMULADO"; id: string };
};

export type LinhaDoCarrinho = {
  id: string;
  alvo: { itemId: string | null; variacao: { id: string; nome: string } | null; atividade: { tipo: string; id: string } | null };
  nome: string;
  imagemUrl: string | null;
  quantidade: number;
  situacao: "VIGENTE" | "EXPIRADA" | "INDISPONIVEL";
  motivo: string | null;
  expiraEm: string;
};

export type CarrinhoDoServidor = { linhas: LinhaDoCarrinho[]; expiraEm: string | null };

export type Simulacao = {
  cupom: string | null;
  linhas: { linhaId: string; quantidade: number; subtotalEmCentavos: number; descontoEmCentavos: number; totalEmCentavos: number }[];
  subtotalEmCentavos: number;
  descontoEmCentavos: number;
  totalEmCentavos: number;
  gratuita: boolean;
};

export type SituacaoDoPagamento = "CRIADA" | "AGUARDANDO_PAGAMENTO" | "PAGA" | "RECUSADA" | "EXPIRADA" | "CANCELADA" | "ESTORNADA";

export type Fechamento = {
  id: string;
  situacao: SituacaoDoPagamento;
  totalEmCentavos: number;
  subtotalEmCentavos: number;
  descontoEmCentavos: number;
  cupom: string | null;
  compras: { id: string; item: { nome: string; variacao: { nome: string } | null }; quantidade: number }[];
  pagamento: {
    forma: "CARTAO" | "PIX" | "BOLETO" | "CUPOM" | "QUAD_COINS";
    valorEmCentavos: number;
    pix: { codigo: string | null; imagemUrl: string | null; expiraEm: string | null } | null;
    boleto: { linhaDigitavel: string | null; url: string | null; pdf: string | null; venceEm: string | null } | null;
    cartao: { bandeira: string | null; ultimosDigitos: string | null; parcelas: number | null; recusa: { codigo: string; mensagem: string } | null } | null;
  } | null;
};

export type ConfiguracaoDoPagamento = {
  disponivel: boolean;
  chavePublica: string | null;
  parcelasMaximas: number;
  cartoesMaximos: number;
  valorMinimoPorCartaoEmCentavos: number;
};

async function chamar<T>(caminho: string, mensagemPadrao: string, init: RequestInit = {}): Promise<T> {
  const res = await fetchAutenticado(caminho, {
    ...init,
    headers: { ...(init.body ? { "Content-Type": "application/json" } : {}), ...init.headers },
  });
  if (!res.ok) throw await lerErro(res, mensagemPadrao);
  return res.status === 204 ? (undefined as T) : res.json();
}

export function buscarConfiguracaoDoPagamento() {
  return chamar<ConfiguracaoDoPagamento>("/api/loja/pagamentos/configuracao", "Não foi possível carregar as formas de pagamento.");
}

export function esvaziarCarrinhoDoServidor() {
  return chamar<void>("/api/loja/carrinho/eu", "Não foi possível preparar o seu pedido.", { method: "DELETE" });
}

// Reserva a quantidade do item (reservar de novo o mesmo item troca a quantidade, não soma).
// Turma, evento e simulado são sempre um por aluno: a API recusa o campo quantidade neles (400).
export function reservar(alvo: Alvo, quantidade: number) {
  return chamar<CarrinhoDoServidor>("/api/loja/carrinho/eu/linhas", "Não foi possível reservar este item.", {
    method: "PUT",
    body: JSON.stringify(alvo.atividade ? alvo : { ...alvo, quantidade }),
  });
}

export function simular(cupom: string | null) {
  return chamar<Simulacao>("/api/loja/carrinho/eu/simulacao", "Não foi possível calcular o total.", {
    method: "POST",
    body: JSON.stringify(cupom ? { cupom } : {}),
  });
}

export type DadosDoFechamento = {
  formaDePagamento: "CARTAO" | "PIX" | "BOLETO" | "CUPOM";
  pagamento?: { cartao: { token: string; parcelas: number } };
  cupom?: string;
};

// A chave de idempotência evita cobrar duas vezes se o pedido for reenviado (clique duplo, rede instável).
export function fecharCarrinho(dados: DadosDoFechamento, chaveDeIdempotencia: string) {
  return chamar<Fechamento>("/api/loja/carrinho/eu/fechamento", "Não foi possível concluir o pagamento.", {
    method: "POST",
    headers: { "Idempotency-Key": chaveDeIdempotencia },
    body: JSON.stringify(dados),
  });
}

export function buscarFechamento(id: string) {
  return chamar<Fechamento>(`/api/loja/fechamentos/${id}`, "Não foi possível consultar o pagamento.");
}

// "Já paguei": pede à API para conferir no provedor agora, sem esperar o aviso dele.
export function conferirPagamento(id: string) {
  return chamar<Fechamento>(`/api/loja/fechamentos/${id}/conciliacao`, "Não foi possível conferir o pagamento.", { method: "POST" });
}

export function inscreverSeDeGraca(tipo: "EVENTO" | "SIMULADO", atividadeId: string) {
  return chamar<{ id: string }>("/api/inscricoes/eu", "Não foi possível fazer a inscrição.", {
    method: "POST",
    body: JSON.stringify({ tipo, atividadeId }),
  });
}

export function emReais(centavos: number) {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
