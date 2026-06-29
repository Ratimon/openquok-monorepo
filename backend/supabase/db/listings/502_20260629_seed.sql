-- ---------------------------
-- MODULE NAME: Listings
-- MODULE DATE: 20260629
-- MODULE SCOPE: Seed
-- ---------------------------

BEGIN;

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
