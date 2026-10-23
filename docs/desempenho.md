# Desempenho no celular

> Medição de 13/10/2026 · Backlog: Etapa 9, Bloco 2 — "Medição de desempenho no celular".

## Como foi medido

- **Ferramenta:** Lighthouse 12 (a mesma do PageSpeed Insights do Google), perfil de celular.
- **Versão do site:** build de produção (`next build` + `next start`). O modo de desenvolvimento é bem mais lento e não serve para medir.
- **Duas formas de limitar o celular:**
  - **simulada** (padrão do Lighthouse): estima o tempo num celular intermediário em 4G a partir de uma carga rápida;
  - **real** (`--throttling-method=devtools`): o Chrome de fato desacelera rede e processador.
- Medido no computador local, sem CDN. Publicado na hospedagem (ex.: Vercel), o tempo até o servidor responder costuma ser menor.

## Resultado

Notas de 0 a 100 (Desempenho / Acessibilidade / Boas práticas / SEO), modo simulado:

| Página | Notas | LCP simulado | LCP real | CLS |
|---|---|---|---|---|
| `/` (home) | 96 / 100 / 100 / 100 | 2,7 s | **2,0 s** | 0 |
| `/turmas` | 97 / 100 / 100 / 100 | 2,7 s | — | 0 |
| `/turmas/cfp-2025-2` | 96 / 100 / 100 / 100 | 2,7 s | **2,0 s** | 0 |
| `/produtos` | 96 / 100 / 100 / 100 | 2,8 s | — | 0 |
| `/eventos/simulado-aberto-cfp` | 97 / 100 / 100 / 100 | 2,7 s | — | 0 |
| `/professores/danilo-moura` | 96 / 100 / 100 / 100 | 2,8 s | **1,9 s** | 0 |
| `/blog/taf-cfp-…` | 96 / 100 / 100 / 100 | 2,7 s | — | 0 |
| `/sobre` | 97 / 100 / 100 / 100 | 2,7 s | **1,8 s** | 0,017 |
| `/entrar` | 97 / 100 / 100 / 100 | 2,7 s | — | 0 |
| `/cadastro` | 97 / 100 / 100 / 100 | 2,7 s | — | 0 |
| `/carrinho` | 97 / 100 / 100 / 66¹ | 2,7 s | **1,7 s** | 0 |
| `/checkout` | 96 / 100 / 100 / 66¹ | 2,7 s | 3,4 s² | 0,024 |

**Como ler:** o Google considera bom LCP até 2,5 s (quando o conteúdo principal aparece), CLS até 0,1 (o quanto a página "pula" ao carregar) e TBT até 200 ms (travamento por JavaScript; aqui ficou entre 30 e 130 ms).

¹ SEO 66 é esperado: carrinho e checkout estão marcados de propósito para não aparecer no Google.
² O conteúdo do checkout (o carrinho) fica só no navegador e só aparece depois que o JavaScript roda. O carrinho do servidor (`/api/loja/carrinho/eu`) já existe, mas só depois do login: o do visitante continua no navegador (pergunta 1 da seção 6 de `pedidos-backend.md`).

### Por que o LCP simulado dá 2,7 s em todas

O conteúdo principal de todas as páginas é texto, e ele chega rápido (na máquina, aparece em ~0,17 s). O modo simulado soma tudo o que começou a carregar antes dele, inclusive o JavaScript do Next.js (~160 KB). Com a limitação real, o LCP fica entre 1,7 s e 2,0 s, dentro do "bom". A página inicial inteira pesa ~300 KB.

## O que foi corrigido nesta etapa

| Problema | Correção | Antes → depois |
|---|---|---|
| Foto do professor baixada inteira | `next/image` com tamanho certo por tela | 442 KB → 12–29 KB |
| Checkout "pulando" ao carregar | Área reservada enquanto lê o carrinho | CLS 0,355 → 0,024 (nota 78 → 96) |
| Logo sem tamanho declarado | `width`/`height` no `<img>` | evita pulo no topo |

## Como medir de novo

Com o site rodando em modo de produção (nunca com o `npm run dev` ligado na mesma pasta, porque o build estraga o cache dele):

```bash
npx lighthouse http://localhost:3000/ --only-categories=performance --view
npx lighthouse http://localhost:3000/ --only-categories=performance --throttling-method=devtools --view
```

Depois de publicado, use o PageSpeed Insights (https://pagespeed.web.dev), que mede também com dados reais de visitantes.

## Pontos de atenção para o futuro

- **Imagens da API:** quando as fotos vierem do bucket S3, autorizar o domínio em `images.remotePatterns` (`next.config.mjs`). Ver a Etapa 5, Bloco 4.
- **Imagem de compartilhamento e fotos novas:** subir sempre em boa resolução. O `next/image` reduz sozinho; não é preciso comprimir à mão.
- **Animações de entrada (`components/Reveal.tsx`):** não usar no topo da página (no "hero"). Elas escondem o conteúdo até o JavaScript rodar e atrasariam o LCP.
