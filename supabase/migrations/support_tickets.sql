-- Support Tickets table
-- Stores internal support tickets submitted via admin dashboard
-- Designed to integrate with AI agent for auto-diagnosis and fixes

CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Ticket info
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'bug'
        CHECK (category IN ('bug', 'feature_request', 'content_issue', 'access_issue', 'performance', 'other')),
    priority TEXT NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status TEXT NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'in_progress', 'ai_diagnosing', 'ai_fixed', 'resolved', 'closed')),

    -- Context
    page_url TEXT,                          -- URL where the issue was found
    screenshot_url TEXT,                    -- optional screenshot
    submitted_by_email TEXT,                -- who submitted it
    submitted_by_name TEXT,

    -- AI Agent fields
    ai_diagnosis TEXT,                      -- AI's analysis of the issue
    ai_fix_summary TEXT,                    -- what the AI did to fix it
    ai_fix_branch TEXT,                     -- git branch name if AI created one
    ai_fix_pr_url TEXT,                     -- PR URL if AI created one
    ai_fix_status TEXT DEFAULT 'pending'
        CHECK (ai_fix_status IN ('pending', 'diagnosing', 'fixing', 'pr_created', 'deployed', 'failed', 'skipped')),
    ai_error TEXT,                          -- error message if AI fix failed
    ai_attempted_at TIMESTAMPTZ,            -- when AI last attempted a fix

    -- Admin fields
    admin_notes TEXT,
    assigned_to UUID REFERENCES public.profiles(id),
    resolved_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON public.support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON public.support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_support_tickets_ai_fix_status ON public.support_tickets(ai_fix_status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created ON public.support_tickets(created_at DESC);

-- RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage support tickets" ON public.support_tickets
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'home_office'))
    );

-- Updated_at trigger
CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
