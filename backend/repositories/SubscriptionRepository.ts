import type { SupabaseClient } from "@supabase/supabase-js";
import type { PaidSubscriptionTier, SubscriptionPeriod } from "openquok-common";
import { DatabaseError } from "../errors/InfraError";

const SUBSCRIPTIONS_TABLE = "organization_subscriptions";
const ORGS_TABLE = "organizations";

export interface OrganizationSubscriptionRow {
    id: string;
    organization_id: string;
    subscription_tier: PaidSubscriptionTier;
    period: SubscriptionPeriod;
    identifier: string | null;
    cancel_at: string | null;
    total_channels: number;
    is_lifetime: boolean;
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
                "id, organization_id, subscription_tier, period, identifier, cancel_at, total_channels, is_lifetime, created_at, updated_at, deleted_at"
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

    async checkSubscriptionByIdentifier(
        organizationId: string,
        identifier: string
    ): Promise<OrganizationSubscriptionRow | null> {
        const { data, error } = await this.supabase
            .from(SUBSCRIPTIONS_TABLE)
            .select(
                "id, organization_id, subscription_tier, period, identifier, cancel_at, total_channels, is_lifetime, created_at, updated_at, deleted_at"
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
        totalChannels: number;
        cancelAt: string | null;
        isLifetime?: boolean;
    }): Promise<OrganizationSubscriptionRow> {
        const now = new Date().toISOString();
        const row = {
            organization_id: params.organizationId,
            subscription_tier: params.subscriptionTier,
            period: params.period,
            identifier: params.identifier,
            cancel_at: params.cancelAt,
            total_channels: params.totalChannels,
            is_lifetime: params.isLifetime ?? false,
            updated_at: now,
            deleted_at: null,
        };

        const { data, error } = await this.supabase
            .from(SUBSCRIPTIONS_TABLE)
            .upsert(row, { onConflict: "organization_id" })
            .select(
                "id, organization_id, subscription_tier, period, identifier, cancel_at, total_channels, is_lifetime, created_at, updated_at, deleted_at"
            )
            .single();

        if (error) {
            throw new DatabaseError("Failed to upsert organization subscription", {
                cause: error as unknown as Error,
                operation: "createOrUpdateSubscription",
                resource: { type: "table", name: SUBSCRIPTIONS_TABLE },
            });
        }

        await this.setTrialing(params.organizationId, params.isTrialing);
        return data as OrganizationSubscriptionRow;
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
