import AreaDoAluno from "./AreaDoAluno";
import { NAO_INDEXAR } from "@/lib/seo";

// A área do aluno é um componente de cliente (confere o login no navegador); os metadados ficam aqui.
export const metadata = { robots: NAO_INDEXAR };

export default function AlunoLayout({ children }: { children: React.ReactNode }) {
  return <AreaDoAluno>{children}</AreaDoAluno>;
}
