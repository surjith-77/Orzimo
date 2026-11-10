-- ORZIMO MARKETPLACE - MIGRATION: SELLER MOBILE VERIFICATION & COUNTRY CODE
-- ==============================================================================
-- Adds compulsory mobile phone verification fields, country code, and timestamp
-- columns to public.seller_addresses and public.sellers tables.
-- Safe and idempotent (uses IF NOT EXISTS and non-destructive DDL).
-- ==============================================================================

-- 1. Ensure columns exist on public.seller_addresses
ALTER TABLE public.seller_addresses
  ADD COLUMN IF NOT EXISTS country_code VARCHAR(10) DEFAULT '+91',
  ADD COLUMN IF NOT EXISTS is_phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMPTZ;

-- 2. Ensure columns exist on public.sellers if present
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sellers') THEN
    ALTER TABLE public.sellers 
      ADD COLUMN IF NOT EXISTS country_code VARCHAR(10) DEFAULT '+91',
      ADD COLUMN IF NOT EXISTS contact_phone TEXT,
      ADD COLUMN IF NOT EXISTS is_phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMPTZ;
  END IF;
END $$;
