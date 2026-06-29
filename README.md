# Amicão

Plataforma de adoção de animais resgatados. Conecta resgatadores a potenciais adotantes com anúncios simples, filtros por localidade/porte/espécie e gerenciamento via código seguro.

## Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Backend/DB**: Supabase (PostgreSQL + Auth + Storage)
- **Email**: Resend (`lib/email.ts`)
- **Linguagem**: TypeScript

## Estrutura do projeto

```
amicao-app/          Next.js (app principal)
supabase/
  setup.sql          Schema completo (criação inicial)
  migrations/        Migrations incrementais (execute em ordem)
```

## Setup local

```bash
cd amicao-app
npm install
cp .env.example .env.local   # preencha as variáveis abaixo
npm run dev
```

### Variáveis de ambiente (`.env.local`)

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon do Supabase |
| `RESEND_API_KEY` | Chave de API do [Resend](https://resend.com) (envio de e-mails) |

## Banco de dados (Supabase)

### Primeira instalação

Execute `supabase/setup.sql` no SQL Editor do Supabase.

### Atualizações incrementais

Execute os arquivos em `supabase/migrations/` **em ordem cronológica** (prefixo `YYYYMMDDHHMMSS`):

| Arquivo | Descrição |
|---|---|
| `20260629000000_add_missing_columns_animais.sql` | Adiciona colunas de comportamento, saúde, histórico e gerenciamento à tabela `animais` |
| `20260629000001_create_adocoes.sql` | Cria tabela `adocoes` para registrar interesses de adoção |

## Tabela `animais` — colunas principais

| Coluna | Tipo | Descrição |
|---|---|---|
| `alimentacao` | text | `racao`, `caseira` ou `misto` |
| `convive_criancas` | text | `sim`, `nao`, `nao_testado` |
| `convive_caes` | text | `sim`, `nao`, `nao_testado` |
| `convive_gatos` | text | `sim`, `nao`, `nao_testado` |
| `comportamento_especial` | text | Observações livres de comportamento |
| `tinha_dono` | boolean | Animal já teve dono anterior |
| `foi_resgatado` | boolean | Animal foi resgatado de situação de risco |
| `tempo_nas_ruas` | text | Tempo estimado em situação de rua |
| `passou_por_vet` | boolean | Passou por avaliação veterinária |
| `condicao_saude` | text | Descrição da condição de saúde |
| `medicamento` | text | Medicamentos em uso |
| `email_anunciante` | text | E-mail do resgatador (privado) |
| `codigo_gerenciamento` | text | Código para editar/remover o anúncio |

## Perfis de usuário

| Nível | Perfil | Permissões |
|---|---|---|
| 1 | Admin | Acesso total |
| 2 | Adotante | Visualizar anúncios, candidatar-se |
| 3 | Resgatador | Publicar anúncios, gerenciar animais |
| 4 | ONG | Funcionalidades de resgatador + gestão de grupo |
| 5 | Parceiro | Acesso especial para parceiros institucionais |
