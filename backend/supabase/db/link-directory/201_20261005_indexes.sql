-- ---------------------------
-- MODULE NAME: Link Directory
-- MODULE DATE: 20261005
-- MODULE SCOPE: Indexes
-- ---------------------------

BEGIN;

CREATE INDEX IF NOT EXISTS idx_link_directory_site_ratings_site_id
    ON public.link_directory_site_ratings (site_id);
CREATE INDEX IF NOT EXISTS idx_link_directory_site_ratings_user_id
    ON public.link_directory_site_ratings (user_id);

CREATE INDEX IF NOT EXISTS idx_link_directory_site_comments_site_id
    ON public.link_directory_site_comments (site_id);
CREATE INDEX IF NOT EXISTS idx_link_directory_site_comments_user_id
    ON public.link_directory_site_comments (user_id);
CREATE INDEX IF NOT EXISTS idx_link_directory_site_comments_parent_id
    ON public.link_directory_site_comments (parent_id);

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;
