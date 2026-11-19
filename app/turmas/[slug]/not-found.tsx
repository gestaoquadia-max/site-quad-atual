import ForaDeVenda from "@/components/ForaDeVenda";

export const metadata = { title: "Esta turma não está mais à venda", description: "As matrículas desta turma fecharam, ou o endereço mudou. Veja as turmas com matrículas abertas." };

export default function NotFound() {
  return <ForaDeVenda titulo="Esta turma não está mais à venda" texto="As matrículas desta turma fecharam, ou o endereço mudou. Veja as turmas com matrículas abertas." lista={{ href: "/turmas", rotulo: "Ver as turmas" }} />;
}
