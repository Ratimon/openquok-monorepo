-- ---------------------------
-- MODULE NAME: Link Directory
-- MODULE DATE: 20261022
-- MODULE SCOPE: Tables
-- ---------------------------

BEGIN;

-- Existing deployments created link_directory_opportunities before auto-launch columns
-- were added to 101_20251001_tables.sql (CREATE TABLE IF NOT EXISTS skips alters).
ALTER TABLE public.link_directory_opportunities
    ADD COLUMN IF NOT EXISTS auto_launch_enabled BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.link_directory_opportunities
    ADD COLUMN IF NOT EXISTS auto_launch_provider_slug TEXT;

COMMENT ON COLUMN public.link_directory_opportunities.auto_launch_enabled IS
    'When true, build-backlinks and account surfaces may open the directory launch modal for this opportunity.';
COMMENT ON COLUMN public.link_directory_opportunities.auto_launch_provider_slug IS
    'Matches auto_launch_destinations.provider_slug when auto_launch_enabled is true.';

COMMIT;

-- ---------------------------
-- END OF FILE
-- ---------------------------
