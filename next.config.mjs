import path from "node:path";
import { fileURLToPath } from "node:url";

const emDesenvolvimento = process.env.NODE_ENV === "development";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const origemDaApi = API_URL ? new URL(API_URL).origin : "";

// Política de conteúdo (CSP): de onde o navegador aceita carregar scripts, imagens e chamadas (docs/seguranca.md, S10).
// Sem nonce, de propósito: o nonce obriga a gerar cada página a cada visita e acabaria com o cache das páginas.
// Por isso os scripts em linha do Next continuam liberados ('unsafe-inline'), mas nenhum script de outro site entra.
// Analytics ou Pixel (Etapa 11) vão exigir acrescentar os domínios deles aqui.
const politicaDeConteudo = [
  "default-src 'self'",
  // 'unsafe-eval' só em desenvolvimento: o React usa eval para mostrar os erros. Em produção não precisa.
  `script-src 'self' 'unsafe-inline'${emDesenvolvimento ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // Imagens da API (S3) e fotos de aprovados vêm de outros endereços https.
  "img-src 'self' data: blob: https:",
  "font-src 'self'",
  // A API e a busca de endereço pelo CEP.
  ["connect-src 'self'", origemDaApi, "https://viacep.com.br"].filter(Boolean).join(" "),
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // Só com a API em https: com a API local em http, forçar https quebraria as chamadas.
  ...(origemDaApi.startsWith("https://") ? ["upgrade-insecure-requests"] : []),
].join("; ");

const cabecalhosDeSeguranca = [
  { key: "Content-Security-Policy", value: politicaDeConteudo },
  // Impede o site de ser aberto dentro de outro (golpe de clique escondido). Repetido da CSP para navegadores antigos.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Outros sites recebem só o domínio de onde o visitante veio, nunca o endereço completo da página.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // O site não usa câmera, microfone, localização nem pagamento pelo navegador.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  // Obriga https por 2 anos depois da primeira visita (o navegador ignora em http). Sem includeSubDomains
  // até confirmar que todos os subdomínios de quadconcursos.com.br têm https.
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Há outro package-lock.json numa pasta acima; fixa a raiz neste projeto.
  turbopack: { root: path.dirname(fileURLToPath(import.meta.url)) },
  // Não anuncia que o site é feito em Next.js.
  poweredByHeader: false,
  // Fotos de turmas e eventos cadastradas na API ficam nos buckets S3 da AWS (ex.: api-quad-dev-imagens).
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.s3.amazonaws.com", pathname: "/imagens/**" }],
  },
  async headers() {
    return [{ source: "/(.*)", headers: cabecalhosDeSeguranca }];
  },
  // Os cursos online viraram as Mentorias do Quad (novo visual, out/2026).
  async redirects() {
    return [{ source: "/cursos", destination: "/mentorias", permanent: true }];
  },
};

export default nextConfig;
