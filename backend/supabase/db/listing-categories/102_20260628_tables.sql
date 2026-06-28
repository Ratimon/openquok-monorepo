-- ---------------------------
-- MODULE NAME: Listing Categories
-- MODULE DATE: 20260628
-- MODULE SCOPE: Tables
-- ---------------------------

BEGIN;

CREATE TABLE IF NOT EXISTS public.listing_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    parent_id UUID REFERENCES public.listing_categories(id) ON DELETE SET NULL,
    parent_path TEXT NOT NULL DEFAULT '/',
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

CREATE TABLE IF NOT EXISTS public.listing_category_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.listing_category_groups_listing_categories_association (
    listing_category_id UUID NOT NULL REFERENCES public.listing_categories(id) ON DELETE CASCADE,
    listing_category_group_id UUID NOT NULL REFERENCES public.listing_category_groups(id) ON DELETE CASCADE,
    PRIMARY KEY (listing_category_id, listing_category_group_id)
);

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;
