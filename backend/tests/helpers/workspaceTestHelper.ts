import supertest from "supertest";
import { v4 as uuidv4 } from "uuid";
import { planLimitsForTier } from "openquok-common";

import { app } from "../../app";
import { config } from "../../config/GlobalConfig";
import type { OrganizationSubscriptionRow } from "../../repositories/SubscriptionRepository";
import { subscriptionRepository } from "../../repositories/index";
import { permissionsService, subscriptionService } from "../../services/index";

const apiPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
const usersPath = `${apiPrefix}/users`;
const settingsPath = `${apiPrefix}/settings`;

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
        .spyOn(subscriptionRepository, "getSubscriptionByOrganizationId")
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
    teamInviteCapacitySpy?: jest.SpyInstance;
    workspaceSeatSpy?: jest.SpyInstance;
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
    spies?.teamInviteCapacitySpy?.mockRestore();
    spies?.workspaceSeatSpy?.mockRestore();
}

/** Skip seat-cap RPCs during multi-member setup; RBAC suites assert roles, not billing enforcement. */
export function stubTeamSeatCapacityChecks(): {
    teamInviteCapacitySpy: jest.SpyInstance;
    workspaceSeatSpy: jest.SpyInstance;
} {
    return {
        teamInviteCapacitySpy: jest
            .spyOn(permissionsService, "assertTeamInviteCapacity")
            .mockResolvedValue(undefined),
        workspaceSeatSpy: jest
            .spyOn(permissionsService, "assertWorkspaceHasSeatForNewMember")
            .mockResolvedValue(undefined),
    };
}

export function mockTeamSubscriptionRow(organizationId: string): OrganizationSubscriptionRow {
    const teamLimits = planLimitsForTier("TEAM");
    const createdAt = new Date().toISOString();
    return {
        id: uuidv4(),
        organization_id: organizationId,
        subscription_tier: "TEAM",
        period: "MONTHLY",
        identifier: "test_team_stub",
        cancel_at: null,
        channels_per_workspace: teamLimits.channel_per_workspace,
        is_lifetime: false,
        current_period_start: null,
        current_period_end: null,
        created_at: createdAt,
        updated_at: createdAt,
        deleted_at: null,
    };
}

/** TEAM-tier limits with enough seats for multi-member workspace RBAC flows. */
export function stubTeamPlanLimitsForInvites(): jest.SpyInstance {
    const limits = { ...planLimitsForTier("TEAM"), team_members_per_workspace: 6 };
    return jest.spyOn(permissionsService, "getTierAndLimits").mockImplementation(async (orgId) => ({
        tier: "TEAM",
        limits,
        subscription: mockTeamSubscriptionRow(orgId),
    }));
}

export type TeamWorkspaceSpies = SoloWorkspaceSpies;

/** Enable TEAM billing + limits via spies (no DB seed). Restore in afterEach/finally. */
export function prepareTeamWorkspace(): TeamWorkspaceSpies {
    const seatCapacitySpies = stubTeamSeatCapacityChecks();
    return {
        billingEnabledSpy: stubBillingEnabled(),
        tierLimitsSpy: stubTeamPlanLimitsForInvites(),
        subscriptionLookupSpy: jest
            .spyOn(subscriptionRepository, "getSubscriptionByOrganizationId")
            .mockImplementation(async (organizationId) => mockTeamSubscriptionRow(organizationId)),
        ...seatCapacitySpies,
    };
}

/** GET /settings and return the first organization id (default org after signup). */
export async function getFirstOrganizationId(accessToken: string): Promise<string> {
    const res = await supertest(app)
        .get(settingsPath)
        .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    const first = res.body.data[0];
    expect(first.id).toBeDefined();
    return first.id as string;
}
