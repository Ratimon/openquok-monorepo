-- ---------------------------
-- MODULE NAME: comment
-- MODULE DATE: 20260413
-- MODULE SCOPE: Indexes
-- ---------------------------

BEGIN;

-- public.comments (composer / preview comments)
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_organization_id ON public.comments(organization_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_deleted_at ON public.comments(deleted_at);

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

