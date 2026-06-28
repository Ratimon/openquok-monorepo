-- ---------------------------
-- MODULE NAME: Listing Tags
-- MODULE DATE: 20260628
-- MODULE SCOPE: Indexes
-- ---------------------------

BEGIN;

CREATE INDEX IF NOT EXISTS idx_listing_tags_slug ON public.listing_tags (slug);

CREATE INDEX IF NOT EXISTS idx_ltg_lta_tag_id
    ON public.listing_tag_groups_listing_tags_association (listing_tag_id);
CREATE INDEX IF NOT EXISTS idx_ltg_lta_group_id
    ON public.listing_tag_groups_listing_tags_association (listing_tag_group_id);

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;
