"use client";

import { useEffect, useSyncExternalStore } from "react";
import { aplicarConsentimentoDeAnalise } from "@/lib/analytics";
import { assinarConsentimento, consentimentoAtual } from "@/lib/consentimento";

// Liga o Google Analytics só depois do "sim" para os cookies de análise, e o desliga se a escolha mudar
// ("Preferências de cookies" no rodapé, inclusive em outra aba).
export default function Analytics() {
  const aceito = useSyncExternalStore(
    assinarConsentimento,
    () => consentimentoAtual()?.analise === true,
    () => false,
  );

  useEffect(() => {
    aplicarConsentimentoDeAnalise(aceito);
  }, [aceito]);

  return null;
}
