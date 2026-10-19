import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-navy-deep text-steel-dim border-t border-dark pt-12 pb-8">
      <div className="max-w-site mx-auto px-6">
        <div className="grid md:grid-cols-[2fr_1fr_1fr] gap-10 mb-9">
          <div>
            <div className="flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo.svg" alt="Quad Concursos" width={130} height={48} className="h-12 w-auto" />
            </div>
            <p className="text-sm max-w-[300px] mt-3">
              Preparação séria para quem quer vestir a farda. Feira de Santana, Bahia — desde 2013.
            </p>
          </div>
          <div>
            <h2 className="font-display text-[13px] font-semibold uppercase tracking-[0.12em] text-offwhite mb-3.5">
              Navegação
            </h2>
            <ul className="space-y-2 text-sm">
              <li><Link href="/turmas" className="focus-ring transition-colors hover:text-blue">Turmas</Link></li>
              <li><Link href="/produtos" className="focus-ring transition-colors hover:text-blue">Materiais</Link></li>
              <li><Link href="/eventos" className="focus-ring transition-colors hover:text-blue">Eventos</Link></li>
              <li><Link href="/cursos" className="focus-ring transition-colors hover:text-blue">Cursos online</Link></li>
              <li><Link href="/aprovados" className="focus-ring transition-colors hover:text-blue">Aprovados</Link></li>
              <li><Link href="/#professores" className="focus-ring transition-colors hover:text-blue">Professores</Link></li>
              <li><Link href="/blog" className="focus-ring transition-colors hover:text-blue">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="font-display text-[13px] font-semibold uppercase tracking-[0.12em] text-offwhite mb-3.5">
              Institucional
            </h2>
            <ul className="space-y-2 text-sm">
              <li><Link href="/sobre" className="focus-ring transition-colors hover:text-blue">Sobre o Quad </Link></li>
              <li><Link href="/contato" className="focus-ring transition-colors hover:text-blue">Contato</Link></li>
              <li><Link href="/termos" className="focus-ring transition-colors hover:text-blue">Termos de uso</Link></li>
              <li><Link href="/privacidade" className="focus-ring transition-colors hover:text-blue">Privacidade</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-dark pt-6 flex flex-col md:flex-row justify-between text-xs gap-2 ">
          <span>© {new Date().getFullYear()} Quad Concursos. Todos os direitos reservados.</span>
        </div>
      </div>
    </footer>
  );
}
