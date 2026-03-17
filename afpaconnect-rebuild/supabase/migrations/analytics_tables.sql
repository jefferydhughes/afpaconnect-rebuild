-- ============================================================
-- Analytics tables for the Franchisor Analytics Dashboard
-- ============================================================

-- Platform OAuth connections (one row per platform per franchisor)
CREATE TABLE IF NOT EXISTS public.platform_connections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  franchise_id text,
  platform text NOT NULL,
  status text NOT NULL DEFAULT 'disconnected'
    CHECK (status IN ('connected', 'disconnected', 'error', 'expired')),
  account_name text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  sync_frequency text DEFAULT 'daily',
  last_sync_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Google My Business daily metrics
CREATE TABLE IF NOT EXISTS public.gmb_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id uuid REFERENCES public.platform_connections(id) ON DELETE CASCADE,
  date date NOT NULL,
  views_maps integer DEFAULT 0,
  views_search integer DEFAULT 0,
  actions_phone integer DEFAULT 0,
  actions_driving_directions integer DEFAULT 0,
  actions_website integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(connection_id, date)
);

-- Ad campaign metrics (Meta, Google Ads, LinkedIn)
CREATE TABLE IF NOT EXISTS public.ad_campaign_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id uuid REFERENCES public.platform_connections(id) ON DELETE CASCADE,
  date date NOT NULL,
  campaign_name text,
  spend numeric DEFAULT 0,
  leads integer DEFAULT 0,
  clicks integer DEFAULT 0,
  impressions integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Google Analytics website traffic metrics
CREATE TABLE IF NOT EXISTS public.website_traffic_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id uuid REFERENCES public.platform_connections(id) ON DELETE CASCADE,
  date date NOT NULL,
  sessions integer DEFAULT 0,
  users integer DEFAULT 0,
  page_views integer DEFAULT 0,
  bounce_rate numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(connection_id, date)
);

-- RLS: platform_connections
ALTER TABLE public.platform_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own connections"
  ON public.platform_connections
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS: metric tables (read through connection ownership)
ALTER TABLE public.gmb_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own GMB metrics"
  ON public.gmb_metrics FOR SELECT TO authenticated
  USING (connection_id IN (
    SELECT id FROM public.platform_connections WHERE user_id = auth.uid()
  ));

ALTER TABLE public.ad_campaign_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own ad metrics"
  ON public.ad_campaign_metrics FOR SELECT TO authenticated
  USING (connection_id IN (
    SELECT id FROM public.platform_connections WHERE user_id = auth.uid()
  ));

ALTER TABLE public.website_traffic_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own website metrics"
  ON public.website_traffic_metrics FOR SELECT TO authenticated
  USING (connection_id IN (
    SELECT id FROM public.platform_connections WHERE user_id = auth.uid()
  ));
