"use client";

import { usePathname } from "next/navigation";

// Telas com moldura própria (acesso e área do aluno): sem o menu, os avisos e o rodapé do site.
const ROTAS_COM_MOLDURA_PROPRIA = ["/entrar", "/cadastro", "/esqueci-senha", "/redefinir-senha", "/confirmar-email", "/aluno"];

export function temMolduraPropria(caminho: string) {
  return ROTAS_COM_MOLDURA_PROPRIA.some((r) => caminho === r || caminho.startsWith(r + "/"));
}

export default function SoNoSite({ children }: { children: React.ReactNode }) {
  const caminho = usePathname();
  return temMolduraPropria(caminho) ? null : children;
}
