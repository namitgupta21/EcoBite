-- ==============================================================================
-- Schema Migration: Users Table for Autonomous Kitchen System
-- Supports customer sign-up, customer login, and manager authentication
-- Passwords are cryptographically salted and hashed using scrypt (salt:hash)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Fast lookup indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Seed default initial manager and sample customer with scrypt salted+hashed passwords
-- manager123 -> salt:hash
-- customer123 -> salt:hash
-- staff123 -> salt:hash
INSERT INTO public.users (name, email, username, password, role)
VALUES 
  (
    'Franchise Store Manager',
    'manager@kitchen.local',
    'manager',
    '171dc8485aa80a359d9feaf7136556bc:e7b3632ead8022133b79317362f259d5ceeba75a71d4065f2df780b33a11f6c3e13612c7bf59ae1a106db38bc60926653cc6e69cb7e96e6c26979209b0cb33a2',
    'manager'
  ),
  (
    'Alex Rivera',
    'alex@example.com',
    'customer',
    '6b7b015b973ba49199d0db8c7bbe7643:01ba83b57666fec3d72707d30e287b921bb3dbf57b8c1ab52796c27fee73894d05ee5b3b4d012f2207d8b19fe044dfca9fa2c1d1f6d63a78afc6647a1ba2319a',
    'customer'
  ),
  (
    'Kitchen Shift Lead',
    'staff@kitchen.local',
    'staff',
    '480409ad4e29ca0432abbc3a7d7629e5:9f297c1edac63282bab60de2875107e769af96649c80191dc02f626c84cc18117334890ec77ffba578165f360ca84ee39160d3f4ee7f7fe60982127ed703f313',
    'manager'
  )
ON CONFLICT (username) DO NOTHING;
