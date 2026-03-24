-- ---------------------------
-- MODULE NAME: Feedback
-- MODULE DATE: 20260311
-- MODULE SCOPE: Indexes
-- ---------------------------

CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);
