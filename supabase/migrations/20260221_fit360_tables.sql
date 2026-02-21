-- FranchiseFit360 tables
-- Run this in Supabase SQL Editor or via supabase db push

CREATE TABLE IF NOT EXISTS fit360_response (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text,
  question text,
  selected_option text,
  trait text,
  dimension text,
  score integer,
  question_index integer,
  session_id text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fit360_profile (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text,
  session_id text,
  trait_scores jsonb,
  dimension_summary jsonb,
  top_traits text[],
  profile_strengths text[],
  completion_rate integer DEFAULT 100,
  total_questions integer,
  franchise_compatibility jsonb,
  created_at timestamptz DEFAULT now()
);

-- Indexes for common lookups
CREATE INDEX IF NOT EXISTS fit360_response_session ON fit360_response(session_id);
CREATE INDEX IF NOT EXISTS fit360_response_user ON fit360_response(user_id);
CREATE INDEX IF NOT EXISTS fit360_profile_email ON fit360_profile(email);
CREATE INDEX IF NOT EXISTS fit360_profile_user ON fit360_profile(user_id);
CREATE INDEX IF NOT EXISTS fit360_profile_session ON fit360_profile(session_id);

-- RLS
ALTER TABLE fit360_response ENABLE ROW LEVEL SECURITY;
ALTER TABLE fit360_profile ENABLE ROW LEVEL SECURITY;

-- Anyone (incl. anon) can insert — user_id may be null for unauthenticated users
CREATE POLICY "Anyone can insert fit360_response" ON fit360_response
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can read their own fit360_response" ON fit360_response
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert fit360_profile" ON fit360_profile
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can read their own fit360_profile" ON fit360_profile
  FOR SELECT USING (auth.uid() = user_id);
