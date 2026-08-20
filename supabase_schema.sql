-- =========================================================
-- PARALIFE - Supabase Database Setup for Email Subscribers
-- =========================================================

-- 1. Create the subscribers table (if not exists)
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  status TEXT DEFAULT 'active' NOT NULL
);

-- 2. Create unique case-insensitive index on email
CREATE UNIQUE INDEX IF NOT EXISTS subscribers_email_idx ON public.subscribers (lower(email));

-- 3. Disable RLS or grant public permissions for subscriber collection
ALTER TABLE public.subscribers DISABLE ROW LEVEL SECURITY;
GRANT USAGE ON SCHEMA public TO anon, authenticated, public;
GRANT ALL ON TABLE public.subscribers TO anon, authenticated, public;

-- 4. Clean up any previous triggers
DROP TRIGGER IF EXISTS on_subscriber_created ON public.subscribers;
DROP FUNCTION IF EXISTS public.send_welcome_email();
