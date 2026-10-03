-- ---------------------------
-- MODULE NAME: Link Directory
-- MODULE DATE: 20251001
-- MODULE SCOPE: Tables
-- ---------------------------

BEGIN;

CREATE TABLE IF NOT EXISTS public.link_directory_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    headline TEXT,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    openquok_channels_hub_path TEXT NOT NULL DEFAULT '/channels'
);

CREATE TABLE IF NOT EXISTS public.link_directory_tag_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.link_directory_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    headline TEXT,
    description TEXT
);

CREATE TABLE IF NOT EXISTS public.link_directory_tag_groups_tags_association (
    link_directory_tag_id UUID NOT NULL REFERENCES public.link_directory_tags(id) ON DELETE CASCADE,
    link_directory_tag_group_id UUID NOT NULL REFERENCES public.link_directory_tag_groups(id) ON DELETE CASCADE,
    PRIMARY KEY (link_directory_tag_id, link_directory_tag_group_id)
);

CREATE TABLE IF NOT EXISTS public.link_directory_opportunity_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.link_directory_sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    site_url TEXT NOT NULL,
    logo_url TEXT,
    short_description TEXT,
    long_description TEXT,
    domain_authority SMALLINT,
    domain_rating SMALLINT,
    monthly_visits BIGINT,
    metrics_source TEXT,
    metrics_updated_at TIMESTAMPTZ,
    category_id UUID REFERENCES public.link_directory_categories(id) ON DELETE SET NULL,
    is_openquok_auth_supported BOOLEAN NOT NULL DEFAULT false,
    openquok_channel_slug TEXT,
    is_admin_published BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    tag_slugs TEXT[],
    fts TSVECTOR GENERATED ALWAYS AS (
        to_tsvector(
            'english'::regconfig,
            COALESCE(title, ''::text) || ' ' ||
            COALESCE(slug, ''::text) || ' ' ||
            COALESCE(site_url, ''::text) || ' ' ||
            COALESCE(short_description, ''::text) || ' ' ||
            COALESCE(long_description, ''::text)
        )
    ) STORED
);

CREATE TABLE IF NOT EXISTS public.link_directory_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES public.link_directory_sites(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    opportunity_type_id UUID NOT NULL REFERENCES public.link_directory_opportunity_types(id) ON DELETE RESTRICT,
    effort TEXT NOT NULL DEFAULT 'medium'
        CHECK (effort IN ('easy', 'medium', 'hard')),
    approval_mode TEXT NOT NULL DEFAULT 'manual_review'
        CHECK (approval_mode IN ('instant', 'manual_review')),
    approval_time_hint TEXT,
    dofollow TEXT NOT NULL DEFAULT 'unknown'
        CHECK (dofollow IN ('dofollow', 'nofollow', 'unknown')),
    cost_tier TEXT NOT NULL DEFAULT 'free'
        CHECK (cost_tier IN ('free', 'freemium', 'paid')),
    cost_note TEXT,
    description TEXT,
    -- Ordered sub-steps for this opportunity (HowToStep). Playbook order across opportunities uses sort_order.
    steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    openquok_cta_kind TEXT NOT NULL DEFAULT 'none'
        CHECK (openquok_cta_kind IN (
            'none',
            'connect_channel',
            'schedule_post',
            'use_plug',
            'external_doc'
        )),
    openquok_channel_slug TEXT,
    openquok_plug_name TEXT,
    cta_href TEXT,
    cta_label TEXT,
    -- Lower runs first on site guide pages (step 1, step 2, …).
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_admin_published BOOLEAN NOT NULL DEFAULT false,
    UNIQUE (site_id, slug)
);

COMMENT ON COLUMN public.link_directory_opportunities.sort_order IS
    'Display order on the site guide: ascending playbook sequence (opportunity 1, then 2, …).';
COMMENT ON COLUMN public.link_directory_opportunities.steps IS
    'JSON array of {order, title, body} sub-steps for this opportunity (schema.org HowToStep).';

CREATE TABLE IF NOT EXISTS public.link_directory_site_tags_association (
    site_id UUID NOT NULL REFERENCES public.link_directory_sites(id) ON DELETE CASCADE,
    link_directory_tag_id UUID NOT NULL REFERENCES public.link_directory_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (site_id, link_directory_tag_id)
);

CREATE TABLE IF NOT EXISTS public.link_directory_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
    email TEXT NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    site_url TEXT NOT NULL,
    proposed_title TEXT,
    notes TEXT,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.link_directory_saved_sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES public.link_directory_sites(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    outreach_completed_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, site_id)
);

COMMENT ON TABLE public.link_directory_saved_sites IS
    'Per-user shortlist of link directory sites (Saved → Backlinks): private order and outreach progress.';
COMMENT ON COLUMN public.link_directory_saved_sites.outreach_completed_at IS
    'When the signed-in user marked personal outreach on this site as done; null means not completed.';

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;
