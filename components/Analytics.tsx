"use client";

import { useEffect, useSyncExternalStore } from "react";
import { aplicarConsentimento } from "@/lib/analytics";
import { assinarConsentimento, consentimentoAtual } from "@/lib/consentimento";

// Liga as tags do Google só depois do "sim" no aviso de cookies (GA4 com "análise", Google Ads com "marketing"), e
// as desliga se a escolha mudar ("Preferências de cookies" no rodapé, inclusive em outra aba).
// O snapshot é um texto (e não um objeto) para o useSyncExternalStore comparar sem renderizar à toa.
export default function Analytics() {
  const escolha = useSyncExternalStore(
    assinarConsentimento,
    () => {
      const c = consentimentoAtual();
      return `${c?.analise === true ? 1 : 0}${c?.marketing === true ? 1 : 0}`;
    },
    () => "00",
  );

  useEffect(() => {
    aplicarConsentimento({ analise: escolha[0] === "1", marketing: escolha[1] === "1" });
  }, [escolha]);

  return null;
}
