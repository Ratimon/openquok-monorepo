-- ---------------------------
-- MODULE NAME: Listings
-- MODULE DATE: 20260628
-- MODULE SCOPE: Tables
-- ---------------------------

BEGIN;

CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    published_at TIMESTAMPTZ,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    excerpt TEXT,
    content TEXT,
    listing_kind TEXT NOT NULL DEFAULT 'extension'
        CHECK (listing_kind IN ('extension', 'stack')),
    extension_type TEXT
        CHECK (extension_type IS NULL OR extension_type IN ('skills', 'mcp', 'both')),
    install_command_skills TEXT,
    install_command_mcp TEXT,
    is_official BOOLEAN NOT NULL DEFAULT false,
    source_repo_url TEXT,
    cloned_from_listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
    likes INTEGER NOT NULL DEFAULT 0,
    views INTEGER NOT NULL DEFAULT 0,
    clicks INTEGER NOT NULL DEFAULT 0,
    bookmark_count INTEGER NOT NULL DEFAULT 0,
    average_rating DOUBLE PRECISION NOT NULL DEFAULT 0,
    ratings_count INTEGER NOT NULL DEFAULT 0,
    is_user_published BOOLEAN NOT NULL DEFAULT false,
    is_admin_published BOOLEAN NOT NULL DEFAULT false,
    schema_type TEXT,
    schema_json JSONB,
    listing_category_id UUID REFERENCES public.listing_categories(id) ON DELETE SET NULL,
    default_image_url TEXT,
    listing_image_urls TEXT[],
    logo_image_url TEXT,
    faq JSONB,
    listing_tag_slugs TEXT[],
    fts TSVECTOR GENERATED ALWAYS AS (
        to_tsvector(
            'english'::regconfig,
            COALESCE(title, ''::text) || ' ' ||
            COALESCE(description, ''::text) || ' ' ||
            COALESCE(excerpt, ''::text) || ' ' ||
            COALESCE(content, ''::text)
        )
    ) STORED
);

CREATE TABLE IF NOT EXISTS public.listings_listing_tags_association (
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    listing_tag_id UUID NOT NULL REFERENCES public.listing_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (listing_id, listing_tag_id)
);

CREATE TABLE IF NOT EXISTS public.listing_stack_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stack_listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    member_listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    member_role TEXT NOT NULL CHECK (member_role IN ('skills', 'mcp')),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (stack_listing_id, member_listing_id)
);

CREATE TABLE IF NOT EXISTS public.listing_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    related_listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    relation_type TEXT NOT NULL DEFAULT 'related',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (listing_id, related_listing_id, relation_type)
);

CREATE TABLE IF NOT EXISTS public.listing_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (user_id, listing_id)
);

CREATE TABLE IF NOT EXISTS public.listing_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (user_id, listing_id)
);

CREATE TABLE IF NOT EXISTS public.listing_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES public.listing_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_approved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.listing_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('view', 'like', 'bookmark', 'rating', 'comment', 'click')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;
