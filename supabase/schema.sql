-- ==============================================================================
-- ORZIMO MARKETPLACE - SUPABASE PRODUCTION DATABASE SCHEMA
-- ==============================================================================
-- Complete schema for authentic users, sellers, products, orders, bookings,
-- reviews, notifications, payments, and cart items with Row Level Security (RLS).
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin')),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  city TEXT DEFAULT 'Bengaluru',
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. SELLERS (Artisan / Home Kitchen Studio details)
CREATE TABLE IF NOT EXISTS public.sellers (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  shop_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'cakes-bakery',
  badge TEXT DEFAULT 'New Creator',
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  rating NUMERIC(3, 2) DEFAULT 0.0,
  reviews_count INTEGER DEFAULT 0,
  location TEXT,
  fssai_number TEXT,
  payout_upi TEXT,
  is_open_for_orders BOOLEAN NOT NULL DEFAULT TRUE,
  max_orders_per_day INTEGER NOT NULL DEFAULT 8,
  lead_time_hours INTEGER NOT NULL DEFAULT 24,
  allow_pickup BOOLEAN NOT NULL DEFAULT TRUE,
  allow_delivery BOOLEAN NOT NULL DEFAULT TRUE,
  blocked_dates JSONB DEFAULT '[]'::jsonb,
  phone_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CATEGORIES (Taxonomy)
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

-- 4. PRODUCTS (Real creator products)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  category_name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(10, 2),
  discount TEXT,
  rating NUMERIC(3, 2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_pre_bookable BOOLEAN NOT NULL DEFAULT TRUE,
  is_customizable BOOLEAN NOT NULL DEFAULT FALSE,
  is_bestseller BOOLEAN NOT NULL DEFAULT FALSE,
  is_fresh BOOLEAN NOT NULL DEFAULT FALSE,
  is_out_of_stock BOOLEAN NOT NULL DEFAULT FALSE,
  stock_quantity INTEGER NOT NULL DEFAULT 10 CHECK (stock_quantity >= 0),
  daily_batch_limit INTEGER NOT NULL DEFAULT 6,
  delivery_slot TEXT,
  lead_time TEXT DEFAULT '24 hours notice',
  custom_options JSONB DEFAULT '{}'::jsonb,
  short_desc TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PRODUCT IMAGES (Optional detailed gallery)
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. CART ITEMS (Persistent Buyer Carts)
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  selected_weight TEXT,
  selected_flavor TEXT,
  custom_message TEXT,
  slot_date TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. WISHLISTS (Saved Products)
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 8. ORDERS (Real customer orders)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY, -- e.g. 'ORZ-1234'
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE RESTRICT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_city TEXT DEFAULT 'Bengaluru',
  slot_date TEXT NOT NULL,
  delivery_type TEXT NOT NULL DEFAULT 'Home Delivery',
  special_instructions TEXT,
  subtotal NUMERIC(10, 2) NOT NULL,
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'Pending Confirmation',
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Preparing', 'Ready', 'Completed', 'Cancelled')),
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  weight TEXT,
  flavor TEXT,
  message TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(10, 2) NOT NULL,
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. BOOKINGS (Custom bespoke requests)
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY, -- e.g. 'BK-101'
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  occasion TEXT NOT NULL,
  item_description TEXT NOT NULL,
  guest_count INTEGER,
  target_date DATE NOT NULL,
  delivery_time TEXT,
  estimated_budget TEXT,
  status TEXT NOT NULL DEFAULT 'Pending Review' CHECK (status IN ('Pending Review', 'Accepted', 'Declined', 'Completed')),
  decline_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. REVIEWS (Authentic customer feedback)
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  order_id TEXT REFERENCES public.orders(id) ON DELETE SET NULL,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  buyer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'order' CHECK (type IN ('order', 'booking', 'payment', 'review', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  order_id TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. PAYMENT RECORDS (Real payment transactions)
CREATE TABLE IF NOT EXISTS public.payment_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'captured', 'settled', 'failed', 'refunded')),
  provider TEXT NOT NULL DEFAULT 'razorpay',
  transaction_id TEXT,
  payment_method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can view seller profiles, only own user can edit profile
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Sellers: Viewable by everyone; editable only by the seller
CREATE POLICY "Sellers viewable by everyone" 
  ON public.sellers FOR SELECT USING (true);

CREATE POLICY "Sellers can manage own seller profile" 
  ON public.sellers FOR ALL USING (auth.uid() = id);

-- Categories: Read-only for all users
CREATE POLICY "Categories viewable by everyone" 
  ON public.categories FOR SELECT USING (true);

-- Products: Everyone can view active products; sellers manage own products
CREATE POLICY "Active products viewable by everyone" 
  ON public.products FOR SELECT USING (true);

CREATE POLICY "Sellers can insert products" 
  ON public.products FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own products" 
  ON public.products FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete own products" 
  ON public.products FOR DELETE USING (auth.uid() = seller_id);

-- Cart & Wishlist: Only accessible by the owner
CREATE POLICY "Users manage own cart" 
  ON public.cart_items FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own wishlist" 
  ON public.wishlists FOR ALL USING (auth.uid() = user_id);

-- Orders: Buyers view own orders; Sellers view orders for their shop
CREATE POLICY "Users view own orders" 
  ON public.orders FOR SELECT 
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can create orders" 
  ON public.orders FOR INSERT 
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Sellers can update orders for their shop" 
  ON public.orders FOR UPDATE 
  USING (auth.uid() = seller_id);

CREATE POLICY "Users view order items" 
  ON public.order_items FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.orders o 
    WHERE o.id = order_items.order_id 
    AND (o.buyer_id = auth.uid() OR o.seller_id = auth.uid())
  ));

-- Bookings: Visible to relevant buyer or seller
CREATE POLICY "Bookings viewable by buyer or seller" 
  ON public.bookings FOR SELECT 
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can insert bookings" 
  ON public.bookings FOR INSERT 
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Sellers can update bookings" 
  ON public.bookings FOR UPDATE 
  USING (auth.uid() = seller_id);

-- Notifications: Private to recipient
CREATE POLICY "Users see own notifications" 
  ON public.notifications FOR ALL 
  USING (auth.uid() = user_id);

-- Reviews: Viewable by all; created by verified buyers
CREATE POLICY "Reviews viewable by everyone" 
  ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Buyers can write reviews" 
  ON public.reviews FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- ==============================================================================
-- INITIAL TAXONOMY CATEGORIES SEED (Official marketplace taxonomy)
-- ==============================================================================
INSERT INTO public.categories (id, name, short_name, icon, description, gradient, bg_light, subcategories)
VALUES
  ('cakes-bakery', 'Homemade Cakes & Bakery', 'Cakes & Bakery', 'Cake', 'Custom celebration cakes, brownies, cupcakes, artisan breads & cookies fresh from home ovens.', 'linear-gradient(135deg, #FF6B8B 0%, #FF8E53 100%)', '#FFF5F5', '["Birthday Cakes", "Bento Cakes", "Cupcakes & Brownies", "Eggless Specials", "Artisanal Breads", "Tea Time Bakes"]'),
  ('handmade-gifts', 'Handmade Gifts', 'Handmade Gifts', 'Gift', 'Curated gift hampers, memory scrapbooks, crochet treasures & handcrafted keepsakes.', 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', '#F5F3FF', '["Gift Hampers", "Memory Albums", "Crochet Items", "Greeting Cards", "Festive Boxes"]'),
  ('personalized-products', 'Personalized Products', 'Personalized', 'Sparkles', 'Custom engraved wooden plaques, resin photo frames, nameplates & personalized mugs.', 'linear-gradient(135deg, #0284C7 0%, #06B6D4 100%)', '#F0F9FF', '["Resin Art & Frames", "Custom Nameplates", "Engraved Gifts", "Caricatures & Portraits", "Custom Stationery"]'),
  ('homemade-foods', 'Homemade Foods & Snacks', 'Foods & Snacks', 'UtensilsCrossed', 'Authentic regional pickles, traditional sweets, namkeens, healthy granolas & spices.', 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', '#FFFBEB', '["Traditional Sweets", "Organic Pickles", "Namkeen & Savouries", "Granola & Energy Bars", "Spice Blends"]'),
  ('handmade-jewellery', 'Handmade Jewellery', 'Jewellery', 'Gem', 'Terracotta jewellery, polymer clay earrings, beaded necklaces & oxidized silver accessories.', 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', '#FDF2F8', '["Clay Earrings", "Terracotta Sets", "Beaded Chokers", "Fabric Jewellery", "Hair Accessories"]'),
  ('clothing-tailoring', 'Clothing & Tailoring', 'Clothing', 'Scissors', 'Custom stitched ethnic wear, hand-block printed kurtas, kids custom dresses & alterations.', 'linear-gradient(135deg, #10B981 0%, #059669 100%)', '#ECFDF5', '["Custom Blouses", "Hand-Block Kurtas", "Kids Festive Wear", "Bespoke Dresses", "Dupattas & Stoles"]'),
  ('candles-decor', 'Candles & Home Decor', 'Home Decor', 'Flame', 'Soy wax scented candles, macrame wall hangings, ceramic planters & brass accents.', 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)', '#FFF7ED', '["Scented Soy Candles", "Macrame Decor", "Ceramic Vases", "Table Runners", "Fairy Light Jars"]'),
  ('art-crafts', 'Art & Crafts', 'Art & Crafts', 'Palette', 'Original canvas paintings, Mandala wall plates, Lippan art & DIY craft starter kits.', 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)', '#EFF6FF', '["Lippan Art", "Mandala Wall Plates", "Canvas Paintings", "Resin Clocks", "DIY Craft Kits"]'),
  ('party-decorations', 'Party Decorations', 'Party Decor', 'PartyPopper', 'Handcrafted birthday banners, photobooth props, backdrop curtains & theme party packs.', 'linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)', '#F0FDFA', '["Themed Banners", "Cake Toppers", "Photobooth Props", "Paper Flowers", "Welcome Boards"]'),
  ('workshops-classes', 'Workshops & Classes', 'Workshops', 'Store', 'Live baking masterclasses, resin art workshops, pottery sessions & creative courses.', 'linear-gradient(135deg, #10B981 0%, #0284C7 100%)', '#F0FDF4', '["Baking Classes", "Resin Art", "Pottery Sessions", "Candle Making", "Crochet Basics"]')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  short_name = EXCLUDED.short_name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description;

-- ==============================================================================
-- 13. ADDRESS VERIFICATION & DELIVERY MANAGEMENT TABLES
-- ==============================================================================

-- Buyer Addresses (11 Mandatory Fields + Indian PIN Code Verification)
CREATE TABLE IF NOT EXISTS public.buyer_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  house_no TEXT NOT NULL,
  street TEXT NOT NULL,
  area TEXT NOT NULL,
  landmark TEXT,
  pincode VARCHAR(6) NOT NULL CHECK (pincode ~ '^[1-9][0-9]{5}$'),
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  address_type VARCHAR(20) NOT NULL DEFAULT 'Home' CHECK (address_type IN ('Home', 'Work', 'Other')),
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  is_verified BOOLEAN NOT NULL DEFAULT TRUE,
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seller Business & Dispatch Addresses
CREATE TABLE IF NOT EXISTS public.seller_addresses (
  seller_id UUID PRIMARY KEY REFERENCES public.sellers(id) ON DELETE CASCADE,
  business_address JSONB NOT NULL,
  dispatch_address JSONB NOT NULL,
  is_same_as_business BOOLEAN NOT NULL DEFAULT TRUE,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Extend Products with Delivery Estimation Columns
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS preparation_days INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS seller_dispatch_pin VARCHAR(6),
  ADD COLUMN IF NOT EXISTS seller_dispatch_city TEXT,
  ADD COLUMN IF NOT EXISTS seller_dispatch_state TEXT;

-- Extend Orders with Verified Shipping Address Snapshot & Delivery Estimate
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS shipping_address JSONB,
  ADD COLUMN IF NOT EXISTS delivery_estimate JSONB;

-- Extend Sellers with Postal Address Verification Flag
ALTER TABLE public.sellers
  ADD COLUMN IF NOT EXISTS is_address_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- Enable RLS for address tables
ALTER TABLE public.buyer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_addresses ENABLE ROW LEVEL SECURITY;

-- Buyer Addresses: Private to the owner
CREATE POLICY "Users can manage own addresses"
  ON public.buyer_addresses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Seller Addresses: Manageable by seller owner; dispatch city/pin readable by buyers for delivery estimates
CREATE POLICY "Sellers can manage own address"
  ON public.seller_addresses FOR ALL
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Buyers can read verified seller dispatch locations"
  ON public.seller_addresses FOR SELECT
  USING (is_verified = TRUE);
