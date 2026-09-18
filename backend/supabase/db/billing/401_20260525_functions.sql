-- ---------------------------
-- MODULE NAME: Billing
-- MODULE DATE: 20260525
-- MODULE SCOPE: Functions
-- ---------------------------
-- Server-side subscription sync bypasses RLS (same pattern as workspace creation).

BEGIN;

CREATE OR REPLACE FUNCTION public.internal_upsert_organization_subscription(
    p_organization_id uuid,
    p_subscription_tier public.subscription_tier,
    p_period public.subscription_period,
    p_identifier text,
    p_cancel_at timestamptz,
    p_channels_per_workspace integer,
    p_is_lifetime boolean DEFAULT FALSE,
    p_is_trialing boolean DEFAULT FALSE,
    p_current_period_start timestamptz DEFAULT NULL,
    p_current_period_end timestamptz DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    organization_id uuid,
    subscription_tier public.subscription_tier,
    period public.subscription_period,
    identifier text,
    cancel_at timestamptz,
    channels_per_workspace integer,
    is_lifetime boolean,
    current_period_start timestamptz,
    current_period_end timestamptz,
    created_at timestamptz,
    updated_at timestamptz,
    deleted_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.organizations o WHERE o.id = p_organization_id) THEN
        RAISE EXCEPTION 'Organization not found';
    END IF;

    INSERT INTO public.organization_subscriptions (
        organization_id,
        subscription_tier,
        period,
        identifier,
        cancel_at,
        channels_per_workspace,
        is_lifetime,
        current_period_start,
        current_period_end,
        updated_at,
        deleted_at
    )
    VALUES (
        p_organization_id,
        p_subscription_tier,
        p_period,
        NULLIF(trim(COALESCE(p_identifier, '')), ''),
        p_cancel_at,
        p_channels_per_workspace,
        COALESCE(p_is_lifetime, FALSE),
        p_current_period_start,
        p_current_period_end,
        NOW(),
        NULL
    )
    ON CONFLICT ON CONSTRAINT uq_organization_subscriptions_org DO UPDATE SET
        subscription_tier = EXCLUDED.subscription_tier,
        period = EXCLUDED.period,
        identifier = EXCLUDED.identifier,
        cancel_at = EXCLUDED.cancel_at,
        channels_per_workspace = EXCLUDED.channels_per_workspace,
        is_lifetime = EXCLUDED.is_lifetime,
        current_period_start = EXCLUDED.current_period_start,
        current_period_end = EXCLUDED.current_period_end,
        updated_at = NOW(),
        deleted_at = NULL;

    UPDATE public.organizations
    SET
        is_trialing = COALESCE(p_is_trialing, FALSE),
        allow_trial = FALSE,
        updated_at = NOW()
    WHERE organizations.id = p_organization_id;

    IF COALESCE(p_is_trialing, FALSE) THEN
        UPDATE public.users u
        SET
            cloud_trial_consumed_at = COALESCE(u.cloud_trial_consumed_at, NOW()),
            updated_at = NOW()
        FROM public.user_organizations uo
        WHERE uo.user_id = u.id
          AND uo.organization_id = p_organization_id
          AND uo.role = 'owner';
    END IF;

    RETURN QUERY
    SELECT
        s.id,
        s.organization_id,
        s.subscription_tier,
        s.period,
        s.identifier,
        s.cancel_at,
        s.channels_per_workspace,
        s.is_lifetime,
        s.current_period_start,
        s.current_period_end,
        s.created_at,
        s.updated_at,
        s.deleted_at
    FROM public.organization_subscriptions s
    WHERE s.organization_id = p_organization_id;
END;
$$;

REVOKE ALL ON FUNCTION public.internal_upsert_organization_subscription(
    uuid,
    public.subscription_tier,
    public.subscription_period,
    text,
    timestamptz,
    integer,
    boolean,
    boolean,
    timestamptz,
    timestamptz
) FROM PUBLIC;

REVOKE ALL ON FUNCTION public.internal_upsert_organization_subscription(
    uuid,
    public.subscription_tier,
    public.subscription_period,
    text,
    timestamptz,
    integer,
    boolean,
    boolean,
    timestamptz,
    timestamptz
) FROM anon, authenticated;

GRANT EXECUTE ON FUNCTION public.internal_upsert_organization_subscription(
    uuid,
    public.subscription_tier,
    public.subscription_period,
    text,
    timestamptz,
    integer,
    boolean,
    boolean,
    timestamptz,
    timestamptz
) TO service_role;

COMMENT ON FUNCTION public.internal_upsert_organization_subscription(
    uuid,
    public.subscription_tier,
    public.subscription_period,
    text,
    timestamptz,
    integer,
    boolean,
    boolean,
    timestamptz,
    timestamptz
) IS 'Upsert paid subscription row, revoke workspace trial eligibility, and mark the owner trial as consumed when trialing (bypasses RLS); Stripe webhook and billing API only.';

-- Workspaces that already have a subscription row (including soft-deleted) cannot start another trial.
UPDATE public.organizations o
SET allow_trial = FALSE, updated_at = NOW()
WHERE o.allow_trial = TRUE
  AND EXISTS (
    SELECT 1 FROM public.organization_subscriptions s
    WHERE s.organization_id = o.id
  );

-- Owners of those workspaces have already used their one Cloud trial.
UPDATE public.users u
SET
    cloud_trial_consumed_at = COALESCE(u.cloud_trial_consumed_at, NOW()),
    updated_at = NOW()
WHERE u.cloud_trial_consumed_at IS NULL
  AND EXISTS (
    SELECT 1
    FROM public.user_organizations uo
    INNER JOIN public.organization_subscriptions s
        ON s.organization_id = uo.organization_id
    WHERE uo.user_id = u.id
      AND uo.role = 'owner'
  );

COMMIT;
