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
| `/animais` | Listagem de cães disponíveis para adoção |
| `/animais/novo` | Formulário para cadastrar e anunciar um cão |
| `/animais/[id]` | Detalhes de um animal |
| `/cadastro` | Cadastro de usuário |

## Configuração

### 1. Variáveis de ambiente

Crie `amicao-app/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua-chave-anon>
```

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
| `contato` | text | número WhatsApp, opcional |
| `created_at` | timestamptz | default `now()` |

## Storage

Bucket `animais` (criado pelo `setup.sql`):
- **Público**: URLs acessíveis sem token de autenticação
- **Limite**: 5 MB por arquivo
- **Formatos**: JPG, PNG, WEBP, GIF
- **Path**: `{timestamp}-{random}.{ext}`
- `foto_url` armazena um array JSON com até 5 URLs por animal

## Rodando localmente

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).
