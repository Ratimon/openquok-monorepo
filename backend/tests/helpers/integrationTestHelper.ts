import type { SupabaseClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";
import type { PaidSubscriptionTier, SubscriptionPeriod } from "openquok-common";
import { v4 as uuidv4 } from "uuid";

const DEFAULT_POSTING_TIMES = '[{"time":120},{"time":400},{"time":700}]';

export type InsertTestSocialIntegrationOptions = {
    /** Defaults to a new UUID. */
    integrationId?: string;
    internalId?: string;
    name?: string;
    providerIdentifier?: string;
    token?: string;
};

export type AttachOrganizationSubscriptionOptions = {
    tier: PaidSubscriptionTier;
    period?: SubscriptionPeriod;
    identifier?: string;
    totalChannels?: number;
    isLifetime?: boolean;
};

export type SeedSocialIntegrationsOptions = {
    count: number;
    /** Prefix for `internal_id` values (`{prefix}-0` … `{prefix}-{count-1}`). */
    internalIdPrefix?: string;
    providerIdentifier?: string;
    token?: string;
};

export type SeedMediaStorageUsageOptions = {
    /** Sum of `file_size` for seeded rows (simulates workspace drive usage). */
    usedBytes: number;
    /** Prefix for object keys and display names. */
    keyPrefix?: string;
};

function buildTestSocialIntegrationInsertRow(params: {
    organizationId: string;
    internalId: string;
    integrationId?: string;
    name?: string;
    providerIdentifier?: string;
    token?: string;
    timestamp?: string;
}): Record<string, unknown> {
    const now = params.timestamp ?? new Date().toISOString();
    return {
        ...(params.integrationId ? { id: params.integrationId } : {}),
        organization_id: params.organizationId,
        internal_id: params.internalId,
        name: params.name ?? faker.company.name(),
        picture: null,
        provider_identifier: params.providerIdentifier ?? "threads",
        type: "social",
        token: params.token ?? "e2e-test-token",
        disabled: false,
        token_expiration: null,
        refresh_token: null,
        profile: null,
        deleted_at: null,
        created_at: now,
        updated_at: now,
        in_between_steps: false,
        refresh_needed: false,
        posting_times: DEFAULT_POSTING_TIMES,
        custom_instance_details: null,
        customer_id: null,
        root_internal_id: params.internalId,
        additional_settings: "[]",
    };
}

/**
 * Inserts a minimal `integrations` row (simulates a connected social account) for E2E/integration tests.
 * Uses service-role Supabase client.
 */
export async function insertTestSocialIntegration(
    adminSupabase: SupabaseClient,
    organizationId: string,
    options: InsertTestSocialIntegrationOptions = {}
): Promise<{ integrationId: string }> {
    const integrationId = options.integrationId ?? faker.string.uuid();
    const internalId = options.internalId ?? `e2e-${faker.string.alphanumeric(12)}`;
    const row = buildTestSocialIntegrationInsertRow({
        organizationId,
        integrationId,
        internalId,
        name: options.name,
        providerIdentifier: options.providerIdentifier,
        token: options.token,
    });
    const { error } = await adminSupabase.from("integrations").insert(row);
    if (error) {
        throw new Error(`insertTestSocialIntegration failed: ${error.message}`);
    }
    return { integrationId };
}

/**
 * Upserts a paid `organization_subscriptions` row for plan-limit integration tests.
 */
export async function attachOrganizationSubscription(
    adminSupabase: SupabaseClient,
    organizationId: string,
    options: AttachOrganizationSubscriptionOptions
): Promise<void> {
    const { error } = await adminSupabase.from("organization_subscriptions").upsert(
        {
            organization_id: organizationId,
            subscription_tier: options.tier,
            period: options.period ?? "MONTHLY",
            identifier: options.identifier ?? `test_checkout_${uuidv4()}`,
            cancel_at: null,
            total_channels: options.totalChannels ?? 0,
            is_lifetime: options.isLifetime ?? false,
            deleted_at: null,
        },
        { onConflict: "organization_id" }
    );
    if (error) {
        throw new Error(`attachOrganizationSubscription failed: ${error.message}`);
    }
}

/** Convenience wrapper for SOLO-tier subscription rows. */
export async function attachSoloSubscription(
    adminSupabase: SupabaseClient,
    organizationId: string
): Promise<void> {
    await attachOrganizationSubscription(adminSupabase, organizationId, { tier: "SOLO" });
}

/**
 * Inserts `count` connected social channels for a workspace (e.g. fill `channel_per_workspace` before a cap test).
 * Returns `internal_id` values for reconnect / anchor assertions.
 */
export async function seedSocialIntegrations(
    adminSupabase: SupabaseClient,
    organizationId: string,
    options: SeedSocialIntegrationsOptions
): Promise<{ internalIds: string[] }> {
    const prefix = options.internalIdPrefix ?? "test-channel";
    const now = new Date().toISOString();
    const internalIds = Array.from({ length: options.count }, (_, i) => `${prefix}-${i}`);
    const rows = internalIds.map((internalId, i) =>
        buildTestSocialIntegrationInsertRow({
            organizationId,
            internalId,
            name: `Test channel ${i}`,
            providerIdentifier: options.providerIdentifier,
            token: options.token ?? "test-token",
            timestamp: now,
        })
    );
    const { error } = await adminSupabase.from("integrations").insert(rows);
    if (error) {
        throw new Error(`seedSocialIntegrations failed: ${error.message}`);
    }
    return { internalIds };
}

/** Postgres `media.file_size` is INT4; SOLO quota (5 GiB) must be split across rows. */
const MEDIA_FILE_SIZE_INT_MAX = 2_147_483_647;

/**
 * Inserts minimal `media` rows whose combined `file_size` simulates workspace drive usage.
 */
export async function seedMediaStorageUsage(
    adminSupabase: SupabaseClient,
    organizationId: string,
    options: SeedMediaStorageUsageOptions
): Promise<void> {
    const prefix = options.keyPrefix ?? "test-media-storage";
    const rows: Record<string, unknown>[] = [];
    let remaining = options.usedBytes;
    let index = 0;

    while (remaining > 0) {
        const chunk = Math.min(remaining, MEDIA_FILE_SIZE_INT_MAX);
        const path = `${prefix}/${uuidv4()}-${index}.bin`;
        rows.push({
            organization_id: organizationId,
            name: path.split("/").pop() ?? path,
            original_name: `${prefix}-${index}.bin`,
            path,
            virtual_path: "/General",
            file_size: chunk,
            type: "image",
        });
        remaining -= chunk;
        index += 1;
    }

    const { error } = await adminSupabase.from("media").insert(rows);
    if (error) {
        throw new Error(`seedMediaStorageUsage failed: ${error.message}`);
    }
}
