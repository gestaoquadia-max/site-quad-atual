import { bannersPublicados, mentorias, modalidades } from "@/lib/conteudo";
import { listarEventos, listarExcursoes, listarMateriais, listarProfessores, listarTurmas } from "@/lib/vitrine";
import { paraCartaoDeExcursao } from "@/lib/excursoes";
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
import { EM_ESPERA, TEXTO_EM_ESPERA, type AreaDoSite } from "@/lib/em-espera";
import ProfessoresEmDestaque from "@/components/home/ProfessoresEmDestaque";
import Onda from "@/components/home/Onda";
import BlackFridayDaHome from "@/components/home/BlackFridayDaHome";
import AprovadosEmVideo from "@/components/home/AprovadosEmVideo";
import { BLACK_FRIDAY } from "@/lib/black-friday";

// Igual a SEGUNDOS_DE_CACHE (lib/vitrine.ts): os eventos vêm da API.
export const revalidate = 60;

// Título e descrição vêm do padrão do layout; aqui só o endereço canônico.
export const metadata = { alternates: { canonical: "/" } };

// `brilho`: camada decorativa de fundo, atrás do conteúdo. `espaco`: o respiro de cima e de baixo (o padrão é o das
// seções do site; junto das ondas, menor, porque a própria onda já afasta as seções).
const ESPACO_JUNTO_DAS_ONDAS = "pb-[clamp(64px,7vw,104px)] pt-[clamp(24px,3vw,48px)]";
function Secao({
  className = "",
  id,
  brilho,
  espaco = "secao",
  children,
}: {
  className?: string;
  id?: string;
  brilho?: string;
  espaco?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`${espaco} relative overflow-hidden ${className}`}>
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
  const [eventos, materiais, professores, turmas, excursoes] = await Promise.all([
    listarEventos(),
    listarMateriais(),
    listarProfessores(),
    listarTurmas(),
    listarExcursoes(),
  ]);
  // As excursões para provas (lib/excursoes.ts) entram depois dos eventos, na ordem da data da viagem.
  const cartoesDeEvento = [CARTAO_DOS_SIMULADOS, ...(eventos ?? []).map(paraCartao), ...(excursoes ?? []).map(paraCartaoDeExcursao)];

  // Dobras em ondas entre as seções claras e escuras (entrega da designer, 11/11/2026; components/home/Onda.tsx).
  return (
    <>
      <DadosEstruturados dados={dadosDaOrganizacao()} />
      {/* O carrossel (components/home/CarrosselDeDestaques.tsx) saiu da Home em 04/11/2026; os banners viraram os cartões "Agora no Quad". */}
      <PrimeiroContato banners={bannersPublicados()} turmas={turmas} />
      <Onda para="claro" />

      <Secao className="bg-nevoa" espaco={ESPACO_JUNTO_DAS_ONDAS}>
        <Trilho titulo="Turmas presenciais" link={{ href: "/turmas", label: "Ver todas as turmas" }} rotulo="Modalidades das turmas presenciais">
          {modalidades.map((m) => (
            <CartaoModalidade key={m.id} modalidade={m} insignia={insigniaDaModalidade(turmas, m.id)} />
          ))}
        </Trilho>
      </Secao>

      {BLACK_FRIDAY.home ? (
        // Black Friday (lib/black-friday.ts): o bloco da campanha no lugar das seções de Mentorias e de Materiais.
        <>
          <Onda para="escuro" />
          <BlackFridayDaHome />
          <Onda para="claro" />
        </>
      ) : (
        <>
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
              <>
                <Onda para="escuro" />
                <Secao
                  className="bg-[image:linear-gradient(180deg,#151A24_0%,#0B1A36_18%,#081530_82%,#151A24_100%)] text-white"
                  espaco={ESPACO_JUNTO_DAS_ONDAS}
                  brilho="bg-[radial-gradient(50%_60%_at_100%_0%,rgba(0,107,255,0.16),transparent_70%),radial-gradient(40%_50%_at_0%_100%,rgba(0,107,255,0.08),transparent_70%)]"
                >
                  <Trilho titulo="Materiais de estudo" link={{ href: "/produtos", label: "Ver todos os materiais" }} rotulo="Materiais de estudo" tema="escuro" colunas={4}>
                    {materiais.slice(0, 8).map((p, i) => (
                      <CartaoMaterial key={p.slug} produto={p} indice={i} />
                    ))}
                  </Trilho>
                  <p className="mt-5 text-[12.5px] text-[#7F90A8]">O impresso é retirado na sede do Quad, sem custo.</p>
                </Secao>
                <Onda para="claro" />
              </>
            )}
          </EsperaDaSecao>
        </>
      )}

      <Secao className="bg-nevoa" espaco={ESPACO_JUNTO_DAS_ONDAS}>
        <Trilho titulo="Próximos eventos" link={{ href: "/eventos", label: "Ver todos os eventos" }} rotulo="Próximos eventos">
          {cartoesDeEvento.map((e) => (
            <CartaoEvento key={e.id} evento={e} />
          ))}
        </Trilho>
      </Secao>

      {!!professores?.length && (
        <>
          <Onda para="escuro" />
          <ProfessoresEmDestaque professores={professores} />
          <Onda para="claro" />
        </>
      )}

      {/* Os vídeos dos alunos aprovados (public/videos/aprovados), da entrega da designer. */}
      <Secao className="bg-nevoa" espaco={ESPACO_JUNTO_DAS_ONDAS}>
        <Reveal className="mb-[clamp(32px,4vw,48px)]">
          <h2 className="titulo-secao">Aprovados</h2>
        </Reveal>
        <AprovadosEmVideo />
      </Secao>
      {/* A onda para o rodapé vem com ele (components/Footer.tsx). */}
    </>
  );
}
