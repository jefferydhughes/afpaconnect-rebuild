-- Fix: associated_franchise_id was UUID but franchise table uses non-UUID text IDs.
-- Change the column type to TEXT so any franchise ID format can be stored.
ALTER TABLE public.profiles
  ALTER COLUMN associated_franchise_id TYPE TEXT;
