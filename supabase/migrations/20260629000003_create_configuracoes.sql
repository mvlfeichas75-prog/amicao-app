-- Migration: tabela de configuracoes (feature flags) + expande status de animais
-- Data: 2026-06-29
-- Execute no SQL Editor do Supabase: https://supabase.com/dashboard/project/_/sql

-- -------------------------------------------------------------
-- 1. Tabela configuracoes (chave/valor para feature flags)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.configuracoes (
  chave         text        PRIMARY KEY,
  valor         text        NOT NULL DEFAULT 'false',
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "configuracoes: leitura pública" ON public.configuracoes;
DROP POLICY IF EXISTS "configuracoes: insert público"  ON public.configuracoes;
DROP POLICY IF EXISTS "configuracoes: update público"  ON public.configuracoes;

CREATE POLICY "configuracoes: leitura pública"
  ON public.configuracoes FOR SELECT USING (true);

CREATE POLICY "configuracoes: insert público"
  ON public.configuracoes FOR INSERT WITH CHECK (true);

CREATE POLICY "configuracoes: update público"
  ON public.configuracoes FOR UPDATE USING (true) WITH CHECK (true);

-- Valores padrão das feature flags
INSERT INTO public.configuracoes (chave, valor) VALUES
  ('feature_cadastro_animal', 'true'),
  ('feature_interesse',       'true'),
  ('feature_filtros',         'true'),
  ('feature_galeria_fotos',   'true'),
  ('feature_reenvio_codigo',  'true')
ON CONFLICT (chave) DO NOTHING;

-- -------------------------------------------------------------
-- 2. Expande valores permitidos de status em animais
--    (adiciona em_triagem e sumiu além de disponivel e adotado)
-- -------------------------------------------------------------
ALTER TABLE public.animais DROP CONSTRAINT IF EXISTS animais_status_check;

ALTER TABLE public.animais
  ADD CONSTRAINT animais_status_check
  CHECK (status IN ('disponivel', 'em_triagem', 'adotado', 'sumiu'));
