import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SoNoSite from "@/components/SoNoSite";
import AvisoDoCarrinho from "@/components/AvisoDoCarrinho";
import AvisoDeCookies from "@/components/AvisoDeCookies";
import { OuvinteDoBrilho } from "@/components/Brilho";
import { CartProvider } from "@/lib/cart";
import { UsuarioProvider } from "@/lib/usuario";
import { DESCRICAO_DO_SITE, NAO_INDEXAR, NOME_DO_SITE, SITE_DE_TESTE, URL_DO_SITE } from "@/lib/seo";
import { listarEventos, listarMateriais, listarTurmas } from "@/lib/vitrine";

// Títulos em Manrope e textos em Inter (novo visual). As classes font-display e font-body apontam para elas.
// As duas são fontes variáveis: um arquivo só cobre todos os pesos, então não se lista "weight".
const fonteDisplay = Manrope({ subsets: ["latin"], variable: "--font-display" });

const fonteCorpo = Inter({ subsets: ["latin"], variable: "--font-body" });

const TITULO_PADRAO = "Quad Concursos — Preparação para concursos militares";

// Cada página define só o próprio título; o modelo acrescenta o nome do site.
export const metadata: Metadata = {
  metadataBase: new URL(URL_DO_SITE),
  title: { default: TITULO_PADRAO, template: `%s — ${NOME_DO_SITE}` },
  description: DESCRICAO_DO_SITE,
  applicationName: NOME_DO_SITE,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: NOME_DO_SITE,
    title: TITULO_PADRAO,
    description: DESCRICAO_DO_SITE,
  },
  // Imagem grande ao compartilhar (a imagem em si vem de app/opengraph-image.tsx).
  twitter: { card: "summary_large_image" },
  ...(SITE_DE_TESTE ? { robots: NAO_INDEXAR } : {}),
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Menu e barra de avisos de turmas e eventos. A resposta da API fica em cache (lib/vitrine.ts), então não pesa em cada página.
  const [turmas, eventos, materiais] = await Promise.all([listarTurmas(), listarEventos(), listarMateriais()]);

  return (
    <html lang="pt-BR" className={`${fonteDisplay.variable} ${fonteCorpo.variable}`} suppressHydrationWarning>
      {/* Coluna da altura da tela: em página curta (carrinho vazio, 404), o rodapé fica no fim dela. */}
      <body className="flex min-h-dvh flex-col">
        <CartProvider>
          <UsuarioProvider>
            {/* Primeiro item do Tab: pula avisos e menu (aparece só quando recebe o foco). */}
            <a
              href="#conteudo"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-azul focus:px-4 focus:py-2 focus:font-display focus:text-sm focus:font-bold focus:text-white"
            >
              Pular para o conteúdo
            </a>
            <SoNoSite>
              <Navbar turmas={turmas ?? []} eventos={eventos ?? []} materiais={materiais ?? []} />
            </SoNoSite>
            <main id="conteudo" tabIndex={-1} className="flex-1 outline-none">
              {children}
            </main>
            <SoNoSite>
              <Footer />
            </SoNoSite>
            <AvisoDoCarrinho />
            <AvisoDeCookies />
            <OuvinteDoBrilho />
          </UsuarioProvider>
        </CartProvider>
      </body>
    </html>
  );
}
