-- AFPAConnect Clean Schema
-- This migration creates a streamlined database structure
-- Run this on a fresh Supabase project or after backing up existing data

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'home_office', 'franchisor', 'advisor', 'user')),
    
    -- Advisor-specific fields (null for non-advisors)
    advisor_slug TEXT UNIQUE,
    advisor_title TEXT,
    advisor_bio TEXT,
    advisor_image_url TEXT,
    advisor_calendar_url TEXT,
    advisor_specialties TEXT[],
    advisor_is_active BOOLEAN DEFAULT false,
    
    -- Franchisor-specific fields (null for non-franchisors)
    associated_franchise_id UUID,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Franchises (the core listing data)
CREATE TABLE IF NOT EXISTS public.franchises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic info
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    description TEXT,
    full_description TEXT,
    logo_url TEXT,
    website_url TEXT,
    
    -- Investment details
    initial_investment_min NUMERIC,
    initial_investment_max NUMERIC,
    franchise_fee NUMERIC,
    royalty_fee_percentage NUMERIC,
    marketing_fee_percentage NUMERIC,
    liquid_capital_required NUMERIC,
    net_worth_required NUMERIC,
    
    -- Business characteristics
    business_model TEXT CHECK (business_model IN ('storefront', 'mobile', 'home_based', 'kiosk', 'online')),
    time_commitment TEXT CHECK (time_commitment IN ('full_time', 'part_time', 'passive')),
    experience_required BOOLEAN DEFAULT false,
    training_duration_weeks INTEGER,
    support_level TEXT CHECK (support_level IN ('basic', 'standard', 'premium')),
    
    -- Location data
    territories_available TEXT[],
    total_locations INTEGER,
    usa_locations INTEGER,
    canadian_locations INTEGER,
    established_year INTEGER,
    
    -- Matching criteria (used by AI)
    personality_fit TEXT[],
    ideal_goals TEXT[],
    required_skills TEXT[],
    disc_traits JSONB,
    
    -- Ratings & metrics
    franchisee_satisfaction_score NUMERIC,
    growth_potential TEXT CHECK (growth_potential IN ('stable_mature', 'high_growth', 'emerging_brand', 'market_leader')),
    
    -- FDD (Franchise Disclosure Document) data
    fdd_url TEXT,
    fdd_summary TEXT,
    
    -- Status flags
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    broker_email TEXT,
    
    -- Vector embedding for AI matching
    embedding vector(1536),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quiz Results
CREATE TABLE IF NOT EXISTS public.quiz_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Contact info
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    
    -- Quiz answers
    budget_range TEXT CHECK (budget_range IN ('under_50k', '50k_100k', '100k_250k', '250k_500k', 'over_500k')),
    preferred_categories TEXT[],
    business_model_preference TEXT CHECK (business_model_preference IN ('storefront', 'mobile', 'home_based', 'kiosk', 'online')),
    time_commitment TEXT CHECK (time_commitment IN ('full_time', 'part_time', 'passive')),
    experience_level TEXT CHECK (experience_level IN ('none', 'some', 'extensive')),
    preferred_territories TEXT[],
    goals TEXT[],
    
    -- AI-generated results
    ai_profile_summary TEXT,
    matched_franchises UUID[],
    match_scores JSONB, -- { franchise_id: { score: 85, reasons: [...] } }
    
    -- Attribution
    attributed_advisor_id UUID REFERENCES public.profiles(id),
    source TEXT DEFAULT 'website',
    utm_params JSONB,
    
    -- Status
    quiz_completed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Leads (converted from quiz results or other sources)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Contact info
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    state TEXT,
    
    -- Source tracking
    source TEXT CHECK (source IN ('quiz', 'website', 'referral', 'advertising', 'social_media', 'directory_inquiry')) NOT NULL,
    quiz_result_id UUID REFERENCES public.quiz_results(id),
    
    -- Lead management
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'nurturing', 'converted', 'unqualified')),
    interested_franchises UUID[],
    budget_range TEXT,
    notes TEXT,
    
    -- Follow-up tracking
    last_contacted_at TIMESTAMPTZ,
    next_follow_up_at TIMESTAMPTZ,
    
    -- Attribution
    attributed_advisor_id UUID REFERENCES public.profiles(id),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Info Requests (when users request info about franchises)
CREATE TABLE IF NOT EXISTS public.info_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Contact info
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    message TEXT,
    
    -- Request details
    franchise_ids UUID[] NOT NULL,
    
    -- Attribution
    attributed_advisor_id UUID REFERENCES public.profiles(id),
    quiz_result_id UUID REFERENCES public.quiz_results(id),
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'processed')),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Franchise Applications
CREATE TABLE IF NOT EXISTS public.franchise_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Applicant info
    applicant_email TEXT NOT NULL,
    franchise_id UUID NOT NULL REFERENCES public.franchises(id),
    quiz_result_id UUID REFERENCES public.quiz_results(id),
    
    -- Application data (flexible JSONB for form fields)
    personal_info JSONB,
    financial_info JSONB,
    business_experience JSONB,
    
    -- Status tracking
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'interview_scheduled')),
    submitted_at TIMESTAMPTZ,
    
    -- Notes
    franchisor_notes TEXT,
    
    -- Attribution
    attributed_advisor_id UUID REFERENCES public.profiles(id),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Blog Posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    
    category TEXT CHECK (category IN ('getting_started', 'financing', 'legal', 'success_stories', 'industry_insights', 'tips_advice')),
    tags TEXT[],
    featured_image_url TEXT,
    
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    
    author_id UUID REFERENCES public.profiles(id),
    
    -- SEO
    seo_title TEXT,
    seo_description TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fit360 Assessments (the 60+ question psychometric assessment)
CREATE TABLE IF NOT EXISTS public.fit360_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    email TEXT NOT NULL,
    session_id TEXT,
    
    -- Responses stored as JSONB array
    responses JSONB NOT NULL DEFAULT '[]',
    
    -- Computed results
    trait_scores JSONB,
    dimension_summary JSONB,
    top_traits TEXT[],
    profile_strengths TEXT[],
    franchise_compatibility JSONB,
    
    -- Completion tracking
    total_questions INTEGER,
    completion_rate NUMERIC,
    completed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Analytics Events (for tracking)
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    event_name TEXT NOT NULL,
    properties JSONB,
    
    user_id UUID REFERENCES public.profiles(id),
    session_id TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Franchises
CREATE INDEX IF NOT EXISTS idx_franchises_category ON public.franchises(category);
CREATE INDEX IF NOT EXISTS idx_franchises_slug ON public.franchises(slug);
CREATE INDEX IF NOT EXISTS idx_franchises_is_active ON public.franchises(is_active);
CREATE INDEX IF NOT EXISTS idx_franchises_is_featured ON public.franchises(is_featured);
CREATE INDEX IF NOT EXISTS idx_franchises_investment ON public.franchises(initial_investment_min, initial_investment_max);

-- Quiz Results
CREATE INDEX IF NOT EXISTS idx_quiz_results_email ON public.quiz_results(email);
CREATE INDEX IF NOT EXISTS idx_quiz_results_advisor ON public.quiz_results(attributed_advisor_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_created ON public.quiz_results(created_at DESC);

-- Leads
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_advisor ON public.leads(attributed_advisor_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_advisor_slug ON public.profiles(advisor_slug);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.franchises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.info_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.franchise_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fit360_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Public can view advisor profiles" ON public.profiles
    FOR SELECT USING (role = 'advisor' AND advisor_is_active = true);

-- Franchises policies (public read, admin write)
CREATE POLICY "Anyone can view active franchises" ON public.franchises
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage franchises" ON public.franchises
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'home_office'))
    );

CREATE POLICY "Franchisors can update their own franchise" ON public.franchises
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'franchisor' 
            AND associated_franchise_id = franchises.id
        )
    );

-- Quiz Results policies
CREATE POLICY "Anyone can create quiz results" ON public.quiz_results
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own quiz results" ON public.quiz_results
    FOR SELECT USING (email = (SELECT email FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Advisors can view their attributed quiz results" ON public.quiz_results
    FOR SELECT USING (
        attributed_advisor_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'home_office'))
    );

-- Leads policies
CREATE POLICY "Advisors can view their leads" ON public.leads
    FOR SELECT USING (
        attributed_advisor_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'home_office'))
    );

CREATE POLICY "Advisors can update their leads" ON public.leads
    FOR UPDATE USING (
        attributed_advisor_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'home_office'))
    );

-- Info Requests policies
CREATE POLICY "Anyone can create info requests" ON public.info_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all info requests" ON public.info_requests
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'home_office'))
    );

-- Blog Posts policies
CREATE POLICY "Anyone can view published blog posts" ON public.blog_posts
    FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage blog posts" ON public.blog_posts
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'home_office'))
    );

-- Fit360 Assessments policies
CREATE POLICY "Anyone can create assessments" ON public.fit360_assessments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own assessments" ON public.fit360_assessments
    FOR SELECT USING (email = (SELECT email FROM public.profiles WHERE id = auth.uid()));

-- Analytics policies
CREATE POLICY "Anyone can create analytics events" ON public.analytics_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view analytics" ON public.analytics_events
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'home_office'))
    );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_franchises_updated_at BEFORE UPDATE ON public.franchises
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quiz_results_updated_at BEFORE UPDATE ON public.quiz_results
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_franchise_applications_updated_at BEFORE UPDATE ON public.franchise_applications
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fit360_assessments_updated_at BEFORE UPDATE ON public.fit360_assessments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- VECTOR SIMILARITY SEARCH FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION match_franchises(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.5,
    match_count int DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    category TEXT,
    description TEXT,
    logo_url TEXT,
    initial_investment_min NUMERIC,
    initial_investment_max NUMERIC,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        f.id,
        f.name,
        f.slug,
        f.category,
        f.description,
        f.logo_url,
        f.initial_investment_min,
        f.initial_investment_max,
        1 - (f.embedding <=> query_embedding) AS similarity
    FROM public.franchises f
    WHERE 
        f.is_active = true
        AND f.embedding IS NOT NULL
        AND 1 - (f.embedding <=> query_embedding) > match_threshold
    ORDER BY f.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
