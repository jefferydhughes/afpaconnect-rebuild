-- Location Pages: programmatic SEO landing pages (brand × city)
-- Each record drives a public page at /franchises/{brand_slug}/{city_slug}

CREATE TABLE IF NOT EXISTS public.location_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Brand / city identity
    brand       TEXT NOT NULL,
    brand_slug  TEXT NOT NULL,
    city        TEXT NOT NULL,
    city_slug   TEXT NOT NULL,
    province    TEXT,
    country     TEXT NOT NULL DEFAULT 'USA',

    -- Compound slug used as the canonical URL key
    slug        TEXT NOT NULL UNIQUE, -- {brand_slug}-{city_slug}

    -- Publishing status (e.g. 'available', 'draft', 'archived')
    status      TEXT NOT NULL DEFAULT 'available',

    -- SEO meta
    meta_title       TEXT,
    meta_description TEXT,

    -- Market data
    population   INTEGER,
    market_size  TEXT, -- 'Small' | 'Medium' | 'Large'

    -- AI-enriched content
    ai_generated_content TEXT,
    unique_selling_points TEXT[],
    local_info           JSONB, -- { demographics, economy, households, median_income, kids_per_household, key_industries }

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for the public page lookups
CREATE INDEX IF NOT EXISTS idx_location_pages_brand_slug ON public.location_pages (brand_slug);
CREATE INDEX IF NOT EXISTS idx_location_pages_city_slug  ON public.location_pages (city_slug);
CREATE INDEX IF NOT EXISTS idx_location_pages_slug       ON public.location_pages (slug);
CREATE INDEX IF NOT EXISTS idx_location_pages_status     ON public.location_pages (status);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_location_pages_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_location_pages_updated_at ON public.location_pages;
CREATE TRIGGER trg_location_pages_updated_at
    BEFORE UPDATE ON public.location_pages
    FOR EACH ROW EXECUTE FUNCTION update_location_pages_updated_at();

-- RLS: public can read 'available' pages; only service-role key (admin) can write
ALTER TABLE public.location_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "location_pages_public_read"
    ON public.location_pages FOR SELECT
    USING (status = 'available');
