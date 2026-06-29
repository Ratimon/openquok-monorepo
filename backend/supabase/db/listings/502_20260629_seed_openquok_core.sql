-- ---------------------------
-- MODULE NAME: Listings
-- MODULE DATE: 20260629
-- MODULE SCOPE: Seed (openquok-core)
-- ---------------------------
-- Sync openquok-core listing tags with the full listing_tags catalog.
-- Listing row (extension_type both, mcp_tools) lives in 501_20260628_seed.sql.
-- Hub expanded card: Skills tab → Skill Setup Doc (click_url_skills); MCP tab → MCP Setup Doc (click_url_mcp).

BEGIN;

UPDATE public.listings
SET
    click_url = 'https://www.openquok.com/docs/getting-started-for-cli',
    click_url_skills = 'https://www.openquok.com/docs/agent-setup-guides',
    click_url_mcp = 'https://www.openquok.com/docs/mcp-setup-guides',
    updated_at = NOW()
WHERE slug = 'openquok-core';

UPDATE public.listings l
SET listing_tag_slugs = sub.slugs
FROM (
    SELECT ARRAY_AGG(t.slug ORDER BY t.slug) AS slugs
    FROM public.listing_tags t
) sub
WHERE l.slug = 'openquok-core';

DELETE FROM public.listings_listing_tags_association lta
USING public.listings l
WHERE lta.listing_id = l.id
  AND l.slug = 'openquok-core';

INSERT INTO public.listings_listing_tags_association (listing_id, listing_tag_id)
SELECT
    l.id,
    t.id
FROM public.listings l
CROSS JOIN public.listing_tags t
WHERE l.slug = 'openquok-core'
ON CONFLICT DO NOTHING;

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;
