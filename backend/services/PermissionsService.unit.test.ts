import { faker } from "@faker-js/faker";
import { planLimitsForTier, pricing, SubscriptionSection } from "openquok-common";
import { SubscriptionError } from "../errors/SubscriptionError";
import type { IntegrationService } from "./IntegrationService";
import type { OrganizationRepository } from "../repositories/OrganizationRepository";
import type { PostsRepository } from "../repositories/PostsRepository";
import type { SubscriptionService } from "./SubscriptionService";
import type { OrganizationSubscriptionRow } from "../repositories/SubscriptionRepository";
import { computePostsBillingMonthStart, PermissionsService } from "./PermissionsService";

jest.mock("../config/GlobalConfig", () => ({
    config: {
        stripe: { publishableKey: "pk_test_123" },
        server: { frontendDomainUrl: "https://app.example.com/" },
    },
}));

const authUserId = faker.string.uuid();
const userId = faker.string.uuid();
const ownedOrgId = faker.string.uuid();
const invitedOrgId = faker.string.uuid();

function soloSubscription(orgId: string): OrganizationSubscriptionRow {
    const now = faker.date.past().toISOString();
    return {
        id: faker.string.uuid(),
        organization_id: orgId,
        subscription_tier: "SOLO",
        period: "MONTHLY",
        identifier: faker.string.alphanumeric(12),
        cancel_at: null,
        channels_per_workspace: pricing.SOLO.channel_per_workspace,
        is_lifetime: false,
        current_period_start: null,
        current_period_end: null,
        created_at: now,
        updated_at: now,
        deleted_at: null,
    };
}

function createPermissionsServiceHarness(params: {
    ownedCount: number;
    invitedCount?: number;
    ownedTier?: keyof typeof pricing;
}): PermissionsService {
    const invitedCount = params.invitedCount ?? 0;
    const ownedTier = params.ownedTier ?? "SOLO";
    const ownedSub = soloSubscription(ownedOrgId);
    const subscriptionService = {
        billingEnabled: jest.fn().mockReturnValue(true),
        getOwnedAccountSubscription: jest.fn().mockResolvedValue(ownedSub),
        resolveOwnedWorkspaceCap: jest.fn().mockImplementation(() => {
            const tier = params.ownedTier ?? "SOLO";
            return planLimitsForTier(tier).workspaces;
        }),
        getEffectiveSubscription: jest.fn().mockImplementation(async (orgId: string) => {
            if (orgId === ownedOrgId) return ownedSub;
            return null;
        }),
        resolveTier: jest.fn().mockImplementation((sub: OrganizationSubscriptionRow | null) => {
            if (sub?.subscription_tier) return sub.subscription_tier;
            return "FREE";
        }),
    } as unknown as SubscriptionService;

    const organizations = [
        ...Array.from({ length: params.ownedCount }, () => ({ id: ownedOrgId })),
        ...Array.from({ length: invitedCount }, () => ({ id: invitedOrgId })),
    ];
    const memberships = [
        ...Array.from({ length: params.ownedCount }, () => ({
            organizationId: ownedOrgId,
            role: "owner",
            disabled: false,
        })),
        ...Array.from({ length: invitedCount }, () => ({
            organizationId: invitedOrgId,
            role: "user",
            disabled: false,
        })),
    ];

    const organizationRepository = {
        findUserIdByAuthId: jest.fn().mockResolvedValue({ userId, error: null }),
        findOrganizationsByUserId: jest.fn().mockResolvedValue({
            organizations,
            memberships,
            error: null,
        }),
    } as unknown as OrganizationRepository;

    const service = new PermissionsService(
        subscriptionService,
        {} as IntegrationService,
        organizationRepository,
        {} as PostsRepository
    );

    // Override tier limits for owned org when testing CREATOR cap.
    jest.spyOn(service, "getTierAndLimits").mockImplementation(async (organizationId: string) => {
        const tier = organizationId === ownedOrgId ? ownedTier : "FREE";
        return {
            tier,
            limits: planLimitsForTier(tier),
            subscription: organizationId === ownedOrgId ? soloSubscription(ownedOrgId) : null,
        };
    });

    return service;
}

describe("computePostsBillingMonthStart", () => {
    it("uses current_period_start for MONTHLY subscriptions", () => {
        const start = new Date("2026-05-01T12:34:56.000Z");
        const got = computePostsBillingMonthStart({
            subscription: {
                id: "sub",
                organization_id: "org",
                subscription_tier: "SOLO",
                period: "MONTHLY",
                identifier: null,
                cancel_at: null,
                channels_per_workspace: 15,
                is_lifetime: false,
                current_period_start: start.toISOString(),
                current_period_end: new Date("2026-06-01T12:34:56.000Z").toISOString(),
                created_at: new Date("2026-01-01T00:00:00.000Z").toISOString(),
                updated_at: new Date("2026-01-01T00:00:00.000Z").toISOString(),
                deleted_at: null,
            },
            organizationCreatedAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
            now: new Date("2026-05-26T00:00:00.000Z"),
        });
        expect(got.toISOString()).toBe(start.toISOString());
    });

    it("anchors YEARLY monthly windows to current_period_start (rolling months)", () => {
        const anchor = new Date("2026-01-10T08:00:00.000Z");
        const got = computePostsBillingMonthStart({
            subscription: {
                id: "sub",
                organization_id: "org",
                subscription_tier: "SOLO",
                period: "YEARLY",
                identifier: null,
                cancel_at: null,
                channels_per_workspace: 15,
                is_lifetime: false,
                current_period_start: anchor.toISOString(),
                current_period_end: new Date("2027-01-10T08:00:00.000Z").toISOString(),
                created_at: new Date("2025-01-01T00:00:00.000Z").toISOString(),
                updated_at: new Date("2025-01-01T00:00:00.000Z").toISOString(),
                deleted_at: null,
            },
            organizationCreatedAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
            now: new Date("2026-03-09T00:00:00.000Z"),
        });
        // Jan-10 anchor → Feb-10 (1 month) → Mar-10 (2 months); on Mar-09 we're still in the Feb-10 window.
        expect(got.toISOString()).toBe(new Date("2026-02-10T08:00:00.000Z").toISOString());
    });

    it("advances YEARLY monthly window after crossing a month boundary", () => {
        const anchor = new Date("2026-01-10T08:00:00.000Z");
        const baseSubscription = {
            id: "sub",
            organization_id: "org",
            subscription_tier: "SOLO" as const,
            period: "YEARLY" as const,
            identifier: null,
            cancel_at: null,
            channels_per_workspace: 15,
            is_lifetime: false,
            current_period_start: anchor.toISOString(),
            current_period_end: new Date("2027-01-10T08:00:00.000Z").toISOString(),
            created_at: new Date("2025-01-01T00:00:00.000Z").toISOString(),
            updated_at: new Date("2025-01-01T00:00:00.000Z").toISOString(),
            deleted_at: null,
        };

        const before = computePostsBillingMonthStart({
            subscription: baseSubscription,
            organizationCreatedAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
            now: new Date("2026-02-10T07:59:59.000Z"),
        });
        expect(before.toISOString()).toBe(anchor.toISOString());

        const after = computePostsBillingMonthStart({
            subscription: baseSubscription,
            organizationCreatedAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
            now: new Date("2026-02-10T08:00:00.000Z"),
        });
        expect(after.toISOString()).toBe(new Date("2026-02-10T08:00:00.000Z").toISOString());
    });
});

describe("PermissionsService.assertCanCreateWorkspace", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("blocks when owned workspace count reaches the owned-plan cap", async () => {
        const service = createPermissionsServiceHarness({ ownedCount: 1, invitedCount: 3 });
        await expect(service.assertCanCreateWorkspace(authUserId)).rejects.toMatchObject({
            section: SubscriptionSection.WORKSPACES,
        });
    });

    it("allows create when invited memberships exceed cap but owned workspaces do not", async () => {
        const service = createPermissionsServiceHarness({
            ownedCount: 1,
            invitedCount: 5,
            ownedTier: "CREATOR",
        });
        await expect(service.assertCanCreateWorkspace(authUserId)).resolves.toBeUndefined();
    });

    it("throws SubscriptionError with workspaces section when at cap", async () => {
        const service = createPermissionsServiceHarness({ ownedCount: 1 });
        await expect(service.assertCanCreateWorkspace(authUserId)).rejects.toBeInstanceOf(
            SubscriptionError
        );
    });

    it("blocks when user has no owned subscription and already owns the free-account cap", async () => {
        const subscriptionService = {
            billingEnabled: jest.fn().mockReturnValue(true),
            getOwnedAccountSubscription: jest.fn().mockResolvedValue(null),
            resolveOwnedWorkspaceCap: jest.fn().mockReturnValue(1),
        } as unknown as SubscriptionService;

        const organizations = [
            { id: faker.string.uuid() },
            { id: faker.string.uuid() },
        ];
        const memberships = organizations.map((org) => ({
            organizationId: org.id,
            role: "owner",
            disabled: false,
        }));

        const organizationRepository = {
            findUserIdByAuthId: jest.fn().mockResolvedValue({ userId, error: null }),
            findOrganizationsByUserId: jest.fn().mockResolvedValue({
                organizations,
                memberships,
                error: null,
            }),
        } as unknown as OrganizationRepository;

        const service = new PermissionsService(
            subscriptionService,
            {} as IntegrationService,
            organizationRepository,
            {} as PostsRepository
        );

        await expect(service.assertCanCreateWorkspace(authUserId)).rejects.toMatchObject({
            section: SubscriptionSection.WORKSPACES,
        });
    });
});

