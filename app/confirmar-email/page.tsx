import ConfirmarEmailConteudo from "./ConfirmarEmailConteudo";
import { NAO_INDEXAR } from "@/lib/seo";

export const metadata = {
  title: "Confirmar e-mail",
  description: "Confirme o seu e-mail para receber os avisos das suas compras e turmas no Quad Concursos.",
  robots: NAO_INDEXAR,
};

// O link chega por e-mail como /confirmar-email?token=...
export default async function ConfirmarEmailPage({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const { token } = await searchParams;
  return <ConfirmarEmailConteudo token={typeof token === "string" ? token : null} />;
}
