-- ---------------------------
-- MODULE NAME: post
-- MODULE DATE: 20261026
-- MODULE SCOPE: Tables
-- ---------------------------

BEGIN;

DO $$ BEGIN
    ALTER TYPE public.post_state ADD VALUE 'AWAITING_MEMBER';
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

COMMIT;
