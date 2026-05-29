import { faker } from "@faker-js/faker";
import {
    planLimitsForTier,
    pricing,
    SubscriptionSection,
    type SubscriptionTier,
} from "openquok-common";
import { SubscriptionError } from "../../errors/SubscriptionError";
import type { IntegrationService } from "../../services/IntegrationService";
import type { OrganizationRepository } from "../../repositories/OrganizationRepository";
import type { PostsRepository } from "../../repositories/PostsRepository";
import type { SubscriptionService } from "../../services/SubscriptionService";
import type { OrganizationSubscriptionRow } from "../../repositories/SubscriptionRepository";
import { computePostsBillingMonthStart } from "./postsBilling";
import { SubscriptionGuardService } from "./SubscriptionGuardService";

jest.mock("../../config/GlobalConfig", () => ({
    config: {
        stripe: { publishableKey: "pk_test_123" },
        server: { frontendDomainUrl: "https://app.example.com/" },
    },
}));

const authUserId = faker.string.uuid();
const userId = faker.string.uuid();
const organizationId = faker.string.uuid();
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

function createGuardHarness(params: {
    ownedCount?: number;
    invitedCount?: number;
    ownedTier?: keyof typeof pricing;
    workspaceTier?: SubscriptionTier;
    billingEnabled?: boolean;
    postsCount?: number;
}): SubscriptionGuardService {
    const ownedCount = params.ownedCount ?? 0;
    const invitedCount = params.invitedCount ?? 0;
    const ownedTier = params.ownedTier ?? "SOLO";
    const workspaceTier = params.workspaceTier ?? "FREE";
    const ownedSub = soloSubscription(ownedOrgId);

    const subscriptionService = {
        billingEnabled: jest.fn().mockReturnValue(params.billingEnabled ?? true),
        getOwnedAccountSubscription: jest.fn().mockResolvedValue(ownedSub),
        resolveOwnedWorkspaceCap: jest.fn().mockImplementation(() => {
            return planLimitsForTier(ownedTier).workspaces;
        }),
        getEffectiveSubscription: jest.fn().mockImplementation(async (orgId: string) => {
            if (orgId === ownedOrgId) return ownedSub;
            return null;
        }),
        resolveTier: jest.fn().mockImplementation((sub: OrganizationSubscriptionRow | null) => {
            if (sub?.subscription_tier) return sub.subscription_tier;
            return "FREE";
        }),
        resolveOrganizationPlanTier: jest.fn().mockResolvedValue(workspaceTier),
        getWorkspaceDriveUsage: jest.fn(),
    } as unknown as SubscriptionService;

    const organizations = [
        ...Array.from({ length: ownedCount }, () => ({ id: ownedOrgId })),
        ...Array.from({ length: invitedCount }, () => ({ id: invitedOrgId })),
    ];
    const memberships = [
        ...Array.from({ length: ownedCount }, () => ({
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
        findOrganizationById: jest.fn().mockResolvedValue({
            organization: { created_at: new Date("2026-01-01T00:00:00.000Z").toISOString() },
            error: null,
        }),
        getMemberCounts: jest.fn(),
        countPendingInvitesByOrganization: jest.fn(),
    } as unknown as OrganizationRepository;

    const postsRepository = {
        countPostsFromDay: jest.fn().mockResolvedValue(params.postsCount ?? 0),
    } as unknown as PostsRepository;

    const guard = new SubscriptionGuardService(
        subscriptionService,
        {} as IntegrationService,
        organizationRepository,
        postsRepository
    );

    jest.spyOn(guard, "getTierAndLimits").mockImplementation(async (orgId: string) => {
        const tier =
            orgId === ownedOrgId ? ownedTier : orgId === organizationId ? workspaceTier : "FREE";
        return {
            tier,
            limits: planLimitsForTier(tier),
            subscription: orgId === ownedOrgId ? soloSubscription(ownedOrgId) : null,
        };
    });

    return guard;
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

describe("SubscriptionGuardService WORKSPACES", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("blocks when owned workspace count reaches the owned-plan cap", async () => {
        const guard = createGuardHarness({ ownedCount: 1, invitedCount: 3 });
        await expect(
            guard.assert(SubscriptionSection.WORKSPACES, { scope: "account", authUserId })
        ).rejects.toMatchObject({
            section: SubscriptionSection.WORKSPACES,
        });
    });

    it("allows create when invited memberships exceed cap but owned workspaces do not", async () => {
        const guard = createGuardHarness({
            ownedCount: 1,
            invitedCount: 5,
            ownedTier: "TEAM",
        });
        await expect(
            guard.assert(SubscriptionSection.WORKSPACES, { scope: "account", authUserId })
        ).resolves.toBeUndefined();
    });

    it("throws SubscriptionError with workspaces section when at cap", async () => {
        const guard = createGuardHarness({ ownedCount: 1 });
        await expect(
            guard.assert(SubscriptionSection.WORKSPACES, { scope: "account", authUserId })
        ).rejects.toBeInstanceOf(SubscriptionError);
    });

    it("blocks when user has no owned subscription and already owns the free-account cap", async () => {
        const subscriptionService = {
            billingEnabled: jest.fn().mockReturnValue(true),
            getOwnedAccountSubscription: jest.fn().mockResolvedValue(null),
            resolveOwnedWorkspaceCap: jest.fn().mockReturnValue(1),
        } as unknown as SubscriptionService;

        const organizations = [{ id: faker.string.uuid() }, { id: faker.string.uuid() }];
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

        const guard = new SubscriptionGuardService(
            subscriptionService,
            {} as IntegrationService,
            organizationRepository,
            {} as PostsRepository
        );

        await expect(
            guard.assert(SubscriptionSection.WORKSPACES, { scope: "account", authUserId })
        ).rejects.toMatchObject({
            section: SubscriptionSection.WORKSPACES,
        });
    });
});

describe("SubscriptionGuardService POSTS_PER_MONTH", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("allows zero rows to add without counting", async () => {
        const guard = createGuardHarness({ workspaceTier: "FREE" });
        await expect(
            guard.assert(SubscriptionSection.POSTS_PER_MONTH, {
                scope: "workspaceWithDelta",
                organizationId,
                delta: 0,
            })
        ).resolves.toBeUndefined();
    });

    it("blocks scheduling when FREE posts_per_month cap is 0", async () => {
        const guard = createGuardHarness({ workspaceTier: "FREE" });
        await expect(
            guard.assert(SubscriptionSection.POSTS_PER_MONTH, {
                scope: "workspaceWithDelta",
                organizationId,
                delta: 1,
            })
        ).rejects.toMatchObject({
            section: SubscriptionSection.POSTS_PER_MONTH,
        });
    });

    it("allows a post when under the SOLO monthly cap", async () => {
        const guard = createGuardHarness({ workspaceTier: "SOLO", postsCount: 0 });
        await expect(
            guard.assert(SubscriptionSection.POSTS_PER_MONTH, {
                scope: "workspaceWithDelta",
                organizationId,
                delta: 1,
            })
        ).resolves.toBeUndefined();
    });

    it("blocks when usage plus delta would exceed the SOLO cap", async () => {
        const cap = pricing.SOLO.posts_per_month;
        const guard = createGuardHarness({ workspaceTier: "SOLO", postsCount: cap });
        await expect(
            guard.assert(SubscriptionSection.POSTS_PER_MONTH, {
                scope: "workspaceWithDelta",
                organizationId,
                delta: 1,
            })
        ).rejects.toMatchObject({
            section: SubscriptionSection.POSTS_PER_MONTH,
        });
    });
});

describe("SubscriptionGuardService boolean and role gates", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("blocks PUBLIC_API on FREE tier", async () => {
        const guard = createGuardHarness({ workspaceTier: "FREE" });
        await expect(
            guard.assert(SubscriptionSection.PUBLIC_API, {
                scope: "workspace",
                organizationId,
                workspaceRole: "owner",
            })
        ).rejects.toMatchObject({
            section: SubscriptionSection.PUBLIC_API,
        });
    });

    it("allows PUBLIC_API on SOLO tier", async () => {
        const guard = createGuardHarness({ workspaceTier: "SOLO" });
        await expect(
            guard.assert(SubscriptionSection.PUBLIC_API, {
                scope: "workspace",
                organizationId,
                workspaceRole: "owner",
            })
        ).resolves.toBeUndefined();
    });

    it("blocks ADMIN when workspace role is not admin or owner", async () => {
        const guard = createGuardHarness({ workspaceTier: "SOLO" });
        await expect(
            guard.assert(SubscriptionSection.ADMIN, {
                scope: "workspace",
                organizationId,
                workspaceRole: "user",
            })
        ).rejects.toMatchObject({
            section: SubscriptionSection.ADMIN,
        });
    });

    it("skips enforcement when billing is disabled", async () => {
        const guard = createGuardHarness({
            ownedCount: 5,
            workspaceTier: "FREE",
            billingEnabled: false,
        });
        await expect(
            guard.assert(SubscriptionSection.PUBLIC_API, {
                scope: "workspace",
                organizationId,
                workspaceRole: "owner",
            })
        ).resolves.toBeUndefined();
        await expect(
            guard.assert(SubscriptionSection.WORKSPACES, { scope: "account", authUserId })
        ).resolves.toBeUndefined();
        await expect(
            guard.assert(SubscriptionSection.POSTS_PER_MONTH, {
                scope: "workspaceWithDelta",
                organizationId,
                delta: 1,
            })
        ).resolves.toBeUndefined();
    });
});
