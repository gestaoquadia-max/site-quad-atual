import Image from "next/image";
import Link from "next/link";
import BotaoWhatsApp from "./BotaoWhatsApp";

const NAVEGACAO = [
  ["Turmas Presenciais", "/turmas"],
  ["Mentorias do Quad", "/mentorias"],
  ["Materiais", "/produtos"],
  ["Loja", "/loja"],
  ["Eventos", "/eventos"],
  ["Aprovados", "/aprovados"],
  ["Professores", "/#professores"],
  ["Blog", "/blog"],
];

const INSTITUCIONAL = [
  ["Sobre o Quad", "/sobre"],
  ["Contato", "/contato"],
  ["Termos de uso", "/termos"],
  ["Privacidade", "/privacidade"],
];

export default function Footer() {
  return (
    <>
      <footer className="bg-marinho-950 text-prata">
        <div className="conteiner pt-[clamp(28px,4vw,40px)]">
          <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-5">
            <Link href="/" aria-label="Quad Concursos — início" className="flex flex-none">
              <Image src="/images/quad-logo-branco.png" alt="Quad Concursos" width={102} height={38} className="h-[38px] w-auto" />
            </Link>
            <nav aria-label="Rodapé" className="flex flex-wrap items-center gap-x-[22px] gap-y-1">
              {NAVEGACAO.map(([rotulo, href]) => (
                <Link key={href} href={href} className="inline-flex min-h-9 items-center text-sm font-medium text-prata-clara transition-colors hover:text-white">
                  {rotulo}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-[22px] flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-white/[0.08] pb-5 pt-4">
            <span className="text-[12.5px] text-prata-escura">© {new Date().getFullYear()} Quad Concursos. Todos os direitos reservados.</span>
            <nav aria-label="Institucional" className="flex flex-auto flex-wrap justify-end gap-x-[18px] gap-y-1">
              {INSTITUCIONAL.map(([rotulo, href]) => (
                <Link key={href} href={href} className="inline-flex min-h-8 items-center text-[12.5px] text-prata-escura transition-colors hover:text-white">
                  {rotulo}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </footer>
      <BotaoWhatsApp />
    </>
  );
}
