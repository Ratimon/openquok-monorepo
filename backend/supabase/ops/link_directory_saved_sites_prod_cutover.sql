-- Link directory: bookmarks table → saved_sites (production one-off)
--
-- Run in Supabase Dashboard → SQL Editor when production still has
-- public.link_directory_bookmarks from an earlier deploy and the app now expects
-- public.link_directory_saved_sites with outreach_completed_at.
--
-- Safe to re-run: each step checks catalog state before altering.
-- Does not create the table from scratch; use aggregated migrations or db push
-- when the bookmarks table never existed.
--
-- After this script (and before shipping API/web that call /me/saved-sites):
--   cd backend
--   npx supabase@latest migration repair --linked --status applied <YYYYMMDD>
--   pnpm prod-backup:verify-saved-sites --linked
--
-- Greenfield / no user rows: prefer full reset or db push of
-- backend/supabase/migrations/*_core_structure.sql instead of this file.

BEGIN;

DO $$
BEGIN
    IF to_regclass('public.link_directory_bookmarks') IS NOT NULL
       AND to_regclass('public.link_directory_saved_sites') IS NULL THEN
        ALTER TABLE public.link_directory_bookmarks
            RENAME TO link_directory_saved_sites;
    END IF;
END $$;

DO $$
BEGIN
    IF to_regclass('public.link_directory_saved_sites') IS NOT NULL
       AND EXISTS (
           SELECT 1
           FROM information_schema.columns
           WHERE table_schema = 'public'
             AND table_name = 'link_directory_saved_sites'
             AND column_name = 'completed_at'
       )
       AND NOT EXISTS (
           SELECT 1
           FROM information_schema.columns
           WHERE table_schema = 'public'
             AND table_name = 'link_directory_saved_sites'
             AND column_name = 'outreach_completed_at'
       ) THEN
        ALTER TABLE public.link_directory_saved_sites
            RENAME COLUMN completed_at TO outreach_completed_at;
    END IF;
END $$;

ALTER INDEX IF EXISTS idx_link_directory_bookmarks_user_sort
    RENAME TO idx_link_directory_saved_sites_user_sort;
ALTER INDEX IF EXISTS idx_link_directory_bookmarks_site_id
    RENAME TO idx_link_directory_saved_sites_site_id;

COMMENT ON TABLE public.link_directory_saved_sites IS
    'Per-user shortlist of link directory sites (Saved → Backlinks): private order and outreach progress.';
COMMENT ON COLUMN public.link_directory_saved_sites.outreach_completed_at IS
    'When the signed-in user marked personal outreach on this site as done; null means not completed.';

COMMIT;
