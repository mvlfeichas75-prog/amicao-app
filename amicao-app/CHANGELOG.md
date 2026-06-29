# Changelog

## [Unreleased]

### Added
- `app/animais/[id]/page.tsx` — página de detalhes do animal
  - Foto em destaque com badge "Adotado" quando aplicável
  - Grid de informações: localização, porte, sexo, castrado, idade e raça
  - Descrição livre do animal
  - CTA de adoção com link para WhatsApp (campo `contato`) ou botão desabilitado
  - 404 automático via `notFound()` quando o id não existe
- `app/animais/page.tsx` — listagem de cães disponíveis para adoção
  - Busca animais com `status = 'disponivel'` no Supabase, ordenados por data decrescente
  - Grid responsivo de cards (1/2/3 colunas) com foto, nome, cidade, estado, porte, sexo e badge de castrado
  - Estado vazio com emoji 🐾 e CTA para anunciar
  - Botão "Anunciar cão" no cabeçalho da listagem
  - Tema laranja consistente com o layout global

## [0.1.0] — 2026-06-29

### Added
- Setup inicial do projeto Next.js 16 com Tailwind CSS 4
- Layout global com navbar laranja e footer
- Landing page com hero e seção "Como funciona"
- Cliente Supabase em `lib/supabase-js`
