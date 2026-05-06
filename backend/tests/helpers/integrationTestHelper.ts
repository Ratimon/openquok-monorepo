import type { SupabaseClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";

export type InsertTestSocialIntegrationOptions = {
    /** Defaults to a new UUID. */
    integrationId?: string;
    providerIdentifier?: string;
    token?: string;
};

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
    const { error } = await adminSupabase.from("integrations").insert({
        id: integrationId,
        organization_id: organizationId,
        internal_id: `e2e-${faker.string.alphanumeric(12)}`,
        name: faker.company.name(),
        picture: null,
        provider_identifier: options.providerIdentifier ?? "threads",
        type: "social",
        token: options.token ?? "e2e-test-token",
    });
    if (error) {
        throw new Error(`insertTestSocialIntegration failed: ${error.message}`);
    }
    return { integrationId };
}
