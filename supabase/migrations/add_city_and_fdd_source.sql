-- Migration: Add city column to leads and fdd_request source
-- Purpose: Support FDD lead capture gating workflow

-- Ensure id column has a default UUID generator (dashboard-created table was missing this)
ALTER TABLE public.leads ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Add city column to leads table
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS city TEXT;

-- Add source column if missing from production schema
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS source TEXT;

-- Update source CHECK constraint to include 'fdd_request' + other values already in use
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_source_check;
ALTER TABLE public.leads ADD CONSTRAINT leads_source_check
  CHECK (source IN (
    'quiz', 'website', 'referral', 'advertising', 'social_media',
    'directory_inquiry', 'listing_request_info', 'contact_form',
    'franchise_your_business', 'fdd_request'
  ));

-- Ensure anonymous INSERT policy exists (other forms already insert client-side)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Anyone can create leads'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can create leads" ON public.leads FOR INSERT WITH CHECK (true)';
  END IF;
END $$;
