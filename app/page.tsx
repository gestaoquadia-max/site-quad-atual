import Link from "next/link";
import { aprovados } from "@/lib/data";
import { bannersPublicados, mentorias, modalidades } from "@/lib/conteudo";
import { listarEventos, listarMateriais, listarProdutosDaLoja, listarProfessores } from "@/lib/vitrine";
import { dadosDaOrganizacao } from "@/lib/dados-estruturados";
import DadosEstruturados from "@/components/DadosEstruturados";
import Reveal from "@/components/Reveal";
import Trilho, { SetaDoLink } from "@/components/Trilho";
import CarrosselDeDestaques from "@/components/home/CarrosselDeDestaques";
import CartaoMaterial from "@/components/home/CartaoMaterial";
import CartaoEvento from "@/components/home/CartaoEvento";
import { CARTAO_DOS_SIMULADOS, paraCartao } from "@/lib/eventos";
import {
  CartaoAprovado,
  CartaoMentoria,
  CartaoModalidade,
  CartaoProdutoDaLoja,
  CartaoProfessor,
} from "@/components/home/Cartoes";

// Igual a SEGUNDOS_DE_CACHE (lib/vitrine.ts): os eventos vêm da API.
export const revalidate = 60;

// Título e descrição vêm do padrão do layout; aqui só o endereço canônico.
export const metadata = { alternates: { canonical: "/" } };

// `brilho`: camada decorativa de fundo, atrás do conteúdo.
function Secao({ className = "", id, brilho, children }: { className?: string; id?: string; brilho?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={`secao relative overflow-hidden ${className}`}>
      {brilho && <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${brilho}`} />}
      <div className="conteiner relative">{children}</div>
    </section>
  );
}

export default async function Home() {
  const [eventos, materiais, loja, professores] = await Promise.all([listarEventos(), listarMateriais(), listarProdutosDaLoja(), listarProfessores()]);
  const cartoesDeEvento = [CARTAO_DOS_SIMULADOS, ...(eventos ?? []).map(paraCartao)];

  return (
    <>
      <DadosEstruturados dados={dadosDaOrganizacao()} />
      <CarrosselDeDestaques banners={bannersPublicados()} />

      <Secao className="bg-nevoa">
        <Trilho titulo="Turmas presenciais" link={{ href: "/turmas", label: "Ver todas as turmas" }} rotulo="Modalidades das turmas presenciais">
          {modalidades.map((m) => (
            <CartaoModalidade key={m.id} modalidade={m} />
          ))}
        </Trilho>
      </Secao>

      <Secao className="bg-[linear-gradient(160deg,#3A0E1A_0%,#22080F_45%,#0E0306_100%)] text-white" brilho="bg-[radial-gradient(45%_70%_at_85%_20%,rgba(176,38,62,0.32),transparent_70%)]">
        <Trilho titulo="Mentorias do Quad" link={{ href: "/mentorias", label: "Ver todas as mentorias" }} rotulo="Planos das Mentorias do Quad" tema="vinho">
          {mentorias.map((m) => (
            <CartaoMentoria key={m.nome} {...{ nome: m.nome, duracao: m.duracao, descricao: m.descricao, destaque: m.destaque }} />
          ))}
        </Trilho>
      </Secao>

      {/* Materiais e Loja vêm da vitrine de itens da API; sem nada à venda (ou sem resposta), a seção some. */}
      {materiais && materiais.length > 0 && (
        <Secao className="bg-marinho-900 text-white" brilho="bg-[radial-gradient(50%_60%_at_100%_0%,rgba(0,107,255,0.16),transparent_70%),radial-gradient(40%_50%_at_0%_100%,rgba(0,107,255,0.08),transparent_70%)]">
          <Trilho titulo="Materiais de estudo" link={{ href: "/produtos", label: "Ver todos os materiais" }} rotulo="Materiais de estudo" tema="escuro" colunas={4}>
            {materiais.slice(0, 8).map((p, i) => (
              <CartaoMaterial key={p.slug} produto={p} indice={i} />
            ))}
          </Trilho>
          <p className="mt-5 text-[12.5px] text-[#7F90A8]">O impresso é retirado no Quad, sem custo. O envio pelo correio, com frete calculado pelo CEP, chega em breve.</p>
        </Secao>
      )}

      {loja && loja.length > 0 && (
        <Secao className="bg-white">
          <Trilho titulo="Loja Quad" link={{ href: "/loja", label: "Ver todos os produtos" }} rotulo="Produtos da Loja Quad" colunas={4}>
            {loja.map((p) => (
              <CartaoProdutoDaLoja key={p.id} produto={p} />
            ))}
          </Trilho>
        </Secao>
      )}

      <Secao className="bg-nevoa">
        <Trilho titulo="Próximos eventos" link={{ href: "/eventos", label: "Ver todos os eventos" }} rotulo="Próximos eventos">
          {cartoesDeEvento.map((e) => (
            <CartaoEvento key={e.id} evento={e} />
          ))}
        </Trilho>
      </Secao>

      {!!professores?.length && (
        <Secao id="professores" className="bg-marinho-950 text-white" brilho="bg-[radial-gradient(45%_55%_at_0%_0%,rgba(0,107,255,0.16),transparent_70%)]">
          <Trilho titulo="Conheça nossos professores" link={{ href: "/professores", label: "Ver todos os professores" }} rotulo="Professores" tema="escuro" colunas={4}>
            {professores.map((p) => (
              <CartaoProfessor key={p.slug} professor={p} />
            ))}
          </Trilho>
        </Secao>
      )}

      <Secao className="bg-nevoa">
        <Reveal className="mb-[clamp(32px,4vw,48px)]">
          <h2 className="titulo-secao">Aprovados</h2>
        </Reveal>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,460px),1fr))] gap-5">
          {aprovados.slice(0, 4).map((a, i) => (
            <Reveal key={a.nome} className="h-full" delay={Math.min(i, 5) * 60}>
              <CartaoAprovado aprovado={a} />
            </Reveal>
          ))}
        </div>
        <div className="mt-9 flex justify-center">
          <Link href="/aprovados" className="btn-q btn-q-contorno h-[50px] gap-2.5 px-6 text-[15px] hover:-translate-y-px">
            Ver todos os aprovados
            <SetaDoLink />
          </Link>
        </div>
      </Secao>
    </>
  );
}
