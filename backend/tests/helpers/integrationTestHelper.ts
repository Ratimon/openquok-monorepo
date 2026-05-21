import type { SupabaseClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";

import { cacheServiceConnection } from "../../connections/index";

const DEFAULT_POSTING_TIMES = '[{"time":120},{"time":400},{"time":700}]';

export type InsertTestSocialIntegrationOptions = {
    /** Defaults to a new UUID. */
    integrationId?: string;
    internalId?: string;
    name?: string;
    providerIdentifier?: string;
    token?: string;
};

export type SeedSocialIntegrationsOptions = {
    count: number;
    /** Prefix for `internal_id` values (`{prefix}-0` … `{prefix}-{count-1}`). */
    internalIdPrefix?: string;
    providerIdentifier?: string;
    token?: string;
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

/** TTL for OAuth state keys used by `POST /integrations/social-connect/:integration`. */
export const SOCIAL_CONNECT_OAUTH_STATE_TTL_SEC = 3600;

/**
 * Primes in-memory (or configured) cache with OAuth state required before `social-connect`.
 * Keys match {@link IntegrationConnectionService} `CACHE_KEYS.oauth`.
 */
export async function seedSocialConnectOAuthState(
    cache: { set(key: string, value: unknown, ttl?: number): Promise<boolean> },
    organizationId: string,
    state: string,
    options?: { codeVerifier?: string }
): Promise<void> {
    const verifier = options?.codeVerifier ?? "test-verifier";
    await cache.set(`login:${state}`, verifier, SOCIAL_CONNECT_OAUTH_STATE_TTL_SEC);
    await cache.set(`organization:${state}`, organizationId, SOCIAL_CONNECT_OAUTH_STATE_TTL_SEC);
}

/**
 * Forces OAuth state through an in-process map so `social-connect` tests do not depend on Redis.
 * Restores {@link cacheServiceConnection} spies when `restore()` is called.
 */
export function stubInMemorySocialConnectCache(): { restore: () => void } {
    const store = new Map<string, unknown>();
    const getSpy = jest.spyOn(cacheServiceConnection, "get").mockImplementation(async (key: string) => {
        return store.has(key) ? store.get(key)! : null;
    });
    const setSpy = jest.spyOn(cacheServiceConnection, "set").mockImplementation(async (key, value) => {
        store.set(key, value);
        return true;
    });
    const delSpy = jest.spyOn(cacheServiceConnection, "del").mockImplementation(async (key) => {
        store.delete(key);
        return true;
    });

    return {
        restore: () => {
            getSpy.mockRestore();
            setSpy.mockRestore();
            delSpy.mockRestore();
        },
    };
}
