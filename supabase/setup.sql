-- =============================================================
-- Amicão — setup completo do Supabase
-- Execute no SQL Editor: https://supabase.com/dashboard/project/_/sql
-- =============================================================

-- -------------------------------------------------------------
-- 1. Tabela animais
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.animais (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        text,
  descricao   text,
  idade_estimada text,
  porte       text        NOT NULL CHECK (porte IN ('pequeno', 'medio', 'grande')),
  sexo        text        NOT NULL DEFAULT 'desconhecido'
                          CHECK (sexo IN ('macho', 'femea', 'desconhecido')),
  castrado    boolean     NOT NULL DEFAULT false,
  vacinado    boolean     NOT NULL DEFAULT false,
  cidade      text        NOT NULL,
  estado      text        NOT NULL,
  foto_url    text,                        -- JSON array de URLs, ex: '["url1","url2"]'
  status      text        NOT NULL DEFAULT 'disponivel'
                          CHECK (status IN ('disponivel', 'adotado')),
  -- Saúde
  passou_por_vet      boolean     NOT NULL DEFAULT false,
  condicao_saude      text,
  medicamento         text,
  -- Comportamento
  alimentacao         text        CHECK (alimentacao IN ('racao', 'caseira', 'misto')),
  convive_criancas    text        NOT NULL DEFAULT 'nao_testado'
                                  CHECK (convive_criancas IN ('sim', 'nao', 'nao_testado')),
  convive_caes        text        NOT NULL DEFAULT 'nao_testado'
                                  CHECK (convive_caes IN ('sim', 'nao', 'nao_testado')),
  convive_gatos       text        NOT NULL DEFAULT 'nao_testado'
                                  CHECK (convive_gatos IN ('sim', 'nao', 'nao_testado')),
  comportamento_especial text,
  -- Histórico
  tinha_dono          boolean     NOT NULL DEFAULT false,
  foi_resgatado       boolean     NOT NULL DEFAULT false,
  tempo_nas_ruas      text,
  -- Contato privado do resgatador (não exibido publicamente)
  contato             text,
  resgatador_nome     text,
  resgatador_contato  text,
  -- Gerenciamento do anúncio
  email_anunciante    text,
  codigo_gerenciamento text,
  criado_em   timestamptz NOT NULL DEFAULT now()
);

-- RLS: habilita e permite leitura e escrita públicas (MVP sem autenticação)
ALTER TABLE public.animais ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "animais: leitura pública"   ON public.animais;
DROP POLICY IF EXISTS "animais: insert público"     ON public.animais;
DROP POLICY IF EXISTS "animais: delete público"     ON public.animais;
DROP POLICY IF EXISTS "animais: update público"     ON public.animais;

CREATE POLICY "animais: leitura pública"
  ON public.animais FOR SELECT USING (true);

CREATE POLICY "animais: insert público"
  ON public.animais FOR INSERT WITH CHECK (true);

-- Permite remoção e atualização de fotos sem autenticação (MVP)
-- Restrinja a auth.uid() quando implementar login
CREATE POLICY "animais: delete público"
  ON public.animais FOR DELETE USING (true);

CREATE POLICY "animais: update público"
  ON public.animais FOR UPDATE USING (true) WITH CHECK (true);

-- -------------------------------------------------------------
-- 2. Novas colunas — execute se a tabela animais já existia
-- -------------------------------------------------------------
ALTER TABLE public.animais
  ADD COLUMN IF NOT EXISTS passou_por_vet      boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS condicao_saude      text,
  ADD COLUMN IF NOT EXISTS medicamento         text,
  ADD COLUMN IF NOT EXISTS alimentacao         text        CHECK (alimentacao IN ('racao', 'caseira', 'misto')),
  ADD COLUMN IF NOT EXISTS convive_criancas    text        NOT NULL DEFAULT 'nao_testado'
                                               CHECK (convive_criancas IN ('sim', 'nao', 'nao_testado')),
  ADD COLUMN IF NOT EXISTS convive_caes        text        NOT NULL DEFAULT 'nao_testado'
                                               CHECK (convive_caes IN ('sim', 'nao', 'nao_testado')),
  ADD COLUMN IF NOT EXISTS convive_gatos       text        NOT NULL DEFAULT 'nao_testado'
                                               CHECK (convive_gatos IN ('sim', 'nao', 'nao_testado')),
  ADD COLUMN IF NOT EXISTS comportamento_especial text,
  ADD COLUMN IF NOT EXISTS tinha_dono          boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS foi_resgatado       boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tempo_nas_ruas      text,
  ADD COLUMN IF NOT EXISTS resgatador_nome     text,
  ADD COLUMN IF NOT EXISTS resgatador_contato  text,
  ADD COLUMN IF NOT EXISTS email_anunciante    text,
  ADD COLUMN IF NOT EXISTS codigo_gerenciamento text;

-- -------------------------------------------------------------
-- 3. Storage — bucket animais
-- -------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'animais',
  'animais',
  true,                                    -- bucket público: URLs acessíveis sem token
  5242880,                                 -- limite de 5 MB por arquivo
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
  SET public            = true,
      file_size_limit   = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS no bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "animais storage: leitura pública" ON storage.objects;
DROP POLICY IF EXISTS "animais storage: upload público"  ON storage.objects;
DROP POLICY IF EXISTS "animais storage: delete público"  ON storage.objects;

-- Qualquer pessoa pode visualizar as fotos
CREATE POLICY "animais storage: leitura pública"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'animais');

-- Qualquer pessoa pode fazer upload (sem autenticação — adequado para MVP)
CREATE POLICY "animais storage: upload público"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'animais');

-- Qualquer pessoa pode deletar (ajuste para auth quando implementar login)
CREATE POLICY "animais storage: delete público"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'animais');
