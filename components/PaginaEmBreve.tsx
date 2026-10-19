import Link from "next/link";

// Página de uma seção nova do site que ainda está sendo construída (redesenho, Etapa 13).
export default function PaginaEmBreve({
  titulo,
  texto,
  acao,
}: {
  titulo: string;
  texto: string;
  // Caminho alternativo enquanto a página não fica pronta (ex.: a landing das Mentorias).
  acao?: { href: string; label: string };
}) {
  return (
    <div className="mx-auto max-w-[760px] px-[clamp(20px,4vw,32px)] py-[clamp(56px,9vw,120px)]">
      <div className="rounded-[20px] border border-linha bg-white p-[clamp(28px,5vw,48px)] shadow-[0_20px_40px_-30px_rgba(7,20,38,0.3)]">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-azul-palido px-2.5 py-1 text-xs font-semibold text-azul-forte">
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          Em breve
        </span>
        <h1 className="mb-3 mt-3.5 font-display text-[clamp(1.8rem,3.6vw,2.4rem)] font-extrabold leading-[1.1] tracking-[-0.03em]">{titulo}</h1>
        <p className="text-[15.5px] leading-[1.6] text-ardosia">{texto}</p>
        <div className="mt-7 flex flex-wrap gap-2.5">
          {acao &&
            (acao.href.startsWith("http") ? (
              <a href={acao.href} className="btn-q btn-q-azul h-12 px-[22px] text-[15px]">
                {acao.label}
              </a>
            ) : (
              <Link href={acao.href} className="btn-q btn-q-azul h-12 px-[22px] text-[15px]">
                {acao.label}
              </Link>
            ))}
          <Link href="/" className={`btn-q h-12 px-5 text-[15px] ${acao ? "btn-q-contorno" : "btn-q-azul"}`}>
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
