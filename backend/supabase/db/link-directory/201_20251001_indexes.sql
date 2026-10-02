-- ---------------------------
-- MODULE NAME: Link Directory
-- MODULE DATE: 20251001
-- MODULE SCOPE: Indexes
-- ---------------------------

BEGIN;

CREATE INDEX IF NOT EXISTS idx_link_directory_categories_slug
    ON public.link_directory_categories (slug);
CREATE INDEX IF NOT EXISTS idx_link_directory_categories_sort_order
    ON public.link_directory_categories (sort_order);

CREATE INDEX IF NOT EXISTS idx_link_directory_tags_slug
    ON public.link_directory_tags (slug);

CREATE INDEX IF NOT EXISTS idx_link_directory_sites_slug
    ON public.link_directory_sites (slug);
CREATE INDEX IF NOT EXISTS idx_link_directory_sites_category_published
    ON public.link_directory_sites (category_id, is_admin_published);
CREATE INDEX IF NOT EXISTS idx_link_directory_sites_domain_rating
    ON public.link_directory_sites (domain_rating DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_link_directory_sites_fts
    ON public.link_directory_sites USING gin (fts);
CREATE INDEX IF NOT EXISTS idx_link_directory_sites_tag_slugs
    ON public.link_directory_sites USING gin (tag_slugs);

CREATE INDEX IF NOT EXISTS idx_link_directory_opportunities_site_sort
    ON public.link_directory_opportunities (site_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_link_directory_opportunities_type_id
    ON public.link_directory_opportunities (opportunity_type_id);
CREATE INDEX IF NOT EXISTS idx_link_directory_opportunities_published
    ON public.link_directory_opportunities (site_id, is_admin_published);

CREATE INDEX IF NOT EXISTS idx_link_directory_site_tags_assoc_tag_id
    ON public.link_directory_site_tags_association (link_directory_tag_id);
CREATE INDEX IF NOT EXISTS idx_link_directory_site_tags_assoc_site_id
    ON public.link_directory_site_tags_association (site_id);

CREATE INDEX IF NOT EXISTS idx_link_directory_submissions_status
    ON public.link_directory_submissions (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_link_directory_submissions_user_id
    ON public.link_directory_submissions (user_id);

CREATE INDEX IF NOT EXISTS idx_link_directory_bookmarks_user_sort
    ON public.link_directory_bookmarks (user_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_link_directory_bookmarks_site_id
    ON public.link_directory_bookmarks (site_id);

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;
