-- ---------------------------
-- MODULE NAME: post
-- MODULE DATE: 20260413
-- MODULE SCOPE: Tables
-- ---------------------------

BEGIN;

CREATE TYPE public.post_state AS ENUM ('QUEUE', 'PUBLISHED', 'ERROR', 'DRAFT');

CREATE TABLE IF NOT EXISTS public.post_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#6366f1',
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_post_tags_org_name UNIQUE (org_id, name)
);

COMMENT ON TABLE public.post_tags IS 'Workspace labels for posts (Tags model shape).';

CREATE TABLE IF NOT EXISTS public.posts (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
    state public.post_state NOT NULL DEFAULT 'DRAFT',
    publish_date TIMESTAMPTZ NOT NULL,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE,
    content TEXT NOT NULL DEFAULT '',
    delay INT NOT NULL DEFAULT 0,
    post_group TEXT NOT NULL,
    title TEXT,
    description TEXT,
    parent_post_id TEXT REFERENCES public.posts(id) ON DELETE SET NULL,
    release_id TEXT,
    release_url TEXT,
    settings TEXT,
    image TEXT,
    interval_in_days INT,
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.posts IS 'One row per target integration; use post_group to tie a composer session (Post model shape).';
COMMENT ON COLUMN public.posts.post_group IS 'Same value for all rows created in one compose action (maps Post.group).';
COMMENT ON COLUMN public.posts.settings IS 'JSON string; may include isGlobal and other provider options (maps Post.settings).';
COMMENT ON COLUMN public.posts.interval_in_days IS 'Repeat cadence in days when applicable (maps Post.intervalInDays).';
COMMENT ON COLUMN public.posts.created_by_user_id IS 'Optional audit field; not in reference Post model.';

CREATE TABLE IF NOT EXISTS public.posts_tags (
    post_id TEXT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.post_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (post_id, tag_id)
);

COMMENT ON TABLE public.posts_tags IS 'Join between posts and post_tags (TagsPosts model shape).';

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;
