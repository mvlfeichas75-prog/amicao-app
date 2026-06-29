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

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua-chave-anon>
```

## Schema esperado (tabela `animais`)

| Coluna | Tipo | Valores |
|---|---|---|
| `id` | uuid | PK |
| `nome` | text | |
| `cidade` | text | |
| `estado` | text | sigla (ex: SP) |
| `porte` | text | pequeno / médio / grande |
| `sexo` | text | macho / fêmea |
| `castrado` | boolean | |
| `foto_url` | text | URL pública do Supabase Storage |
| `status` | text | disponivel / adotado |
| `vacinado` | boolean | |
| `contato` | text | número WhatsApp (opcional) |
| `created_at` | timestamptz | default now() |

### Storage

Crie um bucket público chamado `fotos` no Supabase Storage. As fotos são salvas no path `animais/{timestamp}.{ext}`.

## Rodando localmente

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).
