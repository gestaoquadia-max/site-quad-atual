"use client";

import { abrirPreferenciasDeCookies } from "@/lib/consentimento";

// Reabre o painel de cookies (components/AvisoDeCookies.tsx): mudar a escolha tem de ser tão fácil quanto fazê-la.
export default function BotaoPreferenciasDeCookies({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={abrirPreferenciasDeCookies} className={className}>
      Preferências de cookies
    </button>
  );
}
