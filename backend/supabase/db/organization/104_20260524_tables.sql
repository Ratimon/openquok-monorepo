-- ---------------------------
-- MODULE NAME: Organization
-- MODULE DATE: 20260524
-- MODULE SCOPE: Tables
-- ---------------------------
-- Idempotent for DBs that already received billing columns via billing/101 ALTER.
-- Column defaults stay FALSE; new workspaces set allow_trial / is_trialing in the API repository.

BEGIN;

ALTER TABLE public.organizations
    ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
    ADD COLUMN IF NOT EXISTS allow_trial BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_trialing BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.organizations.stripe_customer_id IS 'Stripe Customer id for workspace billing.';
COMMENT ON COLUMN public.organizations.allow_trial IS 'When true, new checkout sessions may include a trial period.';
COMMENT ON COLUMN public.organizations.is_trialing IS 'Workspace trial state; synced from Stripe when subscribed, cleared when trial ends or plan is active.';

COMMIT;
