import type { Metadata } from "next";
import { Rajdhani, Work_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsTicker from "@/components/NewsTicker";
import { CartProvider } from "@/lib/cart";
import { UsuarioProvider } from "@/lib/usuario";
import { DESCRICAO_DO_SITE, NOME_DO_SITE, URL_DO_SITE } from "@/lib/seo";
import { listarEventos, listarTurmas } from "@/lib/vitrine";

const fonteDisplay = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const fonteCorpo = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

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
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Menu e barra de avisos de turmas e eventos. A resposta da API fica em cache (lib/vitrine.ts), então não pesa em cada página.
  const [turmas, eventos] = await Promise.all([listarTurmas(), listarEventos()]);

  return (
    <html lang="pt-BR" className={`${fonteDisplay.variable} ${fonteCorpo.variable}`} suppressHydrationWarning>
      <body>
        <CartProvider>
          <UsuarioProvider>
            {/* Primeiro item do Tab: pula avisos e menu (aparece só quando recebe o foco). */}
            <a
              href="#conteudo"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-blue focus:px-4 focus:py-2 focus:font-display focus:text-sm focus:font-semibold focus:uppercase focus:text-navy-deep"
            >
              Pular para o conteúdo
            </a>
            <NewsTicker turmas={turmas ?? []} eventos={eventos ?? []} />
            <Navbar turmas={turmas ?? []} eventos={eventos ?? []} />
            <main id="conteudo" tabIndex={-1} className="outline-none">
              {children}
            </main>
            <Footer />
          </UsuarioProvider>
        </CartProvider>
      </body>
    </html>
  );
}
