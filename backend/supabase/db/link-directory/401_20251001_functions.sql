-- ---------------------------
-- MODULE NAME: Link Directory
-- MODULE DATE: 20251001
-- MODULE SCOPE: Functions
-- ---------------------------

BEGIN;

CREATE OR REPLACE FUNCTION public.update_link_directory_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

REVOKE ALL ON FUNCTION public.update_link_directory_updated_at_column() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_link_directory_updated_at_column() FROM anon, authenticated;

DROP TRIGGER IF EXISTS update_link_directory_categories_updated_at ON public.link_directory_categories;
CREATE TRIGGER update_link_directory_categories_updated_at
    BEFORE UPDATE ON public.link_directory_categories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_link_directory_updated_at_column();

DROP TRIGGER IF EXISTS update_link_directory_tag_groups_updated_at ON public.link_directory_tag_groups;
CREATE TRIGGER update_link_directory_tag_groups_updated_at
    BEFORE UPDATE ON public.link_directory_tag_groups
    FOR EACH ROW
    EXECUTE FUNCTION public.update_link_directory_updated_at_column();

DROP TRIGGER IF EXISTS update_link_directory_tags_updated_at ON public.link_directory_tags;
CREATE TRIGGER update_link_directory_tags_updated_at
    BEFORE UPDATE ON public.link_directory_tags
    FOR EACH ROW
    EXECUTE FUNCTION public.update_link_directory_updated_at_column();

DROP TRIGGER IF EXISTS update_link_directory_sites_updated_at ON public.link_directory_sites;
CREATE TRIGGER update_link_directory_sites_updated_at
    BEFORE UPDATE ON public.link_directory_sites
    FOR EACH ROW
    EXECUTE FUNCTION public.update_link_directory_updated_at_column();

DROP TRIGGER IF EXISTS update_link_directory_opportunities_updated_at ON public.link_directory_opportunities;
CREATE TRIGGER update_link_directory_opportunities_updated_at
    BEFORE UPDATE ON public.link_directory_opportunities
    FOR EACH ROW
    EXECUTE FUNCTION public.update_link_directory_updated_at_column();

DROP TRIGGER IF EXISTS update_link_directory_submissions_updated_at ON public.link_directory_submissions;
CREATE TRIGGER update_link_directory_submissions_updated_at
    BEFORE UPDATE ON public.link_directory_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_link_directory_updated_at_column();

CREATE OR REPLACE FUNCTION public.update_link_directory_site_published_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.is_admin_published AND (OLD IS NULL OR NOT OLD.is_admin_published) AND NEW.published_at IS NULL THEN
        NEW.published_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

REVOKE ALL ON FUNCTION public.update_link_directory_site_published_at() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_link_directory_site_published_at() FROM anon, authenticated;

DROP TRIGGER IF EXISTS set_link_directory_site_published_at ON public.link_directory_sites;
CREATE TRIGGER set_link_directory_site_published_at
    BEFORE INSERT OR UPDATE ON public.link_directory_sites
    FOR EACH ROW
    EXECUTE FUNCTION public.update_link_directory_site_published_at();

CREATE OR REPLACE FUNCTION public.update_link_directory_opportunity_published_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.is_admin_published AND (OLD IS NULL OR NOT OLD.is_admin_published) AND NEW.published_at IS NULL THEN
        NEW.published_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

REVOKE ALL ON FUNCTION public.update_link_directory_opportunity_published_at() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_link_directory_opportunity_published_at() FROM anon, authenticated;

DROP TRIGGER IF EXISTS set_link_directory_opportunity_published_at ON public.link_directory_opportunities;
CREATE TRIGGER set_link_directory_opportunity_published_at
    BEFORE INSERT OR UPDATE ON public.link_directory_opportunities
    FOR EACH ROW
    EXECUTE FUNCTION public.update_link_directory_opportunity_published_at();

CREATE OR REPLACE FUNCTION public.sync_link_directory_site_tag_slugs(p_site_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.link_directory_sites s
    SET tag_slugs = COALESCE(
        (
            SELECT ARRAY_AGG(t.slug ORDER BY t.slug)
            FROM public.link_directory_site_tags_association sta
            INNER JOIN public.link_directory_tags t ON t.id = sta.link_directory_tag_id
            WHERE sta.site_id = p_site_id
        ),
        ARRAY[]::text[]
    )
    WHERE s.id = p_site_id;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_link_directory_site_tag_slugs(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sync_link_directory_site_tag_slugs(UUID) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_link_directory_site_tag_slugs(UUID) TO service_role;

CREATE OR REPLACE FUNCTION public.trigger_sync_link_directory_site_tag_slugs()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    PERFORM public.sync_link_directory_site_tag_slugs(COALESCE(NEW.site_id, OLD.site_id));
    RETURN COALESCE(NEW, OLD);
END;
$$;

REVOKE ALL ON FUNCTION public.trigger_sync_link_directory_site_tag_slugs() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.trigger_sync_link_directory_site_tag_slugs() FROM anon, authenticated;

DROP TRIGGER IF EXISTS sync_link_directory_site_tag_slugs_on_change ON public.link_directory_site_tags_association;
CREATE TRIGGER sync_link_directory_site_tag_slugs_on_change
    AFTER INSERT OR UPDATE OR DELETE ON public.link_directory_site_tags_association
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_sync_link_directory_site_tag_slugs();

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;
