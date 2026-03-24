-- ---------------------------
-- MODULE NAME: Feedback
-- MODULE DATE: 20260311
-- MODULE SCOPE: Tables
-- ---------------------------

BEGIN;

CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feedback_type TEXT,
    url TEXT,
    description TEXT,
    email TEXT,
    is_handled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.feedback IS 'User feedback (propose, report, general). Anonymous submit; list/update by app roles.';

COMMIT;
