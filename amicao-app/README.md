# Amicão

Plataforma para conectar cães abandonados a lares amorosos.

## Stack

- **Next.js 16** (App Router) com TypeScript
- **Tailwind CSS 4** — tema laranja
- **Supabase** — banco de dados e storage de fotos

## Estrutura de páginas

| Rota | Descrição |
|---|---|
| `/` | Landing page com hero e como funciona |
| `/animais` | Listagem com filtros e paginação |
| `/animais/novo` | Formulário para cadastrar e anunciar um cão |
| `/animais/[id]` | Detalhes de um animal |
| `/cadastro` | Cadastro de usuário |

## Filtros e paginação

A listagem `/animais` suporta os seguintes filtros via query string (todos opcionais, combináveis):

| Parâmetro | Valores | Exemplo |
|---|---|---|
| `estado` | sigla (SP, RJ…) | `?estado=SP` |
| `cidade` | texto parcial (ilike) | `?cidade=campinas` |
| `porte` | `pequeno` / `medio` / `grande` | `?porte=medio` |
| `sexo` | `macho` / `femea` | `?sexo=femea` |
| `castrado` | `sim` / `nao` | `?castrado=sim` |
| `convive_criancas` | `sim` / `nao` / `nao_testado` | `?convive_criancas=sim` |
| `convive_caes` | `sim` / `nao` / `nao_testado` | `?convive_caes=sim` |
| `pagina` | número (padrão 1) | `?pagina=2` |

URLs com filtros podem ser compartilhadas — o estado da busca está inteiramente na URL. A paginação mostra 12 animais por página.

## Configuração

### 1. Variáveis de ambiente

Crie `amicao-app/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua-chave-anon>
RESEND_API_KEY=re_<sua-chave-resend>
```

A chave do Resend é obtida em [resend.com](https://resend.com) após criar uma conta. O envio de emails usa `onboarding@resend.dev` em desenvolvimento (sem verificação de domínio necessária).

### Fluxo de gerenciamento de anúncios

1. Ao cadastrar, o anunciante informa seu email → sistema gera código de 6 dígitos → salva no banco → envia por email via Resend
2. Na página do animal, botão **Gerenciar anúncio** abre modal que pede o código
3. Código correto → opções de alterar status, gerenciar fotos e remover anúncio
4. Código perdido → link **Não tenho o código** → campo de email → **Reenviar código** → sistema revalida o email e reenviar se corresponder ao cadastro

### 2. Banco de dados e Storage

Execute o arquivo `supabase/setup.sql` no **SQL Editor** do seu projeto Supabase:

> Dashboard → SQL Editor → New query → cole o conteúdo de `supabase/setup.sql` → Run

O script cria:
- Tabela `animais` com todas as colunas e constraints
- Políticas de RLS para leitura e escrita públicas (adequado para MVP sem autenticação)
- Bucket `animais` no Storage (público, limite de 5 MB, aceita JPG/PNG/WEBP/GIF)
- Políticas de RLS do Storage para leitura e upload públicos

> **Nota:** todas as políticas usam `true`/sem restrição de usuário. Quando implementar autenticação, restrinja as políticas de `INSERT`/`DELETE` para `auth.uid() = owner_id`.

## Schema da tabela `animais`

| Coluna | Tipo | Detalhes |
|---|---|---|
| `id` | uuid | PK, gerado automaticamente |
| `nome` | text | opcional |
| `descricao` | text | opcional |
| `idade_estimada` | text | texto livre (ex: "2 anos") |
| `porte` | text | `pequeno` / `medio` / `grande` |
| `sexo` | text | `macho` / `femea` / `desconhecido` |
| `castrado` | boolean | |
| `vacinado` | boolean | |
| `cidade` | text | obrigatório |
| `estado` | text | sigla, ex: SP |
| `foto_url` | text | JSON array de URLs (ex: `["url1","url2"]`) — até 5 fotos |
| `status` | text | `disponivel` / `adotado` |
| **Saúde** | | |
| `passou_por_vet` | boolean | default false |
| `condicao_saude` | text | opcional |
| `medicamento` | text | opcional |
| **Comportamento** | | |
| `alimentacao` | text | `racao` / `caseira` / `misto` |
| `convive_criancas` | text | `sim` / `nao` / `nao_testado` |
| `convive_caes` | text | `sim` / `nao` / `nao_testado` |
| `convive_gatos` | text | `sim` / `nao` / `nao_testado` |
| `comportamento_especial` | text | opcional |
| **Histórico** | | |
| `tinha_dono` | boolean | default false |
| `foi_resgatado` | boolean | default false |
| `tempo_nas_ruas` | text | opcional |
| **Contato privado** | | |
| `contato` | text | WhatsApp público para adotante |
| `resgatador_nome` | text | não exibido publicamente |
| `resgatador_contato` | text | não exibido publicamente |
| **Gerenciamento** | | |
| `email_anunciante` | text | email para receber o código; não exibido publicamente |
| `codigo_gerenciamento` | text | código de 6 dígitos gerado no cadastro |
| `criado_em` | timestamptz | default `now()` |

## Imagens externas

O `next.config.ts` já autoriza o hostname do Supabase Storage via `images.remotePatterns`. Se trocar de projeto Supabase, atualize o `hostname` no arquivo.

## Storage

Bucket `animais` (criado pelo `setup.sql`):
- **Público**: URLs acessíveis sem token de autenticação
- **Limite**: 5 MB por arquivo
- **Formatos**: JPG, PNG, WEBP, GIF
- **Path**: `{timestamp}-{random}.{ext}`
- `foto_url` armazena um array JSON com até 5 URLs por animal
- Fotos individuais podem ser removidas diretamente na página de detalhes (deleta do Storage e atualiza o array no banco)
- Novas fotos podem ser adicionadas na página de detalhes enquanto o total for menor que 5 — botão aparece na strip de miniaturas ou na área vazia

### Políticas RLS requeridas

| Tabela / Bucket | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `animais` (tabela) | ✅ | ✅ | ✅ | ✅ |
| `animais` (storage) | ✅ | ✅ | — | ✅ |

Todas as políticas estão no `setup.sql` com `USING (true)` (MVP sem auth). Restrinja para `auth.uid()` ao implementar login.

## Rodando localmente

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).
