import ForaDeVenda from "@/components/ForaDeVenda";

export const metadata = { title: "Este material não está mais à venda", description: "As vendas deste material fecharam, ou o endereço mudou. Veja os materiais disponíveis." };

export default function NotFound() {
  return <ForaDeVenda titulo="Este material não está mais à venda" texto="As vendas deste material fecharam, ou o endereço mudou. Veja os materiais disponíveis." lista={{ href: "/produtos", rotulo: "Ver os materiais" }} />;
}
