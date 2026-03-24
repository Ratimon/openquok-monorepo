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
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- ---------------------------
-- Schedule: Delete Expired Refresh Tokens
-- Runs every Saturday at 3:30 AM (GMT)
-- ---------------------------

SELECT cron.schedule(
  'delete-expired-refresh-tokens', -- name of the cron job
  '30 3 * * 6', -- Saturday at 3:30 AM (GMT) - cron syntax: minute hour day month weekday
  $$ DELETE FROM public.refresh_tokens WHERE expires_at < now() $$
);

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;
