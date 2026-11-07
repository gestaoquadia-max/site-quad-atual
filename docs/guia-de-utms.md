# Guia de UTMs — campanhas do Quad Concursos

**Para:** quem cria as campanhas no Google Ads e na Meta (Facebook e Instagram) e os links de divulgação.
**Por quê:** é a etiqueta no link que diz ao site de qual campanha cada aluno veio. Com ela, o Google Analytics mostra quantas pessoas compraram cada produto por campanha, e quanto cada uma rendeu. Sem ela, a venda aparece como "acesso direto" e ninguém sabe de onde veio.

---

## 1. O padrão de nomes (o mais importante)

Os números só batem se cada campanha tiver **um nome único, sempre escrito do mesmo jeito**.

**Nome da campanha:** `ano-mês-produto`, e, se precisar, `-detalhe` no fim.

| Certo | Errado |
|---|---|
| `2026-07-rondesp` | `Campanha Julho`, `rondesp julho`, `RONDESP-07` |
| `2026-09-cfo` | `CFO setembro 2026` |
| `2026-09-mentoria-plus` | `Mentoria+ Set` |
| `2026-11-simulado-pmba` | `simulado` |
| `2026-07-rondesp-remarketing` | `rondesp (remarketing)` |

**Regras:**
- sempre em **minúsculas**;
- **sem acento**, sem espaço e sem símbolo: use `-` para separar;
- o mês com **dois dígitos** (`07`, e não `7`);
- o mesmo nome em todos os anúncios e plataformas da mesma campanha.

---

## 2. As etiquetas (os parâmetros)

| Parâmetro | Para que serve | Valores |
|---|---|---|
| `utm_source` | de onde veio | `google`, `meta`, `instagram`, `whatsapp`, `email`, `youtube` |
| `utm_medium` | o tipo de divulgação | `pago` (anúncio), `organico` (post, bio, story), `email`, `grupo` |
| `utm_campaign` | **a campanha** | o nome no padrão acima, como `2026-07-rondesp` |
| `utm_content` | qual anúncio ou criativo (opcional) | `video-depoimento`, `carrossel-aprovados`, `story-1` |

---

## 3. Google Ads: não precisa escrever nada

O nome da campanha chega sozinho, desde que:
1. o **Google Ads esteja vinculado ao Google Analytics** (no Analytics: Administrador › *Vínculos de produtos* › Google Ads). É feito uma vez só;
2. a **marcação automática** esteja ligada no Google Ads (em *Administrador › Configurações da conta*). Ela já vem ligada.

O que importa é o **nome da campanha no Google Ads** seguir o padrão: `2026-07-rondesp`.

---

## 4. Meta (Facebook e Instagram): colar uma vez em cada anúncio

No Gerenciador de Anúncios, em cada **anúncio**, na seção **Rastreamento › Parâmetros de URL**, cole exatamente:

```
utm_source=meta&utm_medium=pago&utm_campaign={{campaign.name}}&utm_content={{ad.name}}
```

A Meta troca `{{campaign.name}}` e `{{ad.name}}` pelos nomes reais. Por isso, o **nome da campanha na Meta** também segue o padrão: `2026-07-rondesp`. O nome do anúncio vira o `utm_content`: algo curto como `video-depoimento`.

Ao duplicar um anúncio, confira se os parâmetros vieram junto.

---

## 5. Links fora dos anúncios (bio, WhatsApp, e-mail)

Para divulgação sem anúncio, monte o link à mão: o endereço da página, um `?` e as etiquetas, separadas por `&`.

**Exemplos:**

- Link da bio do Instagram:
  `https://quadconcursos.com.br/turmas?utm_source=instagram&utm_medium=organico&utm_campaign=bio`
- Mensagem nos grupos de WhatsApp da campanha de julho:
  `https://quadconcursos.com.br/turmas?utm_source=whatsapp&utm_medium=grupo&utm_campaign=2026-07-rondesp`
- E-mail para a base sobre a Mentoria+:
  `https://quadconcursos.com.br/mentorias?utm_source=email&utm_medium=email&utm_campaign=2026-09-mentoria-plus`

Enquanto o site novo estiver só no teste, troque `quadconcursos.com.br` por `teste.quadconcursos.com.br` para testar. Os acessos do teste não entram nos relatórios.

---

## 6. Onde ver o resultado

No Google Analytics, em **Relatórios › Monetização › Compras de comércio eletrônico** e em **Aquisição de tráfego**, filtrando pela campanha. Para a visão "quantos compraram cada produto em cada campanha", dá para criar em **Explorar** uma tabela com **Campanha da sessão × Nome do item × Itens comprados × Receita do item**, filtrável por período.

O Analytics mostra **quantos** compraram, e não **quem**: as regras do Google proíbem o nome do aluno. A lista de compradores por campanha vai aparecer no painel administrativo do Quad quando o sistema passar a gravar a campanha em cada compra (pedido ao backend em andamento).

**Limites:**
- quem recusa os cookies de análise no site não aparece no Analytics;
- vendas fechadas pelo WhatsApp ou no balcão não passam pelo site e não têm campanha;
- nos relatórios por sessão, a compra conta para a **última campanha** pela qual o aluno chegou (uma volta direta ao site não apaga a campanha). Os relatórios de atribuição do Google Analytics dividem o crédito de outro jeito; para comparar campanhas, use sempre o mesmo relatório.

---

## 7. Checklist antes de publicar uma campanha

- [ ] O nome da campanha segue o padrão `ano-mês-produto` (minúsculas, sem acento, sem espaço).
- [ ] **Meta:** os parâmetros de URL estão colados em **todos** os anúncios, inclusive nos duplicados.
- [ ] **Google Ads:** a conta está vinculada ao Analytics e a marcação automática está ligada.
- [ ] Abri o link do anúncio e ele chegou ao site com as etiquetas no endereço (`?utm_source=…`).
- [ ] Links de bio, WhatsApp e e-mail montados com o mesmo nome de campanha.
