-- ---------------------------
-- MODULE NAME: post_internal_comment
-- MODULE DATE: 20260514
-- MODULE SCOPE: Tables
-- ---------------------------
-- Composer / preview comments on scheduled posts (internal discussion).

BEGIN;

-- FKs: organizations — db/organization; users — db/user-management; posts — db/post. Distinct from blog_comments.
CREATE TABLE IF NOT EXISTS public.post_internal_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    post_id TEXT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE public.post_internal_comments IS 'Internal composer/preview comments on posts. Indexes in db/post_internal_comment/201_20260514_indexes.sql; RLS in db/post_internal_comment/301_20260514_rlsgrants.sql.';

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;
