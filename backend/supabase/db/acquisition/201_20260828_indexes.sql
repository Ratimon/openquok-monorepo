-- ---------------------------
-- MODULE NAME: Acquisition
-- MODULE DATE: 20260828
-- MODULE SCOPE: Indexes
-- ---------------------------

CREATE INDEX IF NOT EXISTS idx_user_acquisition_responses_created_at
    ON public.user_acquisition_responses(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_acquisition_responses_source
    ON public.user_acquisition_responses(source);
