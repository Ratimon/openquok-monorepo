-- ---------------------------
-- MODULE NAME: Listings
-- MODULE DATE: 20260628
-- MODULE SCOPE: Indexes
-- ---------------------------

BEGIN;

CREATE INDEX IF NOT EXISTS idx_listings_listing_category_id ON public.listings (listing_category_id);
CREATE INDEX IF NOT EXISTS idx_listings_owner_id ON public.listings (owner_id);
CREATE INDEX IF NOT EXISTS idx_listings_published ON public.listings (is_user_published, is_admin_published);
CREATE INDEX IF NOT EXISTS idx_listings_slug ON public.listings (slug);
CREATE INDEX IF NOT EXISTS idx_listings_listing_kind ON public.listings (listing_kind);
CREATE INDEX IF NOT EXISTS idx_listings_extension_type ON public.listings (extension_type)
    WHERE extension_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings (created_at);
CREATE INDEX IF NOT EXISTS idx_listings_published_at ON public.listings (published_at);
CREATE INDEX IF NOT EXISTS idx_listings_fts ON public.listings USING gin (fts);

CREATE INDEX IF NOT EXISTS idx_listings_tags_assoc_tag_id
    ON public.listings_listing_tags_association (listing_tag_id);
CREATE INDEX IF NOT EXISTS idx_listings_tags_assoc_listing_id
    ON public.listings_listing_tags_association (listing_id);

CREATE INDEX IF NOT EXISTS idx_listing_stack_members_stack_id
    ON public.listing_stack_members (stack_listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_stack_members_member_id
    ON public.listing_stack_members (member_listing_id);

CREATE INDEX IF NOT EXISTS idx_listing_relations_listing_id ON public.listing_relations (listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_relations_related_id ON public.listing_relations (related_listing_id);

CREATE INDEX IF NOT EXISTS idx_listing_bookmarks_user_id ON public.listing_bookmarks (user_id);
CREATE INDEX IF NOT EXISTS idx_listing_bookmarks_listing_id ON public.listing_bookmarks (listing_id);

CREATE INDEX IF NOT EXISTS idx_listing_ratings_listing_id ON public.listing_ratings (listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_ratings_user_id ON public.listing_ratings (user_id);

CREATE INDEX IF NOT EXISTS idx_listing_comments_listing_id ON public.listing_comments (listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_comments_user_id ON public.listing_comments (user_id);
CREATE INDEX IF NOT EXISTS idx_listing_comments_parent_id ON public.listing_comments (parent_id);

CREATE INDEX IF NOT EXISTS idx_listing_activities_listing_id ON public.listing_activities (listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_activities_user_id ON public.listing_activities (user_id);
CREATE INDEX IF NOT EXISTS idx_listing_activities_type ON public.listing_activities (activity_type);

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;
