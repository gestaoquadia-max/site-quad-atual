import Image from "next/image";

// Dobra em ondas entre uma seção clara e uma escura da Home (entrega da designer, 11/11/2026). A imagem
// (public/images/home/transicao-ondas.png, 1586×140) é clara em cima e escura embaixo; virada (scale(-1,-1)), serve para
// a passagem do escuro para o claro. Os degradês por cima fundem as pontas da imagem nas cores das seções vizinhas.
// As seções escuras começam e terminam em COR_ESCURA_DA_ONDA, e as claras são o "nevoa" do site.
export const COR_ESCURA_DA_ONDA = "#151A24";
// Fundo das seções escuras da Home: começa e termina na cor da onda.
export const FUNDO_ESCURO_DA_HOME = "linear-gradient(180deg,#151A24 0%,#0B1A36 18%,#081530 82%,#151A24 100%)";

export default function Onda({ para }: { para: "escuro" | "claro" }) {
  const paraEscuro = para === "escuro";
  return (
    <div
      aria-hidden="true"
      data-onda={para}
      className={`relative z-[1] -my-px leading-[0] ${
        paraEscuro ? "bg-[linear-gradient(180deg,#D7E0EB_50%,#151A24_50%)]" : "bg-[linear-gradient(180deg,#151A24_50%,#D7E0EB_50%)]"
      }`}
    >
      <Image
        src="/images/home/transicao-ondas.png"
        alt=""
        width={1586}
        height={140}
        sizes="100vw"
        className={`block h-auto w-full ${paraEscuro ? "" : "[transform:scale(-1,-1)]"}`}
      />
      {paraEscuro ? (
        <>
          <span className="absolute inset-x-0 top-0 h-[55%] bg-[linear-gradient(180deg,#D7E0EB_0%,rgba(215,224,235,0.75)_45%,rgba(215,224,235,0)_100%)]" />
          <span className="absolute inset-x-0 bottom-0 h-[40%] bg-[linear-gradient(0deg,#151A24_0%,rgba(21,26,36,0.6)_50%,rgba(21,26,36,0)_100%)]" />
        </>
      ) : (
        <>
          <span className="absolute inset-x-0 top-0 h-[45%] bg-[linear-gradient(180deg,#151A24_0%,rgba(21,26,36,0.6)_50%,rgba(21,26,36,0)_100%)]" />
          <span className="absolute inset-x-0 bottom-0 h-[55%] bg-[linear-gradient(0deg,#D7E0EB_0%,rgba(215,224,235,0.75)_45%,rgba(215,224,235,0)_100%)]" />
        </>
      )}
    </div>
  );
}
