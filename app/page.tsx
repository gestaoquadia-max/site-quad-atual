import { bannersPublicados, mentorias, modalidades } from "@/lib/conteudo";
import { listarEventos, listarMateriais, listarProfessores, listarTurmas } from "@/lib/vitrine";
import { insigniaDaModalidade } from "@/lib/turmas";
import { dadosDaOrganizacao } from "@/lib/dados-estruturados";
import DadosEstruturados from "@/components/DadosEstruturados";
import Reveal from "@/components/Reveal";
import Trilho from "@/components/Trilho";
import PrimeiroContato from "@/components/home/PrimeiroContato";
import CartaoMaterial from "@/components/home/CartaoMaterial";
import CartaoEvento from "@/components/home/CartaoEvento";
import { CARTAO_DOS_SIMULADOS, paraCartao } from "@/lib/eventos";
import { CartaoMentoria, CartaoModalidade } from "@/components/home/Cartoes";
import EmDesenvolvimento from "@/components/EmDesenvolvimento";
import AreaEmEspera from "@/components/AreaEmEspera";
import { EM_ESPERA, TEXTO_DOS_APROVADOS, TEXTO_EM_ESPERA, type AreaDoSite } from "@/lib/em-espera";
import ProfessoresEmDestaque from "@/components/home/ProfessoresEmDestaque";

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

function SecaoComAviso({ titulo, texto, className }: { titulo: string; texto: string; className: string }) {
  return (
    <Secao className={className}>
      <Reveal className="mb-[clamp(32px,4vw,48px)]">
        <h2 className="titulo-secao">{titulo}</h2>
      </Reveal>
      <Reveal>
        <EmDesenvolvimento texto={texto} />
      </Reveal>
    </Secao>
  );
}

// A seção de uma área (lib/em-espera.ts): aberta, a seção; em espera, o aviso (e a seção só para o administrador).
function EsperaDaSecao({ area, titulo, className, children }: { area: AreaDoSite; titulo: string; className: string; children: React.ReactNode }) {
  if (!EM_ESPERA[area]) return <>{children}</>;
  return <AreaEmEspera aviso={<SecaoComAviso titulo={titulo} texto={TEXTO_EM_ESPERA[area]} className={className} />}>{children}</AreaEmEspera>;
}

export default async function Home() {
  // A Loja saiu da Home (03/11/2026): fica só no menu, em /loja.
  const [eventos, materiais, professores, turmas] = await Promise.all([
    listarEventos(),
    listarMateriais(),
    listarProfessores(),
    listarTurmas(),
  ]);
  const cartoesDeEvento = [CARTAO_DOS_SIMULADOS, ...(eventos ?? []).map(paraCartao)];

  return (
    <>
      <DadosEstruturados dados={dadosDaOrganizacao()} />
      {/* O carrossel (components/home/CarrosselDeDestaques.tsx) saiu da Home em 04/11/2026; os banners viraram os cartões "Agora no Quad". */}
      <PrimeiroContato banners={bannersPublicados()} turmas={turmas} />

      <Secao className="bg-nevoa">
        <Trilho titulo="Turmas presenciais" link={{ href: "/turmas", label: "Ver todas as turmas" }} rotulo="Modalidades das turmas presenciais">
          {modalidades.map((m) => (
            <CartaoModalidade key={m.id} modalidade={m} insignia={insigniaDaModalidade(turmas, m.id)} />
          ))}
        </Trilho>
      </Secao>

      {/* Nas cores do site, como as turmas (06/11/2026; antes, no vinho das Mentorias). */}
      {/* Mentorias e materiais em espera (lib/em-espera.ts): o aviso no lugar dos cartões; o administrador vê os cartões. */}
      <EsperaDaSecao area="mentorias" titulo="Mentorias do Quad" className="bg-nevoa-clara">
        <Secao className="bg-nevoa-clara">
          <Trilho titulo="Mentorias do Quad" link={{ href: "/mentorias", label: "Ver todas as mentorias" }} rotulo="Planos das Mentorias do Quad">
            {mentorias.map((m) => (
              <CartaoMentoria key={m.nome} {...{ nome: m.nome, duracao: m.duracao, descricao: m.descricao, destaque: m.destaque, insignia: m.insignia }} />
            ))}
          </Trilho>
        </Secao>
      </EsperaDaSecao>

      {/* Materiais vêm da vitrine de itens da API; sem nada à venda (ou sem resposta), a seção some. */}
      <EsperaDaSecao area="materiais" titulo="Materiais de estudo" className="bg-nevoa">
      {materiais && materiais.length > 0 && (
        <Secao className="bg-marinho-900 text-white" brilho="bg-[radial-gradient(50%_60%_at_100%_0%,rgba(0,107,255,0.16),transparent_70%),radial-gradient(40%_50%_at_0%_100%,rgba(0,107,255,0.08),transparent_70%)]">
          <Trilho titulo="Materiais de estudo" link={{ href: "/produtos", label: "Ver todos os materiais" }} rotulo="Materiais de estudo" tema="escuro" colunas={4}>
            {materiais.slice(0, 8).map((p, i) => (
              <CartaoMaterial key={p.slug} produto={p} indice={i} />
            ))}
          </Trilho>
          <p className="mt-5 text-[12.5px] text-[#7F90A8]">O impresso é retirado na sede do Quad, sem custo.</p>
        </Secao>
      )}
      </EsperaDaSecao>

      <Secao className="bg-nevoa">
        <Trilho titulo="Próximos eventos" link={{ href: "/eventos", label: "Ver todos os eventos" }} rotulo="Próximos eventos">
          {cartoesDeEvento.map((e) => (
            <CartaoEvento key={e.id} evento={e} />
          ))}
        </Trilho>
      </Secao>

      {!!professores?.length && <ProfessoresEmDestaque professores={professores} />}

      <Secao className="bg-nevoa">
        <Reveal className="mb-[clamp(32px,4vw,48px)]">
          <h2 className="titulo-secao">Aprovados</h2>
        </Reveal>
        <Reveal>
          <EmDesenvolvimento texto={TEXTO_DOS_APROVADOS} />
        </Reveal>
      </Secao>
    </>
  );
}
