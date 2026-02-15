-- ============================================================
-- PATCH: Add missing columns to profiles table
-- Run this in Supabase Dashboard → SQL Editor AFTER the
-- base create_profile_trigger.sql has already been applied.
-- ============================================================

-- 1) Add missing columns (all safe to re-run; IF NOT EXISTS)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS advisor_slug text,
  ADD COLUMN IF NOT EXISTS advisor_title text,
  ADD COLUMN IF NOT EXISTS advisor_bio text,
  ADD COLUMN IF NOT EXISTS advisor_image_url text,
  ADD COLUMN IF NOT EXISTS advisor_calendar_url text,
  ADD COLUMN IF NOT EXISTS advisor_specialties text[],
  ADD COLUMN IF NOT EXISTS advisor_is_active boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS associated_franchise_id uuid;

-- 2) Role constraint — only allow our 5 defined values
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'advisor', 'franchisor', 'franchise_rep', 'user'));

-- 3) Backfill email for any existing rows that are missing it
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
  AND p.email IS NULL;

-- 4) Replace the trigger function to capture email, full_name, and role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    'user'
  )
  ON CONFLICT (id) DO UPDATE
    SET email    = EXCLUDED.email,
        full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name);
  RETURN NEW;
END;
$$;

-- 5) RLS policies — add admin read-all and insert policies
--    (the base migration only added select/update for own profile)

-- Allow any authenticated user to insert their own profile row
-- (needed when email confirmation is disabled and signup creates profile client-side)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
    AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON public.profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (id = auth.uid());
  END IF;
END $$;

-- Allow admins to read ALL profiles (needed for admin dashboard)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
    AND policyname = 'Admins can read all profiles'
  ) THEN
    CREATE POLICY "Admins can read all profiles"
      ON public.profiles
      FOR SELECT
      TO authenticated
      USING (
        auth.uid() = id  -- own profile
        OR EXISTS (
          SELECT 1 FROM public.profiles admin_check
          WHERE admin_check.id = auth.uid()
            AND admin_check.role = 'admin'
        )
      );
  END IF;
END $$;

-- Drop the narrow "read own profile" policy now that the above covers it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
    AND policyname = 'Users can read own profile'
  ) THEN
    DROP POLICY "Users can read own profile" ON public.profiles;
  END IF;
END $$;

-- Allow admins to update any profile (for role management)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
    AND policyname = 'Admins can update all profiles'
  ) THEN
    CREATE POLICY "Admins can update all profiles"
      ON public.profiles
      FOR UPDATE
      TO authenticated
      USING (
        auth.uid() = id
        OR EXISTS (
          SELECT 1 FROM public.profiles admin_check
          WHERE admin_check.id = auth.uid()
            AND admin_check.role = 'admin'
        )
      )
      WITH CHECK (
        auth.uid() = id
        OR EXISTS (
          SELECT 1 FROM public.profiles admin_check
          WHERE admin_check.id = auth.uid()
            AND admin_check.role = 'admin'
        )
      );
  END IF;
END $$;

-- ============================================================
-- To make yourself an admin, run:
--   UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
-- ============================================================
