-- ---------------------------
-- MODULE NAME: Link Directory
-- MODULE DATE: 20261112
-- MODULE SCOPE: Tables (allow directory_channel CTA kind on opportunities)
-- ---------------------------

BEGIN;

ALTER TABLE public.link_directory_opportunities
    DROP CONSTRAINT IF EXISTS link_directory_opportunities_openquok_cta_kind_check;

ALTER TABLE public.link_directory_opportunities
    ADD CONSTRAINT link_directory_opportunities_openquok_cta_kind_check
    CHECK (openquok_cta_kind IN (
        'none',
        'connect_channel',
        'schedule_post',
        'use_plug',
        'external_doc',
        'directory_channel'
    ));

COMMIT;
