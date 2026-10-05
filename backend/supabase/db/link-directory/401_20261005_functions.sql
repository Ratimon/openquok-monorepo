-- ---------------------------
-- MODULE NAME: Link Directory
-- MODULE DATE: 20261005
-- MODULE SCOPE: Functions
-- ---------------------------

BEGIN;

DROP TRIGGER IF EXISTS update_link_directory_site_ratings_updated_at ON public.link_directory_site_ratings;
CREATE TRIGGER update_link_directory_site_ratings_updated_at
    BEFORE UPDATE ON public.link_directory_site_ratings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_link_directory_updated_at_column();

DROP TRIGGER IF EXISTS update_link_directory_site_comments_updated_at ON public.link_directory_site_comments;
CREATE TRIGGER update_link_directory_site_comments_updated_at
    BEFORE UPDATE ON public.link_directory_site_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_link_directory_updated_at_column();

CREATE OR REPLACE FUNCTION public.increment_link_directory_site_field(p_site_id UUID, field_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF field_name NOT IN ('likes', 'views', 'bookmark_count') THEN
        RAISE EXCEPTION 'Invalid field name';
    END IF;

    EXECUTE format(
        'UPDATE public.link_directory_sites SET %I = %I + 1 WHERE id = $1',
        field_name,
        field_name
    )
    USING p_site_id;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_link_directory_site_field(UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_link_directory_site_field(UUID, TEXT) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_link_directory_site_field(UUID, TEXT) TO service_role;

CREATE OR REPLACE FUNCTION public.recompute_link_directory_site_rating_aggregate(p_site_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_count INTEGER;
    v_avg DOUBLE PRECISION;
BEGIN
    SELECT COUNT(*)::INTEGER, COALESCE(AVG(rating)::DOUBLE PRECISION, 0)
    INTO v_count, v_avg
    FROM public.link_directory_site_ratings
    WHERE site_id = p_site_id;

    UPDATE public.link_directory_sites
    SET ratings_count = v_count,
        average_rating = v_avg
    WHERE id = p_site_id;
END;
$$;

REVOKE ALL ON FUNCTION public.recompute_link_directory_site_rating_aggregate(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.recompute_link_directory_site_rating_aggregate(UUID) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.recompute_link_directory_site_rating_aggregate(UUID) TO service_role;

CREATE OR REPLACE FUNCTION public.trigger_recompute_link_directory_site_rating_aggregate()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    PERFORM public.recompute_link_directory_site_rating_aggregate(COALESCE(NEW.site_id, OLD.site_id));
    RETURN COALESCE(NEW, OLD);
END;
$$;

REVOKE ALL ON FUNCTION public.trigger_recompute_link_directory_site_rating_aggregate() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.trigger_recompute_link_directory_site_rating_aggregate() FROM anon, authenticated;

DROP TRIGGER IF EXISTS recompute_link_directory_site_rating_on_change ON public.link_directory_site_ratings;
CREATE TRIGGER recompute_link_directory_site_rating_on_change
    AFTER INSERT OR UPDATE OR DELETE ON public.link_directory_site_ratings
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_recompute_link_directory_site_rating_aggregate();

UPDATE public.link_directory_sites s
SET bookmark_count = COALESCE(saved.cnt, 0)
FROM (
    SELECT site_id, COUNT(*)::INTEGER AS cnt
    FROM public.link_directory_saved_sites
    GROUP BY site_id
) saved
WHERE s.id = saved.site_id;

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;
