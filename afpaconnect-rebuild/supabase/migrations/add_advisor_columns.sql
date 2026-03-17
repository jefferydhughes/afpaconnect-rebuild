-- Add missing advisor profile columns to profiles table
-- These columns support the full advisor profile from the old app

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS advisor_video_url text,
  ADD COLUMN IF NOT EXISTS advisor_blog_url text,
  ADD COLUMN IF NOT EXISTS advisor_linkedin text,
  ADD COLUMN IF NOT EXISTS advisor_personal_quote text,
  ADD COLUMN IF NOT EXISTS advisor_testimonials jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS advisor_credentials text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS advisor_years_experience integer,
  ADD COLUMN IF NOT EXISTS advisor_city text,
  ADD COLUMN IF NOT EXISTS advisor_state text,
  ADD COLUMN IF NOT EXISTS advisor_display_order integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS advisor_calendar_embed_code text;

-- Unique constraint on advisor_slug for public profile URLs
ALTER TABLE profiles
  ADD CONSTRAINT profiles_advisor_slug_unique UNIQUE (advisor_slug);

-- Advisor applications table (for become-advisor form submissions)
CREATE TABLE IF NOT EXISTS advisor_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  license_number text,
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- RLS for advisor_applications
ALTER TABLE advisor_applications ENABLE ROW LEVEL SECURITY;

-- Admins can read all applications
CREATE POLICY "Admins can read all applications"
  ON advisor_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can update applications (approve/reject)
CREATE POLICY "Admins can update applications"
  ON advisor_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Anyone can insert an application (public form)
CREATE POLICY "Anyone can submit an application"
  ON advisor_applications FOR INSERT
  WITH CHECK (true);
