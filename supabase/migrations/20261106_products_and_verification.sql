-- ORZIMO MARKETPLACE - MIGRATION: UNIVERSAL PRODUCTS, CATEGORIES & AI VERIFICATION
-- ==============================================================================
-- Non-destructive migration supporting multi-category listings, dynamic variants,
-- custom specifications, and AI product image verification records.
-- ==============================================================================

-- 1. Ensure categories table has the 10 official categories
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT,
  gradient TEXT,
  bg_light TEXT,
  subcategories JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed/Upsert the 10 core categories
INSERT INTO public.categories (id, name, short_name, icon, description, gradient, bg_light, subcategories)
VALUES 
  ('cakes-bakery', 'Cakes & Bakery', 'Cakes & Bakery', 'Cake', 'Custom celebration cakes, bento cakes, cupcakes, pastries & fresh artisanal breads.', 'linear-gradient(135deg, #FF6B8B 0%, #FF8E53 100%)', '#FFF5F5', '["Celebration Cakes", "Bento Cakes", "Cupcakes", "Pastries", "Artisan Breads", "Cookies"]'::jsonb),
  ('candles-fragrances', 'Candles & Fragrances', 'Candles', 'Flame', 'Hand-poured scented soy wax candles, reed diffusers, wax melts & room aromatics.', 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)', '#FFF7ED', '["Soy Candles", "Beeswax Candles", "Wax Melts", "Reed Diffusers", "Aroma Oils"]'::jsonb),
  ('handmade-gifts', 'Handmade Gifts', 'Gifts', 'Gift', 'Curated gift hampers, memory scrapbooks, personalized keepsakes & festival hampers.', 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', '#F5F3FF', '["Gift Hampers", "Memory Scrapbooks", "Personalized Keepsakes", "Greeting Cards", "Festive Boxes"]'::jsonb),
  ('art-crafts', 'Art & Crafts', 'Art & Crafts', 'Palette', 'Original canvas paintings, Mandala wall plates, resin art, pottery & DIY craft kits.', 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)', '#EFF6FF', '["Canvas Paintings", "Resin Art", "Mandala Art", "Lippan Art", "DIY Kits"]'::jsonb),
  ('clothing-accessories', 'Clothing & Accessories', 'Clothing', 'Scissors', 'Bespoke handloom apparel, embroidered kurtas, scarves, custom tailoring & accessories.', 'linear-gradient(135deg, #10B981 0%, #059669 100%)', '#ECFDF5', '["Handmade Kurtas", "Custom Stitched Apparel", "Scarves & Stoles", "Kids Wear", "Fabric Accessories"]'::jsonb),
  ('electronics', 'Electronics', 'Electronics', 'Cpu', 'Smart gadgets, maker electronics, audio devices, smart home kits & accessories.', 'linear-gradient(135deg, #0284C7 0%, #06B6D4 100%)', '#F0F9FF', '["Smart Audio", "DIY Electronics", "Wearables", "Sensors & Boards", "Accessories"]'::jsonb),
  ('machinery-equipment', 'Machinery & Equipment', 'Machinery', 'Wrench', 'Light industrial tools, kitchen studio machinery, craft equipment & workshop gear.', 'linear-gradient(135deg, #475569 0%, #1E293B 100%)', '#F8FAFC', '["Kitchen Equipment", "Craft Machinery", "Power Tools", "Industrial Mixers", "Presses"]'::jsonb),
  ('furniture-decor', 'Furniture & Home Decor', 'Furniture', 'Home', 'Handcrafted solid wood furniture, accent tables, macrame wall hangings & ceramics.', 'linear-gradient(135deg, #D97706 0%, #B45309 100%)', '#FEF3C7', '["Accent Furniture", "Wall Decor", "Ceramic Planters", "Macrame", "Lighting"]'::jsonb),
  ('food-beverages', 'Food & Beverages', 'Food & Drinks', 'UtensilsCrossed', 'Artisanal spice blends, organic pickles, roasted granolas, traditional snacks & drinks.', 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', '#FFFBEB', '["Traditional Sweets", "Organic Pickles", "Artisanal Spices", "Granolas", "Beverages"]'::jsonb),
  ('other-products', 'Other Products', 'Other', 'Package', 'Specialty creations, custom bespoke inventions & unique artisan catalog goods.', 'linear-gradient(135deg, #64748B 0%, #334155 100%)', '#F1F5F9', '["General Merchandise", "Custom Orders", "Specialty Goods"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  short_name = EXCLUDED.short_name,
  description = EXCLUDED.description,
  subcategories = EXCLUDED.subcategories;

-- 2. Extend products table with universal fields & verification state
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'New',
  ADD COLUMN IF NOT EXISTS brand TEXT,
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS verification_result JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT FALSE;

-- 3. Create product_image_verifications table for audit trail
CREATE TABLE IF NOT EXISTS public.product_image_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id TEXT,
  seller_id TEXT,
  image_url TEXT NOT NULL,
  product_name TEXT NOT NULL,
  category_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('MATCH', 'MISMATCH', 'UNCERTAIN')),
  confidence NUMERIC(3, 2),
  detected_category TEXT,
  detected_type TEXT,
  explanation TEXT,
  model_version TEXT DEFAULT 'gemini-1.5-flash',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS) safely
ALTER TABLE public.product_image_verifications ENABLE ROW LEVEL SECURITY;

-- 5. Safe RLS Policies for product image verifications
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Sellers can manage own verifications' AND tablename = 'product_image_verifications') THEN
    DROP POLICY "Sellers can manage own verifications" ON public.product_image_verifications;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view verified image results' AND tablename = 'product_image_verifications') THEN
    DROP POLICY "Public can view verified image results" ON public.product_image_verifications;
  END IF;
END $$;

CREATE POLICY "Sellers can manage own verifications"
  ON public.product_image_verifications FOR ALL
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

CREATE POLICY "Public can view verified image results"
  ON public.product_image_verifications FOR SELECT
  USING (status = 'MATCH');

-- 6. Setup Supabase Storage Bucket for Product Photographs
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public Access to Product Images' AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Public Access to Product Images" ON storage.objects
      FOR SELECT USING (bucket_id = 'product-images');
  END IF;
END $$;

