-- ---------------------------
-- MODULE NAME: comment
-- MODULE DATE: 20260413
-- MODULE SCOPE: Tables
-- ---------------------------
-- Composer / preview comments on scheduled posts (internal discussion).

BEGIN;

-- FKs: organizations — db/organization; users — db/user-management; posts — db/post. Distinct from blog_comments.
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    post_id TEXT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE public.comments IS 'Comments on composer posts (internal discussion). Indexes in db/comment/201_20260413_indexes.sql; RLS in db/comment/301_20260413_rlsgrants.sql.';

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

