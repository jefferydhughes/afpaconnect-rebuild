-- One-time backfill for legacy quiz rows missing quiz_id.
-- Safe to run multiple times.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'quiz_result'
      AND column_name = 'quiz_id'
  ) THEN
    UPDATE public.quiz_result
    SET quiz_id = 'quiz_' || REPLACE(id::text, '-', '')
    WHERE quiz_id IS NULL OR BTRIM(quiz_id) = '';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'quiz_results'
      AND column_name = 'quiz_id'
  ) THEN
    UPDATE public.quiz_results
    SET quiz_id = 'quiz_' || REPLACE(id::text, '-', '')
    WHERE quiz_id IS NULL OR BTRIM(quiz_id) = '';
  END IF;
END $$;
