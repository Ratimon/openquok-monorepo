-- ---------------------------
-- MODULE NAME: post
-- MODULE DATE: 20260501
-- MODULE SCOPE: Tables
-- ---------------------------
-- Thread replies / follow-up comments for social posts (scheduled publishing entities).

BEGIN;

CREATE TABLE IF NOT EXISTS public.post_thread_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    post_id TEXT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    delay_seconds INT NOT NULL DEFAULT 0,
    state public.post_state NOT NULL DEFAULT 'QUEUE',
    release_id TEXT,
    release_url TEXT,
    error TEXT,
    created_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE public.post_thread_replies IS 'Follow-up thread replies for scheduled social posts; published after the main post. Distinct from public.comments which are composer/preview comments.';
COMMENT ON COLUMN public.post_thread_replies.delay_seconds IS 'Delay (seconds) before posting this reply after the previous item.';
COMMENT ON COLUMN public.post_thread_replies.state IS 'Publish state for this reply row (QUEUE/PUBLISHED/ERROR).';

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

