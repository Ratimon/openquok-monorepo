-- ---------------------------
-- MODULE NAME: Blog System Tables
-- MODULE DATE: 20260926
-- MODULE SCOPE: tables
-- ---------------------------

BEGIN;

ALTER TABLE public.blog_posts
    ADD COLUMN IF NOT EXISTS howto_name TEXT;

COMMENT ON COLUMN public.blog_posts.howto_name IS 'Optional HowTo title for structured data and on-page step summary; defaults to post title when empty.';

COMMIT;
