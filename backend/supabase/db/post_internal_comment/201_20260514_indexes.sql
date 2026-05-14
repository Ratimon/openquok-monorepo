-- ---------------------------
-- MODULE NAME: post_internal_comment
-- MODULE DATE: 20260514
-- MODULE SCOPE: Indexes
-- ---------------------------

BEGIN;

-- public.post_internal_comments (composer / preview comments)
CREATE INDEX IF NOT EXISTS idx_post_internal_comments_created_at ON public.post_internal_comments(created_at);
CREATE INDEX IF NOT EXISTS idx_post_internal_comments_organization_id ON public.post_internal_comments(organization_id);
CREATE INDEX IF NOT EXISTS idx_post_internal_comments_user_id ON public.post_internal_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_internal_comments_post_id ON public.post_internal_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_internal_comments_deleted_at ON public.post_internal_comments(deleted_at);

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;
