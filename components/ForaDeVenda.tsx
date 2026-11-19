import Link from "next/link";
import TelaDeAviso from "@/components/TelaDeAviso";

// A página de um produto que saiu de venda (recado da API de 19/11/2026): antes de abrir e depois do vendaAte, a vitrine
// responde 404, e o link divulgado (no Instagram, por exemplo) caía na "não encontrada" genérica. Aqui ele leva à lista.
export default function ForaDeVenda({ titulo, texto, lista }: { titulo: string; texto: string; lista: { href: string; rotulo: string } }) {
  return (
    <TelaDeAviso selo="Fora de venda" titulo={titulo} texto={texto}>
      <Link href={lista.href} className="btn-q btn-q-azul h-[52px] px-6 text-[15px]">
        {lista.rotulo}
      </Link>
      <Link href="/" className="btn-q btn-q-contorno-escuro h-[52px] px-6 text-[15px]">
        Voltar ao início
      </Link>
    </TelaDeAviso>
  );
}
