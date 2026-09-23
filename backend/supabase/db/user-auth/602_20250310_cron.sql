-- ---------------------------
-- MODULE NAME: User Auth
-- MODULE DATE: 20250310
-- MODULE SCOPE: Cron Jobs
-- ---------------------------

BEGIN;

-- ---------------------------
-- Install pg_cron Extension
-- ---------------------------
-- Required for scheduled deletion of expired refresh tokens.
-- On Supabase 1.169.8+, pg_cron must be in pg_catalog schema.
-- Supabase Cloud often enables pg_cron via Dashboard (Integrations → Cron) first;
-- CREATE EXTENSION then fails with SQLSTATE 2BP01 (dependent privileges exist).
DO $openquok_pg_cron$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        RAISE NOTICE 'pg_cron already installed; skipping CREATE EXTENSION';
        RETURN;
    END IF;

    CREATE EXTENSION pg_cron WITH SCHEMA pg_catalog;
EXCEPTION
    WHEN SQLSTATE '2BP01' THEN
        RAISE NOTICE 'pg_cron already installed with dependent privileges; skipping CREATE EXTENSION';
END
$openquok_pg_cron$;

-- ---------------------------
-- Schedule: Delete Expired Refresh Tokens
-- Runs every Saturday at 3:30 AM (GMT)
-- ---------------------------

DO $openquok_refresh_token_cron$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM cron.job
        WHERE jobname = 'delete-expired-refresh-tokens'
    ) THEN
        RAISE NOTICE 'cron job delete-expired-refresh-tokens already scheduled; skipping';
        RETURN;
    END IF;

    PERFORM cron.schedule(
        'delete-expired-refresh-tokens',
        '30 3 * * 6',
        $$ DELETE FROM public.refresh_tokens WHERE expires_at < now() $$
    );
END
$openquok_refresh_token_cron$;

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;
