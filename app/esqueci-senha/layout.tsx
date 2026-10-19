import { NAO_INDEXAR } from "@/lib/seo";

// A página é um componente de cliente, que não pode exportar metadados; eles ficam aqui.
export const metadata = {
  title: "Esqueci minha senha",
  description: "Receba por e-mail o link para criar uma nova senha de acesso à área do aluno do Quad Concursos.",
  robots: NAO_INDEXAR,
};

export default function EsqueciSenhaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
