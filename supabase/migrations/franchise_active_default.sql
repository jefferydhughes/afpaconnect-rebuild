-- Set all existing franchises to active and make true the column default.
-- The franchise table had no explicit default (or defaulted to false on import).

ALTER TABLE public.franchise
  ALTER COLUMN is_active SET DEFAULT true;

UPDATE public.franchise
  SET is_active = true
  WHERE is_active IS NULL OR is_active = false;
