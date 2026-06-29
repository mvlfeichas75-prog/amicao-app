# Changelog

## [Unreleased]

### Added
- `lib/fotos.ts` — utilitário `parseFotos` compartilhado entre páginas: parseia `foto_url` como JSON array com fallback para URL simples (compatibilidade com registros antigos)
- `supabase/setup.sql` — script de setup completo: tabela `animais`, bucket `animais` no Storage e políticas de RLS para leitura e upload públicos; README atualizado com instruções passo a passo
- `app/animais/novo/page.tsx` — formulário de cadastro de novo animal (Client Component)
  - Campos: nome (opcional), descrição, idade estimada, porte, sexo, castrado, vacinado, cidade, estado, fotos
  - Upload de 1 a 5 fotos para Supabase Storage (bucket `animais`); URLs salvas como JSON array em `foto_url`
  - Grid de previews com remoção individual por hover e botão `+` enquanto há vagas
  - Insert na tabela `animais` com `status: 'disponivel'`; redireciona para `/animais` ao salvar
- `app/animais/[id]/page.tsx` — página de detalhes do animal
  - Galeria: foto principal em destaque + strip horizontal de miniaturas (borda laranja na ativa)
  - Badges de porte, sexo, castrado e vacinado
  - Grid de informações: localização, porte, sexo, castrado, idade estimada e raça
  - Descrição livre do animal
  - CTA de adoção com link WhatsApp (`contato`) ou botão desabilitado
  - 404 automático via `notFound()` quando o id não existe
- `app/animais/page.tsx` — listagem de cães disponíveis para adoção
  - Exibe a primeira foto do array JSON em cada card
  - Grid responsivo (1/2/3 colunas) com foto, nome, cidade, estado, porte, sexo e badge de castrado
  - Estado vazio com emoji 🐾 e CTA para anunciar

### Fixed
- `app/animais/novo/page.tsx` — campo renomeado de `idade` para `idade_estimada` no insert, alinhando com o schema da tabela
- `lib/supabase.ts` — arquivo renomeado de `supabase-js` (sem extensão) para `supabase.ts`; imports corrigidos em todas as páginas

## [0.1.0] — 2026-06-29

### Added
- Setup inicial do projeto Next.js 16 com Tailwind CSS 4
- Layout global com navbar laranja e footer
- Landing page com hero e seção "Como funciona"
- Cliente Supabase em `lib/supabase.ts`
