// Consentimento de cookies (LGPD, arts. 7º e 8º): os essenciais (sessão do login e carrinho) não dependem de
// consentimento; os de análise de audiência e de marketing só rodam depois que o visitante aceita, e a escolha pode
// ser mudada a qualquer momento ("Preferências de cookies" no rodapé), tão fácil quanto foi dar (art. 8º, § 5º).
//
// Quem for ligar Google Analytics ou Pixel da Meta lê `consentimentoAtual()` (ou o hook `useConsentimento`) e só
// carrega o script com a categoria aceita; ao mudar a escolha, o evento EVENTO_CONSENTIMENTO avisa.

export type Consentimento = {
  analise: boolean;
  marketing: boolean;
  // Data da escolha, para provar quando o consentimento foi dado (art. 8º, § 2º).
  decididoEm: string;
  // Muda quando as categorias mudarem: uma versão nova pede a escolha de novo.
  versao: number;
};

const CHAVE = "quad-consentimento-cookies";
const VERSAO = 1;
export const EVENTO_CONSENTIMENTO = "quad-consentimento-mudou";
export const EVENTO_ABRIR_PREFERENCIAS = "quad-abrir-preferencias-de-cookies";

// Cache do texto lido, para o useSyncExternalStore devolver o mesmo objeto enquanto nada mudar.
let lido: { texto: string | null; valor: Consentimento | null } = { texto: null, valor: null };

// null = o visitante ainda não escolheu (ou a escolha é de uma versão antiga das categorias).
export function consentimentoAtual(): Consentimento | null {
  let texto: string | null = null;
  try {
    texto = localStorage.getItem(CHAVE);
  } catch {
    return null;
  }
  if (texto === lido.texto) return lido.valor;
  let valor: Consentimento | null = null;
  try {
    const c = texto ? (JSON.parse(texto) as Consentimento) : null;
    valor = c && c.versao === VERSAO ? c : null;
  } catch {
    valor = null;
  }
  lido = { texto, valor };
  return valor;
}

export function gravarConsentimento(escolha: { analise: boolean; marketing: boolean }) {
  const c: Consentimento = { ...escolha, decididoEm: new Date().toISOString(), versao: VERSAO };
  try {
    localStorage.setItem(CHAVE, JSON.stringify(c));
  } catch {
    // Navegador sem armazenamento (aba anônima restrita): vale só para esta visita.
  }
  window.dispatchEvent(new Event(EVENTO_CONSENTIMENTO));
}

export function abrirPreferenciasDeCookies() {
  window.dispatchEvent(new Event(EVENTO_ABRIR_PREFERENCIAS));
}

export function assinarConsentimento(aoMudar: () => void) {
  window.addEventListener(EVENTO_CONSENTIMENTO, aoMudar);
  // A escolha feita em outra aba vale nesta também.
  const daOutraAba = (e: StorageEvent) => e.key === CHAVE && aoMudar();
  window.addEventListener("storage", daOutraAba);
  return () => {
    window.removeEventListener(EVENTO_CONSENTIMENTO, aoMudar);
    window.removeEventListener("storage", daOutraAba);
  };
}
