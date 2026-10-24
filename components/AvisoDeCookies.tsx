"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { assinarConsentimento, consentimentoAtual, EVENTO_ABRIR_PREFERENCIAS, gravarConsentimento, type Consentimento } from "@/lib/consentimento";

// "carregando" no servidor e antes da hidratação: o aviso só aparece depois de ler a escolha salva, sem piscar.
function useEscolha() {
  return useSyncExternalStore<Consentimento | null | "carregando">(assinarConsentimento, consentimentoAtual, () => "carregando");
}

const CATEGORIAS = [
  {
    id: "essenciais",
    nome: "Essenciais",
    desc: "Mantêm você conectado à área do aluno e guardam os itens do carrinho. Sem eles o site não funciona, por isso ficam sempre ativos.",
  },
  {
    id: "analise",
    nome: "Análise de audiência",
    desc: "Medem visitas e uso das páginas, de forma agregada, para melhorarmos o site (ex.: Google Analytics).",
  },
  {
    id: "marketing",
    nome: "Marketing",
    desc: "Medem o resultado dos nossos anúncios e mostram anúncios do Quad em outras plataformas (ex.: Pixel da Meta).",
  },
] as const;

const BOTAO = "btn-q h-11 px-5 text-sm";

// Aviso no primeiro acesso e painel de preferências (aberto também por "Preferências de cookies", no rodapé).
export default function AvisoDeCookies() {
  const escolha = useEscolha();
  const [preferencias, setPreferencias] = useState(false);
  const [analise, setAnalise] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const painel = useRef<HTMLDivElement>(null);

  // "Preferências de cookies" (rodapé ou política de privacidade) abre o painel com a escolha atual marcada.
  useEffect(() => {
    function abrir() {
      const atual = consentimentoAtual();
      setAnalise(!!atual?.analise);
      setMarketing(!!atual?.marketing);
      setPreferencias(true);
    }
    window.addEventListener(EVENTO_ABRIR_PREFERENCIAS, abrir);
    return () => window.removeEventListener(EVENTO_ABRIR_PREFERENCIAS, abrir);
  }, []);

  // O painel recebe o foco ao abrir e fecha com Esc.
  useEffect(() => {
    if (!preferencias) return;
    painel.current?.focus();
    const fecharComEsc = (e: KeyboardEvent) => e.key === "Escape" && setPreferencias(false);
    window.addEventListener("keydown", fecharComEsc);
    return () => window.removeEventListener("keydown", fecharComEsc);
  }, [preferencias]);

  function decidir(e: { analise: boolean; marketing: boolean }) {
    gravarConsentimento(e);
    setPreferencias(false);
  }

  if (escolha === "carregando") return null;

  if (preferencias) {
    const marcado = { essenciais: true, analise, marketing };
    const alternar = { analise: () => setAnalise((v) => !v), marketing: () => setMarketing((v) => !v) };
    return (
      <div className="fixed inset-0 z-[90] grid place-items-center bg-marinho-950/60 p-4" onClick={() => setPreferencias(false)}>
        <div
          ref={painel}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-cookies"
          onClick={(e) => e.stopPropagation()}
          className="max-h-[90dvh] w-full max-w-[560px] overflow-y-auto rounded-[18px] bg-white p-[clamp(20px,3vw,28px)] text-tinta shadow-[0_30px_60px_-20px_rgba(7,20,38,0.6)] outline-none"
        >
          <h2 id="titulo-cookies" className="font-display text-[22px] font-extrabold tracking-[-0.02em]">
            Preferências de cookies
          </h2>
          <p className="mt-2 text-[14.5px] leading-[1.6] text-ardosia-escura">
            Escolha o que o site pode guardar no seu navegador. Você pode mudar isso quando quiser, aqui mesmo.
          </p>
          <ul className="mt-5 flex flex-col gap-3">
            {CATEGORIAS.map((c) => (
              <li key={c.id} className="flex items-start justify-between gap-4 rounded-xl border border-linha p-4">
                <div>
                  <span id={`cookie-${c.id}`} className="block font-display text-[15.5px] font-bold">
                    {c.nome}
                  </span>
                  <span className="mt-1 block text-[13.5px] leading-[1.55] text-ardosia">{c.desc}</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={marcado[c.id]}
                  aria-labelledby={`cookie-${c.id}`}
                  disabled={c.id === "essenciais"}
                  onClick={c.id === "essenciais" ? undefined : alternar[c.id]}
                  className={`relative mt-0.5 h-7 w-12 flex-none rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${marcado[c.id] ? "bg-azul" : "bg-[#C9D3E0]"}`}
                >
                  <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-[left] ${marcado[c.id] ? "left-6" : "left-1"}`} />
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap justify-end gap-2.5">
            <button type="button" onClick={() => decidir({ analise: false, marketing: false })} className={`${BOTAO} btn-q-contorno`}>
              Só os essenciais
            </button>
            <button type="button" onClick={() => decidir({ analise, marketing })} className={`${BOTAO} btn-q-azul`}>
              Salvar escolha
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Já escolheu: nada na tela (as preferências seguem no rodapé).
  if (escolha) return null;

  return (
    <section
      aria-label="Aviso de cookies"
      className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-[920px] rounded-[18px] border border-white/10 bg-marinho-900 p-[clamp(16px,2.4vw,22px)] text-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)] sm:inset-x-6 sm:bottom-6"
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <p className="min-w-[260px] flex-[1_1_420px] text-[14.5px] leading-[1.6] text-[#DCE4EF]">
          Usamos cookies essenciais para o site funcionar. Com a sua permissão, usamos também cookies de análise e de
          marketing para melhorar o site e os nossos anúncios.{" "}
          <Link href="/privacidade#cookies" className="font-semibold text-azul-ceu underline underline-offset-2 hover:text-white">
            Saiba mais
          </Link>
        </p>
        <div className="flex flex-wrap gap-2.5">
          <button type="button" onClick={() => setPreferencias(true)} className={`${BOTAO} btn-q-contorno-escuro`}>
            Personalizar
          </button>
          <button type="button" onClick={() => decidir({ analise: false, marketing: false })} className={`${BOTAO} btn-q-contorno-escuro`}>
            Só os essenciais
          </button>
          <button type="button" onClick={() => decidir({ analise: true, marketing: true })} className={`${BOTAO} btn-q-azul`}>
            Aceitar todos
          </button>
        </div>
      </div>
    </section>
  );
}
