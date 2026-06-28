-- ---------------------------
-- MODULE NAME: Listing Tags
-- MODULE DATE: 20260628
-- MODULE SCOPE: Functions
-- ---------------------------

BEGIN;

CREATE OR REPLACE FUNCTION public.get_active_listing_tags()
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    listing_tag_groups JSONB
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        t.id,
        t.name,
        t.slug,
        COALESCE(
            jsonb_agg(
                DISTINCT jsonb_build_object('id', tg.id, 'name', tg.name)
            ) FILTER (WHERE tg.id IS NOT NULL),
            '[]'::jsonb
        ) AS listing_tag_groups
    FROM public.listing_tags t
    INNER JOIN public.listings_listing_tags_association lt ON t.id = lt.listing_tag_id
    INNER JOIN public.listings l ON lt.listing_id = l.id
        AND l.is_user_published = true
        AND l.is_admin_published = true
    LEFT JOIN public.listing_tag_groups_listing_tags_association tgta ON t.id = tgta.listing_tag_id
    LEFT JOIN public.listing_tag_groups tg ON tgta.listing_tag_group_id = tg.id
    GROUP BY t.id, t.name, t.slug;
$$;

CREATE OR REPLACE FUNCTION public.get_full_active_listing_tags()
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    headline TEXT,
    description TEXT,
    image_url_hero TEXT,
    image_url_small TEXT,
    href TEXT,
    color TEXT,
    emoji TEXT,
    listing_tag_groups JSONB
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        t.id,
        t.name,
        t.slug,
        t.headline,
        t.description,
        t.image_url_hero,
        t.image_url_small,
        t.href,
        t.color,
        t.emoji,
        COALESCE(
            jsonb_agg(
                DISTINCT jsonb_build_object('id', tg.id, 'name', tg.name)
            ) FILTER (WHERE tg.id IS NOT NULL),
            '[]'::jsonb
        ) AS listing_tag_groups
    FROM public.listing_tags t
    INNER JOIN public.listings_listing_tags_association lt ON t.id = lt.listing_tag_id
    INNER JOIN public.listings l ON lt.listing_id = l.id
        AND l.is_user_published = true
        AND l.is_admin_published = true
    LEFT JOIN public.listing_tag_groups_listing_tags_association tgta ON t.id = tgta.listing_tag_id
    LEFT JOIN public.listing_tag_groups tg ON tgta.listing_tag_group_id = tg.id
    GROUP BY
        t.id, t.name, t.slug, t.headline, t.description,
        t.image_url_hero, t.image_url_small, t.href, t.color, t.emoji;
$$;

GRANT EXECUTE ON FUNCTION public.get_active_listing_tags() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_full_active_listing_tags() TO anon, authenticated, service_role;

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;
