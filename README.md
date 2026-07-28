# Quad Concursos — Site (Next.js)

Frontend do site do Quad Concursos em Next.js 14 + TypeScript + Tailwind CSS.

## Como rodar

```bash
npm install
npm run dev
```

Acesse http://localhost:3000

## Usuário teste (área do aluno)

- **E-mail:** aluno@quad.com
- **Senha:** quad123

O login atual é simulado no frontend. A integração real com a auth-api (Java) substitui a função `tentarLogin` em `app/entrar/page.tsx`.

## Estrutura

```
app/
├── page.tsx                    Home
├── turmas/                     Listagem + detalhe (rota dinâmica [slug])
├── produtos/                   Listagem + detalhe (rota dinâmica [slug])
├── eventos/                    Agenda
├── cursos/                     Cursos online (redireciona Tutory)
├── entrar/                     Login (usuário teste)
├── aluno/                      Área do aluno (dashboard)
└── checkout/                   Checkout transparente + confirmação

components/                     Componentes reutilizáveis
lib/data.ts                     Dados mockados (turmas, PDFs, eventos)
```

## Identidade visual

Tokens no `tailwind.config.ts`:

- `navy` #0D1B2A · `navy-deep` #091320 · `navy-mid` #14263A
- `gold` #C8A84B · `gold-dark` #A88936
- `offwhite` #F5F3EE · `steel` #8B95A3
- Display: Archivo Narrow · Corpo: Archivo (Google Fonts)

## Próximos passos de integração

1. Substituir `lib/data.ts` por chamadas à API Java (produtos, turmas, eventos)
2. Login real: `POST /auth/login` na auth-api → armazenar JWT em cookie httpOnly
3. Área do aluno: consumir `GET /auth/me` e endpoints de materiais
4. Checkout: integrar SDK do Pagar.me (tokenização) + `POST /pedidos` no backend
5. Galerias: substituir placeholders por fotos reais (usar next/image)
