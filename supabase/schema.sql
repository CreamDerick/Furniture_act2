-- =====================================================================
-- 👑 SECURE FURNITURE E-COMMERCE DATABASE SCHEMA & SECURITY POLICIES
-- =====================================================================

-- --- 1. TABLES SETUP ---

-- Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    address TEXT,
    mobile_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Furniture Catalog Table (Soft Delete included)
CREATE TABLE IF NOT EXISTS public.furniture (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    image_url TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Sofas & Armchairs', 'Tables & Desks', 'Beds & Mattresses', 'Chairs & Stools')),
    description TEXT NOT NULL,
    is_hidden BOOLEAN NOT NULL DEFAULT FALSE, -- Soft Delete flag
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer Shopping Cart Table
CREATE TABLE IF NOT EXISTS public.cart (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    furniture_id UUID REFERENCES public.furniture(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_item UNIQUE(user_id, furniture_id)
);

-- System Administrative Activity Logs Table (Audit Trail)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES public.profiles(id) NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'SOFT_DELETE')),
    target_item_id UUID NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- --- 2. ROW LEVEL SECURITY (RLS) ACTIVATION ---
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.furniture ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;


-- --- 3. SECURITY POLICIES ---

-- 👤 Profiles Table Policies
CREATE POLICY "Allow public read access to profiles" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Allow users/admins to update their own profiles" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 🪑 Furniture Table Policies
CREATE POLICY "Allow anyone to read furniture items" 
ON public.furniture FOR SELECT 
USING (true);

CREATE POLICY "Allow only admins to insert furniture" 
ON public.furniture FOR INSERT 
TO authenticated 
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Allow only admins to update furniture" 
ON public.furniture FOR UPDATE 
TO authenticated 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Allow only admins to delete/hide furniture" 
ON public.furniture FOR DELETE 
TO authenticated 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 🛒 Cart Table Policies (Strict owner restriction)
CREATE POLICY "Users can view their own cart items" 
ON public.cart FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add items to their own cart" 
ON public.cart FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can edit quantities in their own cart" 
ON public.cart FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete items from their own cart" 
ON public.cart FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- 📋 System Activity Logs Policies (Restricted to admins only)
CREATE POLICY "Only admins can view system logs" 
ON public.activity_logs FOR SELECT 
TO authenticated 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Only admins can insert system logs" 
ON public.activity_logs FOR INSERT 
TO authenticated 
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);


-- --- 4. SIGNUP AUTOMATION: TRIGGER FOR PROFILES SEEDING ---

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, role, address, mobile_number)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(
      new.raw_user_meta_data->>'avatar_url', 
      'https://ui-avatars.com/api/?name=' || COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)) || '&background=8A2BE2&color=fff'
    ),
    -- Automatically assigns ADMIN role to admin@furniture.com, standard USER for all other signups
    CASE 
      WHEN new.email = 'admin@furniture.com' THEN 'admin'::text
      ELSE 'user'::text
    END,
    '',
    ''
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger connector
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- --- 5. PREMIUM DEFAULT DATA SEEDING (FURNITURE CATALOG) ---
INSERT INTO public.furniture (name, price, image_url, category, description, is_hidden)
VALUES 
  ('Royal Amethyst Armchair', 899.00, 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=600&q=80', 'Sofas & Armchairs', 'Upholstered in rich deep amethyst velvet and trimmed with premium brushed gold metal legs. Ergonomic seating designed to combine high-luxury style with absolute comfort.', false),
  ('Aurelia Marble Desk', 1299.00, 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80', 'Tables & Desks', 'A striking work desk featuring a premium black Calacatta marble slab inlaid with delicate golden veins. Set on an elegant obsidian geometric support architecture.', false),
  ('Sovereign Velvet Bedframe', 2499.00, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80', 'Beds & Mattresses', 'A grand master bedroom bedframe with an expansive tufted headboard, hand-stitched with amethyst purple threads and accentuated with custom brass borders.', false),
  ('Majestic Gold Accent Chair', 450.00, 'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?auto=format&fit=crop&w=600&q=80', 'Chairs & Stools', 'A modern sculptural chair crafted in solid chrome steel and electroplated with pure champagne gold. A high-contrast premium accent piece to elevate any contemporary interior.', false),
  ('Imperial Chesterfield Sofa', 3200.00, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80', 'Sofas & Armchairs', 'Classic Chesterfield design re-imagined with deep-buttoned premium amethyst leather. Wide scrolled armrests and solid dark mahogany bun feet with gold metal caps.', false),
  ('Luxor Glass Dining Table', 1500.00, 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=600&q=80', 'Tables & Desks', 'A dining experience built around a thick tempered glass tabletop, supported by a mesmerizing, interlocking double-ring base finished in luxurious antique gold.', false),
  ('Crown Rest Ortho Mattress', 950.00, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=600&q=80', 'Beds & Mattresses', 'Elite multi-layer memory foam mattress utilizing copper-infused cooling tech. Specifically engineered for targeted spine alignment and therapeutic body contour support.', false),
  ('Monarch Velvet Barstool', 280.00, 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=600&q=80', 'Chairs & Stools', 'Elevate your bar counter with this plush, purple-velvet counter-height stool, featuring a golden ring footrest and robust obsidian powder-coated iron chassis.', false);
