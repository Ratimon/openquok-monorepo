-- ---------------------------
-- MODULE NAME: Link Directory
-- MODULE DATE: 20261005
-- MODULE SCOPE: Tables
-- ---------------------------

BEGIN;

ALTER TABLE public.link_directory_sites
    ADD COLUMN IF NOT EXISTS likes INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS views INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS bookmark_count INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS average_rating DOUBLE PRECISION NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS ratings_count INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.link_directory_site_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES public.link_directory_sites(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, site_id)
);

CREATE TABLE IF NOT EXISTS public.link_directory_site_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES public.link_directory_sites(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES public.link_directory_site_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_approved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;
