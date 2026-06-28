-- ---------------------------
-- MODULE NAME: Listings
-- MODULE DATE: 20260628
-- MODULE SCOPE: Functions
-- ---------------------------

BEGIN;

CREATE OR REPLACE FUNCTION public.update_listing_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_listings_updated_at ON public.listings;
CREATE TRIGGER update_listings_updated_at
    BEFORE UPDATE ON public.listings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_listing_updated_at_column();

DROP TRIGGER IF EXISTS update_listing_ratings_updated_at ON public.listing_ratings;
CREATE TRIGGER update_listing_ratings_updated_at
    BEFORE UPDATE ON public.listing_ratings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_listing_updated_at_column();

DROP TRIGGER IF EXISTS update_listing_comments_updated_at ON public.listing_comments;
CREATE TRIGGER update_listing_comments_updated_at
    BEFORE UPDATE ON public.listing_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_listing_updated_at_column();

CREATE OR REPLACE FUNCTION public.generate_listing_slug()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := public.generate_unique_slug(NEW.title, 'listings');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_listing_slug ON public.listings;
CREATE TRIGGER set_listing_slug
    BEFORE INSERT ON public.listings
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_listing_slug();

CREATE OR REPLACE FUNCTION public.update_listing_published_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.is_admin_published AND NEW.is_user_published AND OLD.published_at IS NULL THEN
        NEW.published_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_listing_published_at ON public.listings;
CREATE TRIGGER set_listing_published_at
    BEFORE UPDATE ON public.listings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_listing_published_at();

CREATE OR REPLACE FUNCTION public.increment_field(p_listing_id UUID, field_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF field_name NOT IN ('likes', 'views', 'clicks', 'bookmark_count') THEN
        RAISE EXCEPTION 'Invalid field name';
    END IF;

    EXECUTE format(
        'UPDATE public.listings SET %I = %I + 1 WHERE id = $1',
        field_name,
        field_name
    )
    USING p_listing_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_field(UUID, TEXT) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.recompute_listing_rating_aggregate(p_listing_id UUID)
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
    FROM public.listing_ratings
    WHERE listing_id = p_listing_id;

    UPDATE public.listings
    SET ratings_count = v_count,
        average_rating = v_avg
    WHERE id = p_listing_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_recompute_listing_rating_aggregate()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    PERFORM public.recompute_listing_rating_aggregate(COALESCE(NEW.listing_id, OLD.listing_id));
    RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS recompute_listing_rating_on_change ON public.listing_ratings;
CREATE TRIGGER recompute_listing_rating_on_change
    AFTER INSERT OR UPDATE OR DELETE ON public.listing_ratings
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_recompute_listing_rating_aggregate();

CREATE OR REPLACE FUNCTION public.get_listing_statistics(logged_user_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_listings', COUNT(l.id),
        'total_likes', COALESCE(SUM(l.likes), 0),
        'total_views', COALESCE(SUM(l.views), 0),
        'total_clicks', COALESCE(SUM(l.clicks), 0),
        'total_ratings', COALESCE(SUM(l.ratings_count), 0),
        'total_bookmarks', COALESCE(SUM(l.bookmark_count), 0)
    )
    INTO result
    FROM public.listings l
    WHERE (logged_user_id IS NULL OR l.owner_id = logged_user_id)
      AND l.is_user_published = true
      AND l.is_admin_published = true;

    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_listing_statistics(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.recompute_listing_rating_aggregate(UUID) TO service_role;

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;
