import supertest from "supertest";
import { v4 as uuidv4 } from "uuid";
import { planLimitsForTier } from "openquok-common";

import { app } from "../../app";
import { config } from "../../config/GlobalConfig";
import type { OrganizationSubscriptionRow } from "../../repositories/SubscriptionRepository";
import { permissionsService, subscriptionService } from "../../services/index";

const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
const usersPath = `${apiPrefix}/users`;

/** POST /users/change-org — sets active workspace (`showorg` cookie). */
export async function activateWorkspace(
    accessToken: string,
    organizationId: string
): Promise<void> {
    const res = await supertest(app)
        .post(`${usersPath}/change-org`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ id: organizationId });
    expect(res.status).toBe(200);
}

export function mockSoloSubscriptionRow(organizationId: string): OrganizationSubscriptionRow {
    const soloLimits = planLimitsForTier("SOLO");
    const createdAt = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    return {
        id: uuidv4(),
        organization_id: organizationId,
        subscription_tier: "SOLO",
        period: "MONTHLY",
        identifier: "test_checkout_stub",
        cancel_at: null,
        channels_per_workspace: soloLimits.channel_per_workspace,
        is_lifetime: false,
        current_period_start: null,
        current_period_end: null,
        created_at: createdAt,
        updated_at: createdAt,
        deleted_at: null,
    };
}

/** Stub SOLO tier limits for plan enforcement without seeding `organization_subscriptions`. */
export function stubSoloPlanLimits(): jest.SpyInstance {
    const soloLimits = planLimitsForTier("SOLO");
    return jest.spyOn(permissionsService, "getTierAndLimits").mockImplementation(async (orgId) => ({
        tier: "SOLO",
        limits: soloLimits,
        subscription: mockSoloSubscriptionRow(orgId),
    }));
}

/** Stub subscription row reads used by GET /users/subscription and GET /billing/current. */
export function stubSoloSubscriptionLookup(): jest.SpyInstance {
    return jest
        .spyOn(subscriptionService, "getSubscriptionByOrganizationId")
        .mockImplementation(async (organizationId) => mockSoloSubscriptionRow(organizationId));
}

/** Force subscription policy checks on when Stripe publishable key is configured in env. */
export function stubBillingEnabled(): jest.SpyInstance {
    return jest.spyOn(subscriptionService, "billingEnabled").mockReturnValue(true);
}

export type SoloWorkspaceSpies = {
    billingEnabledSpy: jest.SpyInstance;
    tierLimitsSpy: jest.SpyInstance;
    subscriptionLookupSpy: jest.SpyInstance;
};

/** Enable SOLO billing + limits via spies (no DB seed). Restore in afterEach/finally. */
export function prepareSoloWorkspace(): SoloWorkspaceSpies {
    return {
        billingEnabledSpy: stubBillingEnabled(),
        tierLimitsSpy: stubSoloPlanLimits(),
        subscriptionLookupSpy: stubSoloSubscriptionLookup(),
    };
}

export function restoreSoloWorkspaceSpies(spies: SoloWorkspaceSpies | undefined): void {
    spies?.billingEnabledSpy?.mockRestore();
    spies?.tierLimitsSpy?.mockRestore();
    spies?.subscriptionLookupSpy?.mockRestore();
}
