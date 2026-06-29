# Changelog

## [Unreleased]

### Added

#### Página de detalhes `/animais/[id]`
- `BotaoRemover.tsx` — Client Component para remover o anúncio completo com `window.confirm()`, delete no Supabase e redirect para `/animais`
- `GaleriaFotos.tsx` — galeria interativa com `useState`: clicar em miniatura atualiza a foto principal; remoção de foto individual (deleta do Storage e atualiza `foto_url` no banco); botão hover na foto principal e X nas miniaturas; upload de novas fotos diretamente na galeria — botão `+` aparece na strip quando há vagas ou na área vazia quando não há nenhuma foto; faz upload para o Storage, atualiza `foto_url` no banco e reflete o resultado no estado local sem reload
- Seções de **Saúde**, **Comportamento** e **Histórico** exibidas na página, com labels legíveis para os valores do banco; seções se ocultam automaticamente quando todos os campos estão vazios
- Badges de vacinado e "passou por vet" no cabeçalho
- Componentes auxiliares `Titulo`, `Badge` e `InfoItem`

#### Formulário `/animais/novo`
- Novos campos organizados em seções visuais (componente `Secao`):
  - **Saúde**: passou por veterinário, condição de saúde, medicamento em uso
  - **Comportamento**: alimentação (ração/caseira/misto), convivência com crianças/cães/gatos (sim/não/não testado), comportamento especial
  - **Histórico**: tinha dono anterior, já foi resgatado, tempo nas ruas
  - **Contato do resgatador**: nome e WhatsApp/e-mail, com aviso de privacidade (não exibido publicamente)
- Suporte a 1–5 fotos com grid de previews, remoção individual por hover e botão `+` enquanto há vagas
- Componentes auxiliares `Checkbox` e `Field`

#### Infraestrutura
- `supabase/setup.sql` — setup completo: tabela `animais`, bucket `animais` no Storage, 13 novas colunas para saúde/comportamento/histórico/contato, políticas RLS para SELECT, INSERT, UPDATE e DELETE; seção `ALTER TABLE ADD COLUMN IF NOT EXISTS` para migrar tabelas existentes
- `lib/fotos.ts` — utilitário `parseFotos` compartilhado: parseia `foto_url` como JSON array com fallback para URL simples
- `next.config.ts` — `images.remotePatterns` com hostname do Supabase Storage

#### Listagem `/animais`
- Barra de filtros (`FiltrosBarra.tsx`) com 7 campos: estado (select com 27 estados), cidade (texto parcial), porte, sexo, castrado, convive com crianças e convive com cães; selects auto-submetem ao mudar, cidade submete via Enter ou botão OK; botão "Limpar" aparece quando há filtro ativo
- Paginação com 12 animais por página: botões Anterior/Próxima como `<Link>` gerados no servidor, indicador "Página X de Y"
- Todos os filtros e a página atual vivem na URL (query string) — permite compartilhar e bookmarkar buscas
- Contador de resultados com sufixo "com esses filtros" quando há filtro ativo
- Estado vazio diferenciado: 🔍 quando nenhum resultado casa com filtros; 🐾 quando não há animais cadastrados
- Exibe a primeira foto do array JSON em cada card
- Grid responsivo (1/2/3 colunas) com foto, nome, cidade, estado, porte, sexo e badge de castrado

### Fixed
- Animal não aparecia na listagem após cadastro — adicionado `router.refresh()` antes de `router.push('/animais')` para invalidar o cache client-side do Next.js App Router
- Coluna `created_at` renomeada para `criado_em` em `page.tsx`, `setup.sql` e README
- Campo `idade` renomeado para `idade_estimada` no insert do formulário
- `lib/supabase.ts` — arquivo renomeado de `supabase-js` (sem extensão) para `supabase.ts`; imports corrigidos em todas as páginas

## [0.1.0] — 2026-06-29

### Added
- Setup inicial do projeto Next.js 16 com Tailwind CSS 4
- Layout global com navbar laranja e footer
- Landing page com hero e seção "Como funciona"
- Cliente Supabase em `lib/supabase.ts`
