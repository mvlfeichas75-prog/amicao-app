# Changelog

Todas as mudanças notáveis neste projeto são documentadas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [Não publicado]

### Adicionado
- Botão "Tenho interesse" na página do animal substitui o botão "Contato indisponível"; abre modal com formulário de nome, email, telefone (opcional) e motivo
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
