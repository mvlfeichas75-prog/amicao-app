-- Migration: adiciona colunas faltantes na tabela animais
-- Data: 2026-06-29
-- Execute no SQL Editor do Supabase: https://supabase.com/dashboard/project/_/sql
--
-- Nomes de coluna usados no código da aplicação:
--   passou_por_vet    (não passou_veterinario)
--   tempo_nas_ruas    (não tempo_ruas)

ALTER TABLE public.animais
  -- Comportamento / alimentação
  ADD COLUMN IF NOT EXISTS alimentacao          text
    CHECK (alimentacao IN ('racao', 'caseira', 'misto')),

  ADD COLUMN IF NOT EXISTS convive_criancas     text NOT NULL DEFAULT 'nao_testado'
    CHECK (convive_criancas IN ('sim', 'nao', 'nao_testado')),

  ADD COLUMN IF NOT EXISTS convive_caes         text NOT NULL DEFAULT 'nao_testado'
    CHECK (convive_caes IN ('sim', 'nao', 'nao_testado')),

  ADD COLUMN IF NOT EXISTS convive_gatos        text NOT NULL DEFAULT 'nao_testado'
    CHECK (convive_gatos IN ('sim', 'nao', 'nao_testado')),

  ADD COLUMN IF NOT EXISTS comportamento_especial text,

  -- Histórico do animal
  ADD COLUMN IF NOT EXISTS tinha_dono           boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS foi_resgatado        boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tempo_nas_ruas       text,

  -- Saúde
  ADD COLUMN IF NOT EXISTS passou_por_vet       boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS condicao_saude       text,
  ADD COLUMN IF NOT EXISTS medicamento          text,

  -- Gerenciamento do anúncio
  ADD COLUMN IF NOT EXISTS email_anunciante     text,
  ADD COLUMN IF NOT EXISTS codigo_gerenciamento text;
