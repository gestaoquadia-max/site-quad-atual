"use client";

import { useSearchParams } from "next/navigation";
import { carreiras } from "@/lib/simulados";
import CentralDeSimulados, { type Modo } from "./CentralDeSimulados";

// /simulados?modo=individual&c=investigador-pcba abre já na aba e na carreira (links de Materiais e do menu).
// A central usa a data de hoje para separar as edições; montada só no navegador, ela nunca diverge do HTML do servidor.
export default function ComParametrosDoEndereco() {
  const p = useSearchParams();
  const modo: Modo = p.get("modo") === "individual" ? "individuais" : p.get("modo") === "combos" ? "combos" : "presenciais";
  const c = p.get("c");
  return <CentralDeSimulados modoInicial={modo} carreiraInicial={carreiras.some((x) => x.id === c) ? c : null} />;
}
