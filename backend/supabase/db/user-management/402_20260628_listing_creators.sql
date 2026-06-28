-- ---------------------------
-- MODULE NAME: User Management
-- MODULE DATE: 20260628
-- MODULE SCOPE: Functions
-- ---------------------------

BEGIN;

CREATE OR REPLACE FUNCTION public.get_listing_creators()
RETURNS TABLE (
    id UUID,
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    tag_line TEXT,
    extension_count BIGINT,
    stack_count BIGINT,
    total_likes BIGINT,
    total_bookmarks BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        u.id,
        u.username,
        u.full_name,
        up.avatar_url,
        up.tag_line,
        COUNT(l.id) FILTER (WHERE l.listing_kind = 'extension') AS extension_count,
        COUNT(l.id) FILTER (WHERE l.listing_kind = 'stack') AS stack_count,
        COALESCE(SUM(l.likes), 0)::BIGINT AS total_likes,
        COALESCE(SUM(l.bookmark_count), 0)::BIGINT AS total_bookmarks
    FROM public.users u
    INNER JOIN public.listings l ON l.owner_id = u.id
        AND l.is_user_published = true
        AND l.is_admin_published = true
    LEFT JOIN public.user_profiles up ON up.owner_id = u.id
    WHERE u.username IS NOT NULL
    GROUP BY u.id, u.username, u.full_name, up.avatar_url, up.tag_line
    ORDER BY extension_count DESC, stack_count DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_listing_creators() TO anon, authenticated, service_role;

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;
