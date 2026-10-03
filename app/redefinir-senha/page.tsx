import RedefinirSenhaForm from "./RedefinirSenhaForm";

export const metadata = { title: "Redefinir senha — Quad Concursos" };

// O link chega por e-mail como /redefinir-senha?token=...
export default async function RedefinirSenhaPage({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const { token } = await searchParams;
  return <RedefinirSenhaForm token={typeof token === "string" ? token : null} />;
}
