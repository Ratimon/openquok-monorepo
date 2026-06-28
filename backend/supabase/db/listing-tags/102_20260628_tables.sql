-- ---------------------------
-- MODULE NAME: Listing Tags
-- MODULE DATE: 20260628
-- MODULE SCOPE: Tables
-- ---------------------------

BEGIN;

CREATE TABLE IF NOT EXISTS public.listing_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    headline TEXT,
    description TEXT,
    image_url_hero TEXT,
    image_url_small TEXT,
    href TEXT,
    color TEXT,
    emoji TEXT
);

CREATE TABLE IF NOT EXISTS public.listing_tag_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.listing_tag_groups_listing_tags_association (
    listing_tag_id UUID NOT NULL REFERENCES public.listing_tags(id) ON DELETE CASCADE,
    listing_tag_group_id UUID NOT NULL REFERENCES public.listing_tag_groups(id) ON DELETE CASCADE,
    PRIMARY KEY (listing_tag_id, listing_tag_group_id)
);

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;
