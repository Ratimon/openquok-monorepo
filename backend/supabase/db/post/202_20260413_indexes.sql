-- ---------------------------
-- MODULE NAME: post
-- MODULE DATE: 20260413
-- MODULE SCOPE: Indexes
-- ---------------------------
-- Mirrors common Post / Tags index patterns (group, publish window, org, state).

BEGIN;

CREATE INDEX IF NOT EXISTS idx_post_tags_org_id ON public.post_tags(org_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_deleted_at ON public.post_tags(deleted_at);

CREATE INDEX IF NOT EXISTS idx_posts_post_group ON public.posts(post_group);
CREATE INDEX IF NOT EXISTS idx_posts_organization_id ON public.posts(organization_id);
CREATE INDEX IF NOT EXISTS idx_posts_publish_date ON public.posts(publish_date);
CREATE INDEX IF NOT EXISTS idx_posts_state ON public.posts(state);
CREATE INDEX IF NOT EXISTS idx_posts_deleted_at ON public.posts(deleted_at);
CREATE INDEX IF NOT EXISTS idx_posts_integration_id ON public.posts(integration_id);
CREATE INDEX IF NOT EXISTS idx_posts_parent_post_id ON public.posts(parent_post_id);
CREATE INDEX IF NOT EXISTS idx_posts_org_publish ON public.posts(organization_id, publish_date);
CREATE INDEX IF NOT EXISTS idx_posts_org_state ON public.posts(organization_id, state);

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;
