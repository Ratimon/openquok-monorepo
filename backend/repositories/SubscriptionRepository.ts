import type { SupabaseClient } from "@supabase/supabase-js";
import type { PaidSubscriptionTier, SubscriptionPeriod } from "openquok-common";
import { DatabaseError } from "../errors/InfraError";

const SUBSCRIPTIONS_TABLE = "organization_subscriptions";
const ORGS_TABLE = "organizations";

function supabaseErrorMetadata(error: { code?: string; message?: string; details?: string; hint?: string }) {
    return {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
    };
}

export interface OrganizationSubscriptionRow {
    id: string;
    organization_id: string;
    subscription_tier: PaidSubscriptionTier;
    period: SubscriptionPeriod;
    identifier: string | null;
    cancel_at: string | null;
    channels_per_workspace: number;
    is_lifetime: boolean;
    current_period_start: string | null;
    current_period_end: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface OrganizationBillingRow {
    id: string;
    name: string;
    stripe_customer_id: string | null;
    allow_trial: boolean;
    is_trialing: boolean;
}

export class SubscriptionRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    async getSubscriptionByOrganizationId(
        organizationId: string
    ): Promise<OrganizationSubscriptionRow | null> {
        const { data, error } = await this.supabase
            .from(SUBSCRIPTIONS_TABLE)
            .select(
                "id, organization_id, subscription_tier, period, identifier, cancel_at, channels_per_workspace, is_lifetime, current_period_start, current_period_end, created_at, updated_at, deleted_at"
            )
            .eq("organization_id", organizationId)
            .is("deleted_at", null)
            .maybeSingle();

        if (error) {
            throw new DatabaseError("Failed to load organization subscription", {
                cause: error as unknown as Error,
                operation: "getSubscriptionByOrganizationId",
                resource: { type: "table", name: SUBSCRIPTIONS_TABLE },
            });
        }
        return (data as OrganizationSubscriptionRow | null) ?? null;
    }

    async getOrganizationBilling(organizationId: string): Promise<OrganizationBillingRow | null> {
        const { data, error } = await this.supabase
            .from(ORGS_TABLE)
            .select("id, name, stripe_customer_id, allow_trial, is_trialing")
            .eq("id", organizationId)
            .maybeSingle();

        if (error) {
            throw new DatabaseError("Failed to load organization billing profile", {
                cause: error as unknown as Error,
                operation: "getOrganizationBilling",
                resource: { type: "table", name: ORGS_TABLE },
            });
        }
        return (data as OrganizationBillingRow | null) ?? null;
    }

    async getOrganizationByStripeCustomerId(customerId: string): Promise<OrganizationBillingRow | null> {
        const { data, error } = await this.supabase
            .from(ORGS_TABLE)
            .select("id, name, stripe_customer_id, allow_trial, is_trialing")
            .eq("stripe_customer_id", customerId)
            .maybeSingle();

        if (error) {
            throw new DatabaseError("Failed to resolve organization by Stripe customer", {
                cause: error as unknown as Error,
                operation: "getOrganizationByStripeCustomerId",
                resource: { type: "table", name: ORGS_TABLE },
            });
        }
        return (data as OrganizationBillingRow | null) ?? null;
    }

    async updateStripeCustomerId(organizationId: string, customerId: string): Promise<void> {
        const { error } = await this.supabase
            .from(ORGS_TABLE)
            .update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() })
            .eq("id", organizationId);

        if (error) {
            throw new DatabaseError("Failed to update Stripe customer id", {
                cause: error as unknown as Error,
                operation: "updateStripeCustomerId",
                resource: { type: "table", name: ORGS_TABLE },
            });
        }
    }

    /** Clears a stale Stripe customer link (e.g. customer deleted in the Dashboard). */
    async clearStripeCustomerId(organizationId: string): Promise<void> {
        const { error } = await this.supabase
            .from(ORGS_TABLE)
            .update({ stripe_customer_id: null, updated_at: new Date().toISOString() })
            .eq("id", organizationId);

        if (error) {
            throw new DatabaseError("Failed to clear Stripe customer id", {
                cause: error as unknown as Error,
                operation: "clearStripeCustomerId",
                resource: { type: "table", name: ORGS_TABLE },
            });
        }
    }

    async setTrialing(organizationId: string, isTrialing: boolean): Promise<void> {
        const { error } = await this.supabase
            .from(ORGS_TABLE)
            .update({ is_trialing: isTrialing, updated_at: new Date().toISOString() })
            .eq("id", organizationId);

        if (error) {
            throw new DatabaseError("Failed to update trial flag", {
                cause: error as unknown as Error,
                operation: "setTrialing",
                resource: { type: "table", name: ORGS_TABLE },
            });
        }
    }

    /** Checkout correlation id (`?checkout=` / Stripe metadata.uniqueId), any workspace. */
    async getSubscriptionByIdentifier(identifier: string): Promise<OrganizationSubscriptionRow | null> {
        const trimmed = identifier.trim();
        if (!trimmed) return null;

        const { data, error } = await this.supabase
            .from(SUBSCRIPTIONS_TABLE)
            .select(
                "id, organization_id, subscription_tier, period, identifier, cancel_at, channels_per_workspace, is_lifetime, current_period_start, current_period_end, created_at, updated_at, deleted_at"
            )
            .eq("identifier", trimmed)
            .is("deleted_at", null)
            .maybeSingle();

        if (error) {
            throw new DatabaseError("Failed to load subscription by identifier", {
                cause: error as unknown as Error,
                operation: "getSubscriptionByIdentifier",
                resource: { type: "table", name: SUBSCRIPTIONS_TABLE },
            });
        }
        return (data as OrganizationSubscriptionRow | null) ?? null;
    }

    async checkSubscriptionByIdentifier(
        organizationId: string,
        identifier: string
    ): Promise<OrganizationSubscriptionRow | null> {
        const { data, error } = await this.supabase
            .from(SUBSCRIPTIONS_TABLE)
            .select(
                "id, organization_id, subscription_tier, period, identifier, cancel_at, channels_per_workspace, is_lifetime, current_period_start, current_period_end, created_at, updated_at, deleted_at"
            )
            .eq("organization_id", organizationId)
            .eq("identifier", identifier)
            .is("deleted_at", null)
            .maybeSingle();

        if (error) {
            throw new DatabaseError("Failed to check subscription identifier", {
                cause: error as unknown as Error,
                operation: "checkSubscriptionByIdentifier",
                resource: { type: "table", name: SUBSCRIPTIONS_TABLE },
            });
        }
        return (data as OrganizationSubscriptionRow | null) ?? null;
    }

    async createOrUpdateSubscription(params: {
        organizationId: string;
        isTrialing: boolean;
        identifier: string;
        subscriptionTier: PaidSubscriptionTier;
        period: SubscriptionPeriod;
        channelsPerWorkspace: number;
        cancelAt: string | null;
        currentPeriodStart?: string | null;
        currentPeriodEnd?: string | null;
        isLifetime?: boolean;
    }): Promise<OrganizationSubscriptionRow> {
        const organizationId = params.organizationId.trim();
        if (!organizationId) {
            throw new DatabaseError("organizationId is required to upsert organization subscription", {
                operation: "createOrUpdateSubscription",
                resource: { type: "table", name: SUBSCRIPTIONS_TABLE },
            });
        }

        const { data, error } = await this.supabase.rpc(
            "internal_upsert_organization_subscription" as never,
            {
                p_organization_id: organizationId,
                p_subscription_tier: params.subscriptionTier,
                p_period: params.period,
                p_identifier: params.identifier,
                p_cancel_at: params.cancelAt,
                p_channels_per_workspace: params.channelsPerWorkspace,
                p_is_lifetime: params.isLifetime ?? false,
                p_is_trialing: params.isTrialing,
                p_current_period_start: params.currentPeriodStart ?? null,
                p_current_period_end: params.currentPeriodEnd ?? null,
            }
        );

        if (error) {
            const pg = error as { code?: string; message?: string; details?: string; hint?: string };
            throw new DatabaseError("Failed to upsert organization subscription", {
                cause: error as unknown as Error,
                operation: "createOrUpdateSubscription",
                resource: { type: "function", name: "internal_upsert_organization_subscription" },
                metadata: {
                    organizationId,
                    subscriptionTier: params.subscriptionTier,
                    ...supabaseErrorMetadata(pg),
                },
            });
        }

        const rows = (Array.isArray(data) ? data : data ? [data] : []) as OrganizationSubscriptionRow[];
        const row = rows[0];
        if (!row) {
            throw new DatabaseError("Failed to upsert organization subscription", {
                cause: new Error("RPC returned no row"),
                operation: "createOrUpdateSubscription",
                resource: { type: "function", name: "internal_upsert_organization_subscription" },
                metadata: { organizationId },
            });
        }

        return row;
    }

    async softDeleteByOrganizationId(organizationId: string): Promise<void> {
        const now = new Date().toISOString();
        const { error } = await this.supabase
            .from(SUBSCRIPTIONS_TABLE)
            .update({ deleted_at: now, updated_at: now })
            .eq("organization_id", organizationId)
            .is("deleted_at", null);

        if (error) {
            throw new DatabaseError("Failed to delete organization subscription", {
                cause: error as unknown as Error,
                operation: "softDeleteByOrganizationId",
                resource: { type: "table", name: SUBSCRIPTIONS_TABLE },
            });
        }
        await this.setTrialing(organizationId, false);
    }

    async softDeleteByStripeCustomerId(customerId: string): Promise<string | null> {
        const org = await this.getOrganizationByStripeCustomerId(customerId);
        if (!org) return null;
        await this.softDeleteByOrganizationId(org.id);
        return org.id;
    }
}
