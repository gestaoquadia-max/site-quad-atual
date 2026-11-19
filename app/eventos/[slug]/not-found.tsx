import ForaDeVenda from "@/components/ForaDeVenda";

export const metadata = { title: "Este evento não está mais à venda", description: "As inscrições deste evento fecharam, ou o endereço mudou. Veja os próximos eventos na agenda." };

export default function NotFound() {
  return <ForaDeVenda titulo="Este evento não está mais à venda" texto="As inscrições deste evento fecharam, ou o endereço mudou. Veja os próximos eventos na agenda." lista={{ href: "/eventos", rotulo: "Ver a agenda" }} />;
}
