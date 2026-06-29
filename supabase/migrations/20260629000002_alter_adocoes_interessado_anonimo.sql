-- Migration: suporte a interesse anônimo na tabela adocoes
-- Data: 2026-06-29
-- Execute no SQL Editor do Supabase: https://supabase.com/dashboard/project/_/sql
--
-- Contexto: o formulário "Tenho interesse" pode ser submetido sem login,
-- portanto adotante_id deve ser nullable e as colunas de contato do
-- interessado precisam existir na tabela.

-- Torna adotante_id nullable para permitir submissões anônimas
ALTER TABLE public.adocoes
  ALTER COLUMN adotante_id DROP NOT NULL;

-- Adiciona colunas de contato do interessado anônimo
ALTER TABLE public.adocoes
  ADD COLUMN IF NOT EXISTS nome_interessado    text,
  ADD COLUMN IF NOT EXISTS email_interessado   text,
  ADD COLUMN IF NOT EXISTS telefone_interessado text;
