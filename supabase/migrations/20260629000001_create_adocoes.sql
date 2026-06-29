-- Migration: cria tabela adocoes para registrar interesses de adoção
-- Data: 2026-06-29
-- Execute no SQL Editor do Supabase: https://supabase.com/dashboard/project/_/sql

CREATE TABLE IF NOT EXISTS public.adocoes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id   uuid        NOT NULL REFERENCES public.animais(id) ON DELETE CASCADE,
  nome        text        NOT NULL,
  email       text        NOT NULL,
  telefone    text,
  motivo      text,
  status      text        NOT NULL DEFAULT 'interesse'
                          CHECK (status IN ('interesse', 'em_contato', 'adotado', 'cancelado')),
  criado_em   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.adocoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "adocoes: insert público"  ON public.adocoes;
DROP POLICY IF EXISTS "adocoes: leitura pública" ON public.adocoes;

CREATE POLICY "adocoes: insert público"
  ON public.adocoes FOR INSERT WITH CHECK (true);

CREATE POLICY "adocoes: leitura pública"
  ON public.adocoes FOR SELECT USING (true);
