import Image from "next/image";
import Link from "next/link";
import type { DadosDoCartaoEvento, TomDoSelo } from "@/lib/eventos";
import { Brilho } from "../Brilho";

const CORES_DO_SELO: Record<TomDoSelo, string> = {
  aberta: "bg-sucesso-fundo text-sucesso",
  breve: "bg-azul-palido text-azul-forte",
  esgotado: "bg-[#FFF0D9] text-[#8A4B00]",
  encerrado: "bg-nevoa-clara text-[#4A5A70]",
};

// O texto do botão: os simulados levam à central deles; um evento com inscrição aberta ou em breve, à vaga; esgotado
// ou encerrado, só aos detalhes.
function rotuloDoBotao(evento: DadosDoCartaoEvento) {
  if (evento.id === "simulados") return "Ver simulados";
  if (evento.selo.tom === "aberta" || evento.selo.tom === "breve") return "Garantir minha vaga";
  return "Ver detalhes";
}

// Cartão de evento (Home e Agenda). Desde 11/11/2026 (entrega da designer), o cartão inteiro é um link para a página do
// evento, e o botão fica sempre à vista (antes, o acordeão "Informações" com o carrinho e os detalhes).
export default function CartaoEvento({ evento }: { evento: DadosDoCartaoEvento }) {
  return (
    <Link
      href={evento.href}
      data-glow=""
      className="group relative flex h-full flex-col rounded-[18px] border border-linha bg-superficie p-2 text-tinta shadow-cartao transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-azul/45 hover:text-tinta hover:shadow-cartao-alto"
    >
      <Brilho intensidade={0.08} />
      {/* Arte do evento (1:1). Enquanto não há arte, o fundo leva o logo do Quad em marca d'água. */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-marinho-900">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(70%_60%_at_20%_10%,rgba(47,134,255,0.32),transparent_70%),linear-gradient(200deg,#12305A,#071426_75%)]" />
        <Image
          src="/images/quad-logo-branco.png"
          alt=""
          aria-hidden="true"
          width={118}
          height={44}
          className="pointer-events-none absolute left-1/2 top-[44%] w-[42%] -translate-x-1/2 -translate-y-1/2 opacity-[0.12]"
        />
        {evento.imagem && <Image src={evento.imagem} alt="" fill sizes="(min-width: 1024px) 320px, 90vw" className="object-cover" />}
        {evento.data && (
          <div className="pointer-events-none absolute bottom-3 left-3 flex items-stretch overflow-hidden rounded-[10px] bg-superficie shadow-[0_10px_24px_-10px_rgba(0,0,0,0.55)]">
            <div className="bg-azul px-3 pb-[9px] pt-2 text-center text-white">
              <div className="font-display text-2xl font-extrabold leading-none tracking-[-0.02em] [font-variant-numeric:tabular-nums]">{evento.data.dia}</div>
              <div className="mt-[3px] text-[10.5px] font-bold tracking-[0.16em]">{evento.data.mes}</div>
            </div>
            {evento.data.local && <div className="flex items-center px-3 text-[12.5px] font-semibold text-ardosia-escura">{evento.data.local}</div>}
          </div>
        )}
      </div>
      <div className="relative flex flex-1 flex-col px-3.5 pb-3 pt-[18px]">
        <div className="flex flex-col items-start gap-2.5">
          <h3 className="line-clamp-2 font-display text-[21px] font-extrabold leading-[1.15] tracking-[-0.02em] [text-wrap:pretty]">{evento.titulo}</h3>
          <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${CORES_DO_SELO[evento.selo.tom]}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {evento.selo.texto}
          </span>
        </div>
        {/* Parece um botão, mas o link é o cartão inteiro. */}
        <span className="mt-auto block pt-[18px]">
          <span className="btn-q btn-q-azul h-12 w-full px-3.5 text-[15.5px] group-hover:bg-azul-vivo">
            {rotuloDoBotao(evento)}
            <span aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-0.5">→</span>
          </span>
        </span>
      </div>
    </Link>
  );
}
