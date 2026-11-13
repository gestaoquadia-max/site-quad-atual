"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { aplicarConsentimento, lead, visitaDePagina } from "@/lib/analytics";
import { assinarConsentimento, consentimentoAtual } from "@/lib/consentimento";

// Liga as tags só depois do "sim" no aviso de cookies (GA4 com "análise"; Google Ads e Pixel da Meta com
// "marketing"), e as desliga se a escolha mudar ("Preferências de cookies" no rodapé, inclusive em outra aba).
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
  const marketing = escolha[1] === "1";
  const pagina = usePathname();

  // Lê a escolha de verdade (e não o snapshot): na hidratação o snapshot ainda é o do servidor ("00"), e aplicá-lo
  // mandaria um "negado" logo antes do "aceito" a quem já tinha aceitado.
  useEffect(() => {
    const c = consentimentoAtual();
    aplicarConsentimento({ analise: c?.analise === true, marketing: c?.marketing === true });
  }, [escolha]);

  // O PageView da Meta a cada página (o site troca de página sem recarregar). O GA mede isso sozinho.
  useEffect(() => {
    if (marketing) visitaDePagina();
  }, [pagina, marketing]);

  // Lead: o clique em qualquer convite de grupo do WhatsApp (o Grupo VIP), venha de onde vier.
  useEffect(() => {
    if (!marketing) return;
    const aoClicar = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.("a[href^='https://chat.whatsapp.com/']");
      if (link) lead(`Grupo VIP (${window.location.pathname})`);
    };
    document.addEventListener("click", aoClicar, true);
    return () => document.removeEventListener("click", aoClicar, true);
  }, [marketing]);

  return null;
}
