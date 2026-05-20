-- ---------------------------
-- MODULE NAME: Billing
-- MODULE DATE: 20260519
-- MODULE SCOPE: Tables
-- ---------------------------

BEGIN;

DO $$ BEGIN
    CREATE TYPE public.subscription_tier AS ENUM ('SOLO', 'CREATOR', 'TEAM', 'ULTIMATE');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE public.subscription_period AS ENUM ('MONTHLY', 'YEARLY');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TYPE public.subscription_tier IS 'Paid workspace subscription tier (FREE is implicit when no subscription row exists).';
COMMENT ON TYPE public.subscription_period IS 'Billing cadence for a paid subscription.';

ALTER TABLE public.organizations
    ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
    ADD COLUMN IF NOT EXISTS allow_trial BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_trialing BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.organizations.stripe_customer_id IS 'Stripe Customer id for workspace billing.';
COMMENT ON COLUMN public.organizations.allow_trial IS 'When true, new checkout sessions may include a trial period.';
COMMENT ON COLUMN public.organizations.is_trialing IS 'Synced from Stripe when the subscription is in trial.';

CREATE TABLE IF NOT EXISTS public.organization_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    subscription_tier public.subscription_tier NOT NULL,
    period public.subscription_period NOT NULL DEFAULT 'MONTHLY',
    identifier TEXT,
    cancel_at TIMESTAMPTZ,
    total_channels INTEGER NOT NULL DEFAULT 0,
    is_lifetime BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_organization_subscriptions_org UNIQUE (organization_id)
);

COMMENT ON TABLE public.organization_subscriptions IS 'Active paid plan for a workspace; mirrors Stripe subscription state.';
COMMENT ON COLUMN public.organization_subscriptions.identifier IS 'Checkout correlation id stored in Stripe subscription metadata.';
COMMENT ON COLUMN public.organization_subscriptions.total_channels IS 'Channel cap snapshot (may exceed plan default after upgrades).';

CREATE INDEX IF NOT EXISTS idx_organization_subscriptions_customer
    ON public.organization_subscriptions (organization_id)
    WHERE deleted_at IS NULL;

COMMIT;
