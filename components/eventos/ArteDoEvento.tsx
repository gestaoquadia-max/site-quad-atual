import Image from "next/image";

// Arte do evento (1:1): a imagem cadastrada na API ou, sem ela, o fundo com o logo do Quad em marca d'água.
export function ArteDoEvento({ className = "", src, alt = "" }: { className?: string; src?: string | null; alt?: string }) {
  if (src) {
    return (
      <div className={`relative aspect-square w-full overflow-hidden bg-marinho-900 ${className}`}>
        <Image src={src} alt={alt} fill priority sizes="(min-width: 900px) 620px, 100vw" className="object-cover" />
      </div>
    );
  }
  return (
    <div className={`relative aspect-square overflow-hidden bg-marinho-900 ${className}`}>
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(70%_60%_at_20%_10%,rgba(47,134,255,0.32),transparent_70%),linear-gradient(200deg,#12305A,#071426_75%)]" />
      <Image
        src="/images/quad-logo-branco.png"
        alt=""
        aria-hidden="true"
        width={236}
        height={88}
        className="pointer-events-none absolute left-1/2 top-1/2 w-[42%] -translate-x-1/2 -translate-y-1/2 opacity-[0.12]"
      />
    </div>
  );
}
