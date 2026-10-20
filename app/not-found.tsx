import Link from "next/link";
import TelaDeAviso from "@/components/TelaDeAviso";

export const metadata = { title: "Página não encontrada", description: "A página que você procurou não existe ou mudou de endereço." };

export default function NotFound() {
  return (
    <TelaDeAviso selo="404" titulo="Página não encontrada" texto="O endereço que você acessou não existe ou foi movido. Confira o link ou volte para o início.">
      <Link href="/" className="btn-q btn-q-azul h-[52px] px-6 text-[15px]">
        Voltar ao início
      </Link>
      <Link href="/turmas" className="btn-q btn-q-contorno-escuro h-[52px] px-6 text-[15px]">
        Ver turmas
      </Link>
    </TelaDeAviso>
  );
}
