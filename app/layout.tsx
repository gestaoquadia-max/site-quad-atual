import type { Metadata } from "next";
import { Rajdhani, Work_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsTicker from "@/components/NewsTicker";
import { CartProvider } from "@/lib/cart";
import { UsuarioProvider } from "@/lib/usuario";

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

export const metadata: Metadata = {
  title: "Quad Concursos — Preparação para concursos militares",
  description:
    "Cursos presenciais, materiais e treinamento direto ao ponto para quem quer entrar nas forças de segurança. Feira de Santana, Bahia.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${fonteDisplay.variable} ${fonteCorpo.variable}`} suppressHydrationWarning>
      <body>
        <CartProvider>
          <UsuarioProvider>
            <NewsTicker />
            <Navbar />
            <main>{children}</main>
            <Footer />
          </UsuarioProvider>
        </CartProvider>
      </body>
    </html>
  );
}
