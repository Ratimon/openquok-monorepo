-- ---------------------------
-- MODULE NAME: Billing
-- MODULE DATE: 20260519
-- MODULE SCOPE: Tables
-- ---------------------------

BEGIN;

DO $$ BEGIN
    CREATE TYPE public.subscription_tier AS ENUM ('SOLO', 'CREATOR', 'TEAM', 'ULTIMATE', 'MAX');
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

CREATE TABLE IF NOT EXISTS public.organization_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    subscription_tier public.subscription_tier NOT NULL,
    period public.subscription_period NOT NULL DEFAULT 'MONTHLY',
    identifier TEXT,
    cancel_at TIMESTAMPTZ,
    channels_per_workspace INTEGER NOT NULL DEFAULT 0,
    is_lifetime BOOLEAN NOT NULL DEFAULT FALSE,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_organization_subscriptions_org UNIQUE (organization_id)
);

COMMENT ON TABLE public.organization_subscriptions IS 'Active paid plan for a workspace; mirrors Stripe subscription state.';
COMMENT ON COLUMN public.organization_subscriptions.identifier IS 'Checkout correlation id stored in Stripe subscription metadata.';
COMMENT ON COLUMN public.organization_subscriptions.channels_per_workspace IS 'Per-workspace connected-channel cap snapshot (may exceed plan default after upgrades).';
COMMENT ON COLUMN public.organization_subscriptions.current_period_start IS 'Stripe billing period start (UTC). Used to anchor per-month limit windows.';
COMMENT ON COLUMN public.organization_subscriptions.current_period_end IS 'Stripe billing period end (UTC). Informational (UI/debug); limits anchor uses period start.';

CREATE INDEX IF NOT EXISTS idx_organization_subscriptions_customer
    ON public.organization_subscriptions (organization_id)
    WHERE deleted_at IS NULL;

COMMIT;
