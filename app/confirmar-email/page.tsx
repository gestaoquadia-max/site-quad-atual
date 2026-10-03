import ConfirmarEmailConteudo from "./ConfirmarEmailConteudo";

export const metadata = { title: "Confirmar e-mail — Quad Concursos" };

// O link chega por e-mail como /confirmar-email?token=...
export default async function ConfirmarEmailPage({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const { token } = await searchParams;
  return <ConfirmarEmailConteudo token={typeof token === "string" ? token : null} />;
}
