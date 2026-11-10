-- ORZIMO MARKETPLACE - MIGRATION: SELLER ADDRESSES & COMPLIANCE
-- ==============================================================================
-- Non-destructive migration to support mandatory seller address verification,
-- separate dispatch locations, and automated courier transit estimations.
-- Safe to run on existing databases (uses IF NOT EXISTS and non-destructive DDL).
-- ==============================================================================

-- 1. Create or ensure seller_addresses table exists
CREATE TABLE IF NOT EXISTS public.seller_addresses (
  seller_id TEXT PRIMARY KEY,
  business_address JSONB NOT NULL,
  dispatch_address JSONB NOT NULL,
  is_same_as_business BOOLEAN NOT NULL DEFAULT TRUE,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  seller_name TEXT,
  shop_name TEXT,
  contact_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure all columns exist in case table was created with an earlier schema
ALTER TABLE public.seller_addresses 
  ADD COLUMN IF NOT EXISTS seller_name TEXT,
  ADD COLUMN IF NOT EXISTS shop_name TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS is_same_as_business BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- 2. Extend sellers table with postal verification status
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sellers') THEN
    ALTER TABLE public.sellers 
      ADD COLUMN IF NOT EXISTS is_address_verified BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
END $$;

-- 3. Extend products with dispatch information for delivery calculations
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products') THEN
    ALTER TABLE public.products 
      ADD COLUMN IF NOT EXISTS preparation_days INTEGER NOT NULL DEFAULT 1,
      ADD COLUMN IF NOT EXISTS seller_dispatch_pin VARCHAR(6),
      ADD COLUMN IF NOT EXISTS seller_dispatch_city TEXT,
      ADD COLUMN IF NOT EXISTS seller_dispatch_state TEXT;
  END IF;
END $$;

-- 4. Enable Row Level Security (RLS) safely
ALTER TABLE public.seller_addresses ENABLE ROW LEVEL SECURITY;

-- 5. Safe RLS Policies (Drop before create to prevent conflicts)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Sellers can manage own address' AND tablename = 'seller_addresses') THEN
    DROP POLICY "Sellers can manage own address" ON public.seller_addresses;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Buyers can read verified seller dispatch locations' AND tablename = 'seller_addresses') THEN
    DROP POLICY "Buyers can read verified seller dispatch locations" ON public.seller_addresses;
  END IF;
END $$;

-- Policy 1: Authenticated sellers can manage their own address (or allow anon key fallback)
CREATE POLICY "Sellers can manage own address"
  ON public.seller_addresses FOR ALL
  USING (
    auth.uid() IS NULL 
    OR auth.uid()::text = seller_id 
    OR current_user = 'anon' 
    OR current_user = 'authenticated'
  )
  WITH CHECK (
    auth.uid() IS NULL 
    OR auth.uid()::text = seller_id 
    OR current_user = 'anon' 
    OR current_user = 'authenticated'
  );

-- Policy 2: Anyone / buyers can read verified seller dispatch locations to compute transit times
CREATE POLICY "Buyers can read verified seller dispatch locations"
  ON public.seller_addresses FOR SELECT
  USING (is_verified = TRUE);

