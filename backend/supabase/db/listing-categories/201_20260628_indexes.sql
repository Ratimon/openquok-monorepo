-- ---------------------------
-- MODULE NAME: Listing Categories
-- MODULE DATE: 20260628
-- MODULE SCOPE: Indexes
-- ---------------------------

BEGIN;

CREATE INDEX IF NOT EXISTS idx_listing_categories_slug ON public.listing_categories (slug);
CREATE INDEX IF NOT EXISTS idx_listing_categories_parent_id ON public.listing_categories (parent_id);

CREATE INDEX IF NOT EXISTS idx_lcg_lca_category_id
    ON public.listing_category_groups_listing_categories_association (listing_category_id);
CREATE INDEX IF NOT EXISTS idx_lcg_lca_group_id
    ON public.listing_category_groups_listing_categories_association (listing_category_group_id);

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;
