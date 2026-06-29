# Changelog

Todas as mudanças notáveis neste projeto são documentadas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [Não publicado]

### Corrigido
- `app/animais/[id]/ModalGerenciar.tsx`: substituído `<form>` de reenvio aninhado dentro do `<form>` de verificação de código por `<div>` — HTML inválido que fazia o browser ignorar o submit interno; botão agora usa `onClick` e o campo responde ao Enter via `onKeyDown`
- `app/api/reenviar-codigo/route.ts`: reescrita com `console.log` em cada etapa (rota atingida, env vars presentes, body recebido, animal encontrado, emails comparados, código salvo, email enviado); `createClient` movido para dentro do handler para evitar falha silenciosa na inicialização do módulo; valida `RESEND_API_KEY` antes de tentar enviar
- `app/api/reenviar-codigo/route.ts`: agora retorna motivos distintos (`email_nao_encontrado`, `erro_interno`, `erro_email`) em vez de sempre `{ ok: true }`, permitindo ao cliente distinguir sucesso de falha; adiciona `console.log` e `console.error` com JSON completo para debug
- `app/animais/[id]/ModalGerenciar.tsx`: função `reenviarCodigo` lê o campo `motivo` da resposta — mostra "Email não encontrado para este anúncio" quando o email não confere, "Código enviado para seu email!" no sucesso e mensagem de erro genérica em falhas de rede; erro limpa ao reeditar o campo; `erroReenvio` nunca era exibido antes pois `setReenvioOk(true)` era chamado até no `catch`
- `middleware.ts`: removida interceptação de `/admin/*` que redirecionava para `/login` via Supabase Auth antes da página carregar. O painel admin usa auth própria por senha (`ADMIN_PASSWORD`) gerenciada no `page.tsx`, não Supabase Auth.

### Adicionado
- `lib/tempo.ts`: utilitário `tempoRelativo(dataStr)` que retorna strings como "há 2 dias", "há 3 horas"
- Exibição de tempo relativo ("Publicado há X dias") nos cards da listagem `/animais` e no cabeçalho da página `/animais/[id]`

### Corrigido
- `app/api/reenviar-codigo/route.ts`: agora gera um **novo** código de 6 dígitos, salva no banco (`animais.codigo_gerenciamento`) e envia o novo código via Resend com `await` (antes apenas reenviava o código existente com `.catch` silencioso)
- `app/animais/[id]/ModalGerenciar.tsx`: mensagem de confirmação de reenvio mais visível — título "Email enviado!" em verde com instrução para verificar spam

---

### Adicionado (anterior)
- Painel admin em `/admin` com autenticação por senha (`ADMIN_PASSWORD`), sessão em localStorage e 4 seções:
  - **Dashboard**: cards com métricas (total animais, disponíveis, adotados, usuários, interesses)
  - **Gestão de animais**: tabela com foto miniatura, localização, status inline editável e remoção
  - **Gestão de interesses**: tabela de registros da tabela `adocoes` com dados do interessado
  - **Feature Flags**: toggles para ativar/desativar módulos, persistidos na tabela `configuracoes`
- `app/api/admin/login/route.ts`: verifica senha contra `ADMIN_PASSWORD` (server-side)
- Migration `20260629000003_create_configuracoes.sql`: cria tabela `configuracoes` e expande `status` de animais com `em_triagem` e `sumiu`
- Migration `20260629000002_alter_adocoes_interessado_anonimo.sql`: torna `adotante_id` nullable e adiciona `nome_interessado`, `email_interessado`, `telefone_interessado` à tabela `adocoes` para suporte a interesse sem login
- Botão "Tenho interesse" na página do animal substitui o botão "Contato indisponível"; abre modal com formulário de nome, email, telefone (opcional) e motivo

### Corrigido
- `app/api/interesse/route.ts`: insert na tabela `adocoes` agora usa os nomes de coluna corretos (`nome_interessado`, `email_interessado`, `telefone_interessado`, `observacoes`) em vez dos nomes anteriores que não existiam na tabela
- `app/animais/[id]/ModalInteresse.tsx`: componente client do formulário de interesse com tela de sucesso após envio
- `app/api/interesse/route.ts`: salva interesse na tabela `adocoes` (status `interesse`) e envia email de notificação para o anunciante via Resend
- Migration `20260629000001_create_adocoes.sql`: cria tabela `adocoes` com colunas `animal_id`, `nome`, `email`, `telefone`, `motivo`, `status` e `criado_em`
- `lib/email.ts`: abstração central de envio de e-mail via Resend SDK com função `sendEmail(destinatario, assunto, corpo)`
- Migration `20260629000000_add_missing_columns_animais.sql`: adiciona colunas faltantes à tabela `animais` no Supabase
  - `alimentacao` — tipo de alimentação do animal (`racao`, `caseira`, `misto`)
  - `convive_criancas`, `convive_caes`, `convive_gatos` — compatibilidade com outros moradores
  - `comportamento_especial` — observações livres de comportamento
  - `tinha_dono`, `foi_resgatado` — histórico do animal
  - `tempo_nas_ruas` — tempo estimado em situação de rua
  - `passou_por_vet` — indicador de avaliação veterinária
  - `condicao_saude`, `medicamento` — informações de saúde
  - `email_anunciante`, `codigo_gerenciamento` — dados de gerenciamento do anúncio
- `README.md` com documentação de setup, estrutura, variáveis de ambiente e schema principal

### Alterado
- `app/api/enviar-codigo/route.ts`: usa `sendEmail` de `@/lib/email` em vez de instanciar Resend diretamente
- `app/api/reenviar-codigo/route.ts`: idem

---

## [0.5.0] — 2026-06-27

### Adicionado
- Seção de benefícios por perfil na página de cadastro, exibida antes do formulário
- Sistema de código de gerenciamento do anúncio (geração e exibição pós-publicação)
- Modal de reenvio de código de gerenciamento por e-mail
- Autenticação com Supabase Auth e níveis de usuário (adotante, resgatador, ONG, parceiro, admin)

## [0.4.0] — 2026-06-20

### Adicionado
- Filtros por URL na listagem `/animais` (espécie, porte, cidade, estado, sexo, castrado)
- Paginação na listagem de animais

## [0.3.0] — anterior

### Adicionado
- Formulário de cadastro de animal (`/animais/novo`)
- Página de detalhe do animal (`/animais/[id]`)
- Upload de fotos via Supabase Storage
- Listagem pública de animais disponíveis
