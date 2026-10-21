# Contrato da API de conteúdo do site

> Versão 1 · 13/10/2026 · Backlog: Etapa 5, Bloco 1 — "Definir o formato de cada conteúdo do site".
> Base: o comparativo campo a campo em [mapa-api-conteudo.md](mapa-api-conteudo.md).

Este documento define **o formato exato** que cada página pública do site precisa receber da API. Com ele implementado, o site troca os dados de exemplo (`lib/data.ts`) pela API sem mudar as telas.

**Para quem:** dev do backend. Os nomes de campo seguem o padrão que a API já usa: português, camelCase, datas ISO.

> ⚠️ **App Viver o Quad:** a vitrine é compartilhada com o app. Tudo aqui **acrescenta** campos ou rotas; nada remove nem renomeia o que existe. Para o app, nada muda.

---

## 1. Regras gerais

| Regra | Detalhe |
|---|---|
| **Sem login** | Todas as rotas deste contrato são públicas. Nunca devolvem dado de aluno |
| **Dinheiro em centavos** | `precoEmCentavos: 49990` = R$ 499,90. Gratuito = `0`. Ver pedido 5.3. Os campos atuais `precoEmReais` podem continuar para o app |
| **Datas e horas** | Data `"2026-08-04"`; hora `"18:30"`; data e hora `"2026-08-04T18:30:00-03:00"` |
| **Imagens** | Endereço `https://` absoluto e aberto, como o `imagemUrl` atual. `null` quando não houver |
| **Textos longos** | Lista de parágrafos (`string[]`), sem HTML. O site cuida da formatação |
| **Slug** | Texto único, minúsculo, sem acento, com hífen (ex.: `cfp-2026-1`). Não muda depois de publicado, porque é o endereço da página. Toda rota de detalhe aceita **slug ou id** |
| **Lista paginada** | Mesmo formato de hoje: `{ conteudo, pagina, tamanho, totalElementos, totalPaginas }` |
| **Erros** | Mesmo formato de hoje (`status`, `title`, `detail`, `codigo`, `erros[]`). Slug ou id inexistente → 404 |
| **Cache** | Respostas podem ser guardadas pelo site por alguns minutos (Etapa 5, Bloco 4). Vagas não precisam ser exatas ao segundo |

### Situação da venda

O site precisa mostrar também o que **ainda vai abrir** e o que **já fechou**, não só o que está à venda. Campo `situacao`:

| Valor | Quando | Na tela |
|---|---|---|
| `ABERTA` | À venda, com vaga | "Inscrições abertas" / "28 vagas restantes" |
| `EM_BREVE` | Publicada, venda ainda não começou | "Em breve" (sem botão de compra) |
| `ESGOTADA` | À venda, sem vaga | "Esgotada" |
| `ENCERRADA` | Venda terminou ou atividade já aconteceu | "Encerrada" (aparece por um tempo, ex.: 60 dias) |

As listas aceitam `?situacao=ABERTA,EM_BREVE` (várias, separadas por vírgula). Sem o parâmetro, a API devolve `ABERTA`, `EM_BREVE` e `ESGOTADA`.

### Vagas

Só as vagas de quem paga em reais (hoje o "pool" de diamante, que já conta cartão, PIX e boleto). As de Quad Coins são do app e não entram aqui.

```json
"vagas": { "total": 40, "ocupadas": 12, "restantes": 28 }
```

`vagas` = `null` quando a atividade não tem limite.

### Blocos reutilizados

```json
"concurso": { "sigla": "CFP", "nome": "Soldado PM-BA" },

"local": {
  "nome": "SIC/SIQ — Feira de Santana",
  "endereco": "Rua Exemplo, 123 — Centro, Feira de Santana — BA",
  "observacao": "Chegue com 30 minutos de antecedência."
},

"professores": [
  { "slug": "danilo-moura", "nome": "Danilo Moura", "papel": "Direito Administrativo · Fundador do Quad", "fotoUrl": "https://…" }
]
```

- `concurso` vira o rótulo do cartão: "CFP · Soldado PM-BA".
- `local` = `null` em atividade online.
- Em `professores`, o `papel` é o texto curto mostrado embaixo do nome, e muda por atividade. **Só em eventos e simulados:** a turma não leva professores por enquanto (decisão de 21/10/2026).

---

## 2. Turmas, eventos e simulados

**Proposta:** ampliar as rotas públicas que já existem, em vez de criar outras:

| Rota | Uso no site |
|---|---|
| `GET /api/loja/vitrine/atividades?tipo=TURMA&situacao=…` | `/turmas` e cartões da home |
| `GET /api/loja/vitrine/atividades?tipo=EVENTO,SIMULADO&situacao=…` | `/eventos` (o site mostra os dois juntos) |
| `GET /api/loja/vitrine/atividades/{tipo}/{slugOuId}` | Página de detalhe |

A lista pode trazer só o necessário para o cartão (seção 2.1). O detalhe traz tudo (seções 2.2 e 2.3).

### 2.1 Cartão (lista) — os três tipos

```json
{
  "tipo": "TURMA",
  "id": "47854e66-e132-4f7b-b2b7-2e409f288cb9",
  "slug": "cfp-2026-1",
  "nome": "Turma CFP 2026.1",
  "resumo": "Seg a sex, 18h30–22h · 3 meses · Material incluso",
  "imagemUrl": "https://…",
  "concurso": { "sigla": "CFP", "nome": "Soldado PM-BA" },
  "precoEmCentavos": 99700,
  "situacao": "ABERTA",
  "vagas": { "total": 40, "ocupadas": 12, "restantes": 28 },
  "inicio": "2026-08-04",
  "fim": "2026-11-04",
  "modalidade": "PRESENCIAL"
}
```

| Campo | Obrigatório | Observação |
|---|---|---|
| `resumo` | sim | Uma linha curta escrita pela coordenação (máx. ~120 caracteres) |
| `concurso` | turma: sim · evento/simulado: não | |
| `inicio` / `fim` | sim | Evento e simulado de um dia: `fim` igual a `inicio` |
| `modalidade` | sim | `PRESENCIAL`, `ONLINE` ou `HIBRIDO`. ⚠️ Hoje o `detalhe.modalidade` da turma traz o *tipo* (REGULAR, QUESTOES…). Esse dado vai para `tipoDeTurma` (seção 2.2) |

### 2.2 Detalhe da turma

Página `/turmas/{slug}`. Acrescenta ao cartão:

```json
{
  "tipo": "TURMA",
  "…": "todos os campos do cartão",
  "tipoDeTurma": "REGULAR",
  "apresentacao": [
    "Preparação completa para o Curso de Formação de Praças da PM-BA…"
  ],
  "duracaoEmMeses": 3,
  "dias": ["SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA"],
  "horarios": [{ "inicio": "18:30", "fim": "22:00" }],
  "local": { "nome": "…", "endereco": "…", "observacao": null },
  "incluso": [
    "Aulas presenciais de segunda a sexta, 18h30 às 22h",
    "Material didático completo — apostilas de todas as disciplinas do edital"
  ]
}
```

- Sem `professores`: a página da turma não mostra a grade de professores por enquanto (decisão de 21/10/2026).
- `duracaoEmMeses` é o texto "3 meses" da página. A turma é **valor fechado pela duração**, nunca mensalidade. O preço é sempre o total.
- `horarios` é uma lista porque a turma pode ter dois turnos (hoje: `horarioInicial2`/`horarioFim2`).
- `dias` usa os mesmos valores de hoje (`SEGUNDA` … `DOMINGO`).

### 2.3 Detalhe do evento e do simulado

Página `/eventos/{slug}`. Acrescenta ao cartão:

```json
{
  "tipo": "EVENTO",
  "…": "todos os campos do cartão",
  "categoria": "AULAO",
  "horarios": [{ "inicio": "08:00", "fim": "14:30" }],
  "apresentacao": ["Prova completa nos moldes da banca…"],
  "sobre": [
    "O simulado aberto é a coisa mais próxima que existe de viver o dia da prova…"
  ],
  "programacao": [
    { "horario": "07:30", "titulo": "Credenciamento", "descricao": "Entrada e conferência da inscrição." }
  ],
  "incluso": ["Caderno de questões impresso e folha de respostas oficial"],
  "local": { "nome": "…", "endereco": "…", "observacao": "…" },
  "professores": [{ "slug": "…", "nome": "…", "papel": "…", "fotoUrl": "…" }],
  "simulado": { "quantidadeDeQuestoes": 80, "duracaoEmMinutos": 240 }
}
```

- `categoria` usa os valores que já existem (`EVENTO`, `AULAO`, `CORUJAO`, `GINCANA`, `SEMANA_INSANA`, `PALESTRA`). Simulado: `SIMULADO`.
- `simulado` só vem quando `tipo` = `SIMULADO`. Nos outros, `null`.
- **O link de evento online não entra aqui.** Ele é só para quem se inscreveu, na área do aluno.
- `apresentacao` é o parágrafo de destaque do topo. `sobre` são os parágrafos da seção "Sobre".

---

## 3. Materiais em PDF à venda

Hoje não existem na API. Proposta: um novo tipo de item na vitrine de itens, `MATERIAL_PDF`, que não aparece no app.

| Rota | Uso no site |
|---|---|
| `GET /api/loja/vitrine?tipo=MATERIAL_PDF` | `/produtos` e a seção da home |
| `GET /api/loja/vitrine/{slugOuId}` | `/produtos/{slug}` |

```json
{
  "id": "…",
  "tipo": "MATERIAL_PDF",
  "slug": "direito-constitucional",
  "nome": "Direito Constitucional",
  "resumo": "Teoria + 300 questões comentadas.",
  "capaUrl": "https://…",
  "precoEmCentavos": 4990,
  "situacao": "ABERTA",
  "apresentacao": ["Teoria direto ao ponto + 300 questões comentadas da banca…"],
  "paginas": 240,
  "quantidadeDeQuestoes": 300,
  "atualizadoEm": "2025-07-01",
  "sumario": [
    "Teoria da Constituição e Poder Constituinte",
    "Direitos e Garantias Fundamentais — o capítulo que mais cai"
  ],
  "itensDoKit": null
}
```

- **Kit** (vários PDFs num produto só, ex.: "Kit Completo CFP"): `itensDoKit` traz `[{ "slug": "direito-constitucional", "nome": "…", "paginas": 240 }]`. Num material avulso, `null`.
- O rótulo do cartão ("PDF · 240 págs") e a ficha (páginas, questões, formato, atualização, "Acesso imediato") saem desses campos.
- **Depois da compra**, o arquivo precisa aparecer em "Meus materiais" do aluno. Isso já está no pedido 3 de [pedidos-backend.md](pedidos-backend.md).

---

## 4. Professores

| Rota | Uso no site |
|---|---|
| `GET /api/professores/publicos` | Seção de professores da home |
| `GET /api/professores/publicos/{slugOuId}` | `/professores/{slug}` |

A rota pública é separada porque `/api/professores` é interna (exige login e traz dados de agenda).

```json
{
  "id": "…",
  "slug": "danilo-moura",
  "nome": "Danilo Moura",
  "fotoUrl": "https://…",
  "materias": ["Direito Administrativo"],
  "minibio": "Fundador do Quad Concursos, ex-policial militar e à frente da preparação presencial desde 2013.",
  "bio": [
    "Danilo fundou o Quad Concursos em 2013 depois de passar pela própria caserna como policial militar…"
  ],
  "formacao": ["Bacharel em Direito", "Ex-policial militar da PM-BA"],
  "ordem": 1
}
```

- `ordem` define a posição na home (fundador primeiro).
- Só aparecem professores marcados como **visíveis no site**. Não precisa de rota para isso; basta um campo no cadastro do professor.

---

## 5. Conteúdo institucional

Estes não são de venda. **Ainda falta decidir de onde vêm:** da API (o backend cria) ou de um sistema de conteúdo à parte (Etapa 6, Bloco 1). O formato abaixo vale nos dois casos.

### 5.1 Aprovados

```json
{
  "nome": "Larissa Nunes",
  "concurso": "Soldado PM-BA",
  "colocacao": "8º lugar geral",
  "turma": "Turma CFP 2024.1",
  "ano": 2024,
  "depoimento": "…",
  "fotoUrl": "https://…",
  "destaque": true
}
```
`destaque` = aparece na home. `colocacao` = `null` quando for só "Aprovado(a)".

### 5.2 Histórias em vídeo

```json
{ "nome": "Larissa Nunes", "concurso": "Soldado PM-BA — 8º lugar geral", "videoUrl": "https://www.youtube.com/watch?v=…", "capaUrl": "https://…", "duracaoEmSegundos": 134 }
```

### 5.3 Blog

```json
{
  "slug": "taf-cfp-soldado-pm-ba-como-funciona",
  "titulo": "Como funciona o TAF do CFP Soldado PM-BA",
  "resumo": "Entenda as provas do Teste de Aptidão Física…",
  "categoria": "Preparação física",
  "autor": { "nome": "Danilo Moura", "slug": "danilo-moura" },
  "publicadoEm": "2026-07-10",
  "tempoDeLeituraEmMinutos": 6,
  "imagemUrl": "https://…",
  "conteudo": ["O Teste de Aptidão Física costuma ser o maior medo…"]
}
```
Lista em ordem do mais recente, paginada. Na lista, `conteudo` pode ser omitido. `autor.slug` = `null` quando o autor não é professor.

### 5.4 Cursos online (Tutory)

```json
{ "nome": "Esquadrão", "rotulo": "Online · Acesso 12 meses", "resumo": "Preparação completa para carreiras policiais…", "precoTexto": "R$ 89/mês", "linkUrl": "https://…tutory…", "ordem": 1 }
```
São vendidos fora do site, na Tutory. Por isso o preço é só texto de exibição (`precoTexto`), e o botão leva a `linkUrl`.

### 5.5 Barra de notícias do topo

```json
[
  { "texto": "TURMAS · CFP 2025.2 com matrículas abertas — início 04/08", "linkUrl": "/turmas/cfp-2025-2" }
]
```
Itens ativos, na ordem de exibição. `linkUrl` é opcional.

---

## 6. Configuração do pagamento (pública)

O site mostra "em até 3x" na página da turma, antes do login. Pedido: liberar sem login a rota que já existe, `GET /api/loja/pagamentos/configuracao` (os campos não são sensíveis; a chave do Pagar.me é pública por natureza), e acrescentar:

```json
{
  "disponivel": true,
  "chavePublica": "pk_…",
  "parcelasMaximas": 3,
  "jurosAPartirDaParcela": null,
  "cartoesMaximos": 2,
  "valorMinimoPorCartaoEmCentavos": 1000
}
```
`jurosAPartirDaParcela` = `null` quando todas as parcelas são sem juros (pedido 5.4).

---

## 7. Resumo do que muda na API

| # | Mudança | Tipo |
|---|---|---|
| 1 | `slug` em turmas, eventos, simulados, materiais e professores; detalhe aceita slug ou id | Novo campo |
| 2 | `precoEmCentavos` em toda a vitrine | Novo campo |
| 3 | `situacao` (ABERTA, EM_BREVE, ESGOTADA, ENCERRADA) e filtro `?situacao=` | Novo campo + filtro |
| 4 | `vagas` (total, ocupadas, restantes) só do pool em reais | Novo campo |
| 5 | Textos de venda: `resumo`, `apresentacao`, `sobre`, `incluso`, `programacao` | Novos campos (cadastro da coordenação) |
| 6 | `concurso`, `local` com endereço, `professores` resumidos (só eventos e simulados) | Novos campos |
| 7 | Turma: `tipoDeTurma`, `duracaoEmMeses`, `dias`, `horarios`; `modalidade` passa a ser presencial/online | Novos campos |
| 8 | Simulado: `quantidadeDeQuestoes`, `duracaoEmMinutos` públicos | Campos existentes, agora públicos |
| 9 | Tipo de item `MATERIAL_PDF` com páginas, sumário, capa e kit | Novo tipo |
| 10 | `GET /api/professores/publicos` e `/{slugOuId}` | Nova rota |
| 11 | Configuração de pagamento pública, com juros | Rota existente, agora pública |
| 12 | Aprovados, vídeos, blog, cursos online e notícias | **Decisão pendente:** API ou sistema de conteúdo |

**Ordem sugerida** (o que destrava mais páginas primeiro): 1 → 2 → 3 → 4 → 5 → 6 → 7 (turmas e eventos completos), depois 9 (materiais), 10 (professores) e 11. O item 12 espera a decisão da Etapa 6.
