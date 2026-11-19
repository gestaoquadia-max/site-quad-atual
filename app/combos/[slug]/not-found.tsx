import ForaDeVenda from "@/components/ForaDeVenda";

export const metadata = { title: "Este combo não está mais à venda", description: "As vendas deste combo fecharam, ou o endereço mudou. Veja os combos disponíveis." };

export default function NotFound() {
  return <ForaDeVenda titulo="Este combo não está mais à venda" texto="As vendas deste combo fecharam, ou o endereço mudou. Veja os combos disponíveis." lista={{ href: "/combos", rotulo: "Ver os combos" }} />;
}
