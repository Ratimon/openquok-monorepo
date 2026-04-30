-- ---------------------------
-- MODULE NAME: post
-- MODULE DATE: 20260501
-- MODULE SCOPE: Indexes
-- ---------------------------

BEGIN;

CREATE INDEX IF NOT EXISTS idx_post_thread_replies_org_id ON public.post_thread_replies(organization_id);
CREATE INDEX IF NOT EXISTS idx_post_thread_replies_post_id ON public.post_thread_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_post_thread_replies_integration_id ON public.post_thread_replies(integration_id);
CREATE INDEX IF NOT EXISTS idx_post_thread_replies_state ON public.post_thread_replies(state);
CREATE INDEX IF NOT EXISTS idx_post_thread_replies_deleted_at ON public.post_thread_replies(deleted_at);
CREATE INDEX IF NOT EXISTS idx_post_thread_replies_created_at ON public.post_thread_replies(created_at);

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

