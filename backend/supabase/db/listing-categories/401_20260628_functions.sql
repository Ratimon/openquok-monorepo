-- ---------------------------
-- MODULE NAME: Listing Categories
-- MODULE DATE: 20260628
-- MODULE SCOPE: Functions
-- ---------------------------

BEGIN;

CREATE OR REPLACE FUNCTION public.get_active_listing_categories()
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    parent_path TEXT,
    listing_category_groups JSONB
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT DISTINCT
        c.id,
        c.name,
        c.slug,
        c.parent_path,
        COALESCE(
            jsonb_agg(
                DISTINCT jsonb_build_object('id', cg.id, 'name', cg.name)
            ) FILTER (WHERE cg.id IS NOT NULL),
            '[]'::jsonb
        ) AS listing_category_groups
    FROM public.listing_categories c
    INNER JOIN public.listings l ON c.id = l.listing_category_id
        AND l.is_user_published = true
        AND l.is_admin_published = true
    LEFT JOIN public.listing_category_groups_listing_categories_association cgca ON c.id = cgca.listing_category_id
    LEFT JOIN public.listing_category_groups cg ON cgca.listing_category_group_id = cg.id
    GROUP BY c.id, c.name, c.slug, c.parent_path;
$$;

CREATE OR REPLACE FUNCTION public.get_full_active_listing_categories()
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
    listing_category_groups JSONB
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        c.id,
        c.name,
        c.slug,
        c.headline,
        c.description,
        c.image_url_hero,
        c.image_url_small,
        c.href,
        c.color,
        c.emoji,
        COALESCE(
            jsonb_agg(
                DISTINCT jsonb_build_object('id', cg.id, 'name', cg.name)
            ) FILTER (WHERE cg.id IS NOT NULL),
            '[]'::jsonb
        ) AS listing_category_groups
    FROM public.listing_categories c
    INNER JOIN public.listings l ON c.id = l.listing_category_id
        AND l.is_user_published = true
        AND l.is_admin_published = true
    LEFT JOIN public.listing_category_groups_listing_categories_association cgca ON c.id = cgca.listing_category_id
    LEFT JOIN public.listing_category_groups cg ON cgca.listing_category_group_id = cg.id
    GROUP BY
        c.id, c.name, c.slug, c.headline, c.description,
        c.image_url_hero, c.image_url_small, c.href, c.color, c.emoji;
$$;

GRANT EXECUTE ON FUNCTION public.get_active_listing_categories() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_full_active_listing_categories() TO anon, authenticated, service_role;

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;
