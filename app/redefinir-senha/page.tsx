import RedefinirSenhaForm from "./RedefinirSenhaForm";
import { NAO_INDEXAR } from "@/lib/seo";

export const metadata = {
  title: "Redefinir senha",
  description: "Crie uma nova senha de acesso à área do aluno do Quad Concursos.",
  robots: NAO_INDEXAR,
};

// O link chega por e-mail como /redefinir-senha?token=...
export default async function RedefinirSenhaPage({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const { token } = await searchParams;
  return <RedefinirSenhaForm token={typeof token === "string" ? token : null} />;
}
