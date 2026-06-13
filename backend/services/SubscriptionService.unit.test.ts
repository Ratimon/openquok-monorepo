/// <reference types="jest" />
import { faker } from "@faker-js/faker";
import {
    pricing,
    SubscriptionSection,
    type PaidSubscriptionTier,
} from "openquok-common";

// import { SubscriptionError } from "../errors/SubscriptionError";
import type { MediaRepository } from "../repositories/MediaRepository";
import type { OrganizationRepository } from "../repositories/OrganizationRepository";
import type {
    OrganizationSubscriptionRow,
    SubscriptionRepository,
} from "../repositories/SubscriptionRepository";
import type { IntegrationService } from "./IntegrationService";
import type { PostsRepository } from "../repositories/PostsRepository";
import { SubscriptionGuardService } from "../guards/subscription/SubscriptionGuardService";
import { SubscriptionService } from "./SubscriptionService";

jest.mock("../config/GlobalConfig", () => ({
    config: {
        stripe: { publishableKey: "pk_test_123" },
        server: { frontendDomainUrl: "https://app.example.com/" },
    },
}));

const organizationId = faker.string.uuid();
const billingOrganizationId = faker.string.uuid();
const authUserId = faker.string.uuid();
const userId = faker.string.uuid();

function subscriptionRow(
    tier: PaidSubscriptionTier = "SOLO",
    overrides: Partial<OrganizationSubscriptionRow> = {}
): OrganizationSubscriptionRow {
    const now = faker.date.past().toISOString();
    return {
        id: faker.string.uuid(),
        organization_id: organizationId,
        subscription_tier: tier,
        period: "MONTHLY",
        identifier: faker.string.alphanumeric(12),
        cancel_at: null,
        channels_per_workspace: pricing[tier].channel_per_workspace,
        is_lifetime: false,
        current_period_start: null,
        current_period_end: null,
        created_at: now,
        updated_at: now,
        deleted_at: null,
        ...overrides,
    };
}

function createMockSubscriptionRepo(): jest.Mocked<SubscriptionRepository> {
    return {
        getSubscriptionByOrganizationId: jest.fn(),
        createOrUpdateSubscription: jest.fn(),
        softDeleteByStripeCustomerId: jest.fn(),
    } as unknown as jest.Mocked<SubscriptionRepository>;
}

function createMockMediaRepo(): jest.Mocked<MediaRepository> {
    return {
        listAllMedia: jest.fn(),
    } as unknown as jest.Mocked<MediaRepository>;
}

function createMockOrganizationRepo(): jest.Mocked<
    Pick<OrganizationRepository, "findUserIdByAuthId" | "findOrganizationsByUserId">
> {
    return {
        findUserIdByAuthId: jest.fn(),
        findOrganizationsByUserId: jest.fn(),
    };
}

function createService(
    subscriptionRepo: jest.Mocked<SubscriptionRepository>,
    mediaRepo: jest.Mocked<MediaRepository>,
    organizationRepo: jest.Mocked<
        Pick<OrganizationRepository, "findUserIdByAuthId" | "findOrganizationsByUserId">
    >
): SubscriptionService {
    const service = new SubscriptionService(
        subscriptionRepo,
        mediaRepo,
        organizationRepo as unknown as OrganizationRepository
    );
    const guard = new SubscriptionGuardService(
        service,
        {} as IntegrationService,
        organizationRepo as unknown as OrganizationRepository,
        {} as PostsRepository,
        { isPlatformAdmin: jest.fn().mockResolvedValue(false) } as never
    );
    service.setSubscriptionGuard(guard);
    return service;
}

function mockGlobalConfig(): { config: { stripe: { publishableKey?: string } } } {
    return jest.requireMock("../config/GlobalConfig") as {
        config: { stripe: { publishableKey?: string } };
    };
}

function setBillingEnabled(enabled: boolean): void {
    mockGlobalConfig().config.stripe.publishableKey = enabled ? "pk_test_123" : "";
}

describe("SubscriptionService", () => {
    let subscriptionRepo: jest.Mocked<SubscriptionRepository>;
    let mediaRepo: jest.Mocked<MediaRepository>;
    let organizationRepo: jest.Mocked<
        Pick<OrganizationRepository, "findUserIdByAuthId" | "findOrganizationsByUserId">
    >;

    beforeEach(() => {
        subscriptionRepo = createMockSubscriptionRepo();
        mediaRepo = createMockMediaRepo();
        organizationRepo = createMockOrganizationRepo();
        setBillingEnabled(true);
    });

    describe("billingEnabled", () => {
        it("returns true when Stripe publishable key is configured", () => {
            const service = createService(subscriptionRepo, mediaRepo, organizationRepo);
            expect(service.billingEnabled()).toBe(true);
        });

        it("returns false when publishable key is missing", () => {
            setBillingEnabled(false);
            const service = createService(subscriptionRepo, mediaRepo, organizationRepo);
            expect(service.billingEnabled()).toBe(false);
        });
    });

    describe("resolveOrganizationPlanTier", () => {
        it("returns the workspace tier from its direct subscription row", async () => {
            (subscriptionRepo.getSubscriptionByOrganizationId as jest.Mock).mockResolvedValue(
                subscriptionRow("SOLO", { organization_id: organizationId })
            );
            const service = createService(subscriptionRepo, mediaRepo, organizationRepo);
            await expect(service.resolveOrganizationPlanTier(organizationId)).resolves.toBe("SOLO");
        });

        it("returns FREE when the workspace has no subscription row", async () => {
            (subscriptionRepo.getSubscriptionByOrganizationId as jest.Mock).mockResolvedValue(null);
            const service = createService(subscriptionRepo, mediaRepo, organizationRepo);
            await expect(service.resolveOrganizationPlanTier(organizationId)).resolves.toBe("FREE");
        });
    });

    describe("getEffectiveSubscription", () => {
        it("returns the workspace subscription when present", async () => {
            const row = subscriptionRow("TEAM", { organization_id: organizationId });
            (subscriptionRepo.getSubscriptionByOrganizationId as jest.Mock).mockResolvedValue(row);
            const service = createService(subscriptionRepo, mediaRepo, organizationRepo);
            await expect(service.getEffectiveSubscription(organizationId, authUserId)).resolves.toBe(row);
            expect(organizationRepo.findUserIdByAuthId).not.toHaveBeenCalled();
        });

        it("inherits the account subscription for another workspace within the plan cap", async () => {
            const billingRow = subscriptionRow("TEAM", { organization_id: billingOrganizationId });
            (subscriptionRepo.getSubscriptionByOrganizationId as jest.Mock).mockImplementation(
                async (orgId: string) => (orgId === billingOrganizationId ? billingRow : null)
            );
            (organizationRepo.findUserIdByAuthId as jest.Mock).mockResolvedValue({ userId, error: null });
            (organizationRepo.findOrganizationsByUserId as jest.Mock).mockResolvedValue({
                organizations: [{ id: billingOrganizationId }, { id: organizationId }],
                memberships: [
                    { organizationId: billingOrganizationId, role: "owner", disabled: false },
                    { organizationId: organizationId, role: "owner", disabled: false },
                ],
                error: null,
            });
            const service = createService(subscriptionRepo, mediaRepo, organizationRepo);
            await expect(service.getEffectiveSubscription(organizationId, authUserId)).resolves.toBe(
                billingRow
            );
        });

        it("returns null when the account exceeds the plan workspace cap", async () => {
            const billingRow = subscriptionRow("SOLO", { organization_id: billingOrganizationId });
            (subscriptionRepo.getSubscriptionByOrganizationId as jest.Mock).mockImplementation(
                async (orgId: string) => (orgId === billingOrganizationId ? billingRow : null)
            );
            (organizationRepo.findUserIdByAuthId as jest.Mock).mockResolvedValue({ userId, error: null });
            (organizationRepo.findOrganizationsByUserId as jest.Mock).mockResolvedValue({
                organizations: [
                    { id: billingOrganizationId },
                    { id: organizationId },
                    { id: faker.string.uuid() },
                ],
                // Cap is SOLO=1 workspaces, so owning 2+ organizations should return null.
                memberships: [
                    { organizationId: billingOrganizationId, role: "owner", disabled: false },
                    { organizationId: organizationId, role: "owner", disabled: false },
                    { organizationId: faker.string.uuid(), role: "user", disabled: false },
                ],
                error: null,
            });
            const service = createService(subscriptionRepo, mediaRepo, organizationRepo);
            await expect(service.getEffectiveSubscription(organizationId, authUserId)).resolves.toBeNull();
        });

        it("getOwnedAccountSubscription returns null when user only has member access to a paid org", async () => {
            const ultimateRow = subscriptionRow("ULTIMATE", { organization_id: billingOrganizationId });
            (subscriptionRepo.getSubscriptionByOrganizationId as jest.Mock).mockImplementation(
                async (orgId: string) => (orgId === billingOrganizationId ? ultimateRow : null)
            );
            (organizationRepo.findUserIdByAuthId as jest.Mock).mockResolvedValue({ userId, error: null });
            (organizationRepo.findOrganizationsByUserId as jest.Mock).mockResolvedValue({
                organizations: [{ id: billingOrganizationId }, { id: organizationId }],
                memberships: [
                    { organizationId: billingOrganizationId, role: "user", disabled: false },
                    { organizationId: organizationId, role: "owner", disabled: false },
                ],
                error: null,
            });
            const service = createService(subscriptionRepo, mediaRepo, organizationRepo);
            await expect(service.getOwnedAccountSubscription(authUserId)).resolves.toBeNull();
        });

        it("does not inherit subscription into a workspace the user does not own", async () => {
            const ultimateRow = subscriptionRow("ULTIMATE", { organization_id: billingOrganizationId });
            (subscriptionRepo.getSubscriptionByOrganizationId as jest.Mock).mockImplementation(
                async (orgId: string) => (orgId === billingOrganizationId ? ultimateRow : null)
            );
            (organizationRepo.findUserIdByAuthId as jest.Mock).mockResolvedValue({ userId, error: null });
            (organizationRepo.findOrganizationsByUserId as jest.Mock).mockResolvedValue({
                organizations: [{ id: billingOrganizationId }, { id: organizationId }],
                memberships: [
                    // User is only a member of the billing org, not an owner
                    { organizationId: billingOrganizationId, role: "user", disabled: false },
                    // They own the target org (new personal org) but it has no subscription row
                    { organizationId: organizationId, role: "owner", disabled: false },
                ],
                error: null,
            });
            const service = createService(subscriptionRepo, mediaRepo, organizationRepo);
            await expect(service.getEffectiveSubscription(organizationId, authUserId)).resolves.toBeNull();
        });
    });

    describe("resolveOwnedWorkspaceCap", () => {
        it("returns 1 when billing is enabled and there is no owned subscription", () => {
            const service = createService(subscriptionRepo, mediaRepo, organizationRepo);
            expect(service.resolveOwnedWorkspaceCap(null)).toBe(1);
        });

        it("returns the paid plan workspace cap when the user has an owned subscription", () => {
            const service = createService(subscriptionRepo, mediaRepo, organizationRepo);
            expect(service.resolveOwnedWorkspaceCap(subscriptionRow("TEAM"))).toBe(
                pricing.TEAM.workspaces
            );
            expect(service.resolveOwnedWorkspaceCap(subscriptionRow("MAX"))).toBe(
                pricing.MAX.workspaces
            );
        });

        it("returns SOLO cap when billing is disabled", () => {
            setBillingEnabled(false);
            const service = createService(subscriptionRepo, mediaRepo, organizationRepo);
            expect(service.resolveOwnedWorkspaceCap(null)).toBe(pricing.SOLO.workspaces);
        });
    });

    describe("resolveTier", () => {
        it("uses subscription tier when present", () => {
            const service = createService(subscriptionRepo, mediaRepo, organizationRepo);
            expect(service.resolveTier(subscriptionRow("TEAM"))).toBe("TEAM");
        });

        it("returns SOLO when billing is disabled and no subscription", () => {
            setBillingEnabled(false);
            const service = createService(subscriptionRepo, mediaRepo, organizationRepo);
            expect(service.resolveTier(null)).toBe("SOLO");
        });

        it("returns FREE when billing is enabled and no subscription", () => {
            const service = createService(subscriptionRepo, mediaRepo, organizationRepo);
            expect(service.resolveTier(null)).toBe("FREE");
        });
    });

    describe("getPlanLimitsForOrganization", () => {
        it("returns limits for the resolved tier", () => {
            const service = createService(subscriptionRepo, mediaRepo, organizationRepo);
            expect(service.getPlanLimitsForOrganization(subscriptionRow("ULTIMATE"))).toEqual(
                pricing.ULTIMATE
            );
            expect(service.getPlanLimitsForOrganization(subscriptionRow("MAX"))).toEqual(pricing.MAX);
        });
    });

    describe("getWorkspaceDriveUsage", () => {
        it("sums media sizes and uses plan quota as total", async () => {
            (subscriptionRepo.getSubscriptionByOrganizationId as jest.Mock).mockResolvedValue(
                subscriptionRow("SOLO")
            );
            (mediaRepo.listAllMedia as jest.Mock).mockResolvedValue([
                { size: 1000 },
                { size: 2500 },
                { size: undefined },
            ]);
            const service = createService(subscriptionRepo, mediaRepo, organizationRepo);
            const usage = await service.getWorkspaceDriveUsage(organizationId);
            expect(usage.used).toBe(3500);
            expect(usage.tier).toBe("SOLO");
            expect(usage.total).toBe(pricing.SOLO.media_storage_bytes_per_workspace);
        });

        it("uses at least used bytes when usage exceeds plan quota", async () => {
            const quota = pricing.SOLO.media_storage_bytes_per_workspace;
            (subscriptionRepo.getSubscriptionByOrganizationId as jest.Mock).mockResolvedValue(
                subscriptionRow("SOLO")
            );
            (mediaRepo.listAllMedia as jest.Mock).mockResolvedValue([{ size: quota + 1 }]);
            const service = createService(subscriptionRepo, mediaRepo, organizationRepo);
            const usage = await service.getWorkspaceDriveUsage(organizationId);
            expect(usage.total).toBe(quota + 1);
        });

        it("uses SOLO plan quota when billing is disabled and there is no subscription row", async () => {
            setBillingEnabled(false);
            (subscriptionRepo.getSubscriptionByOrganizationId as jest.Mock).mockResolvedValue(null);
            (mediaRepo.listAllMedia as jest.Mock).mockResolvedValue([]);
            const service = createService(subscriptionRepo, mediaRepo, organizationRepo);
            const usage = await service.getWorkspaceDriveUsage(organizationId);
            expect(usage.tier).toBe("SOLO");
            expect(usage.total).toBe(pricing.SOLO.media_storage_bytes_per_workspace);
        });
    });

    describe("assertMediaStorageAvailable", () => {
        it("throws SubscriptionError when upload would exceed quota", async () => {
            const quota = pricing.SOLO.media_storage_bytes_per_workspace;
            (subscriptionRepo.getSubscriptionByOrganizationId as jest.Mock).mockResolvedValue(
                subscriptionRow("SOLO")
            );
            (mediaRepo.listAllMedia as jest.Mock).mockResolvedValue([{ size: quota }]);
            const service = createService(subscriptionRepo, mediaRepo, organizationRepo);
            await expect(service.assertMediaStorageAvailable(organizationId, 1)).rejects.toMatchObject({
                name: "SubscriptionError",
                statusCode: 402,
                section: SubscriptionSection.MEDIA_STORAGE_BYTES_PER_WORKSPACE,
                billingUrl: "https://app.example.com/account/billing",
            });
        });

        it("allows upload when within quota", async () => {
            (subscriptionRepo.getSubscriptionByOrganizationId as jest.Mock).mockResolvedValue(
                subscriptionRow("SOLO")
            );
            (mediaRepo.listAllMedia as jest.Mock).mockResolvedValue([{ size: 100 }]);
            const service = createService(subscriptionRepo, mediaRepo, organizationRepo);
            await expect(
                service.assertMediaStorageAvailable(organizationId, 100)
            ).resolves.toBeUndefined();
        });
    });

    describe("createOrUpdateFromStripe", () => {
        it("delegates to the subscription repository", async () => {
            const row = subscriptionRow("MAX");
            (subscriptionRepo.createOrUpdateSubscription as jest.Mock).mockResolvedValue(row);
            const service = createService(subscriptionRepo, mediaRepo, organizationRepo);
            const result = await service.createOrUpdateFromStripe({
                organizationId,
                isTrialing: true,
                identifier: "checkout-abc",
                subscriptionTier: "MAX",
                period: "YEARLY",
                channelsPerWorkspace: pricing.MAX.channel_per_workspace,
                cancelAt: null,
            });
            expect(subscriptionRepo.createOrUpdateSubscription).toHaveBeenCalledWith({
                organizationId,
                isTrialing: true,
                identifier: "checkout-abc",
                subscriptionTier: "MAX",
                period: "YEARLY",
                channelsPerWorkspace: pricing.MAX.channel_per_workspace,
                cancelAt: null,
                currentPeriodStart: null,
                currentPeriodEnd: null,
            });
            expect(result).toBe(row);
        });
    });

    describe("deleteSubscriptionForCustomer", () => {
        it("soft-deletes by Stripe customer id", async () => {
            const customerId = "cus_test";
            const service = createService(subscriptionRepo, mediaRepo, organizationRepo);
            await service.deleteSubscriptionForCustomer(customerId);
            expect(subscriptionRepo.softDeleteByStripeCustomerId).toHaveBeenCalledWith(customerId);
        });
    });

    describe("grantPaidSubscriptionForAdmin", () => {
        it("creates a paid subscription with plan channel limits", async () => {
            const row = subscriptionRow("TEAM", { period: "YEARLY" });
            (subscriptionRepo.createOrUpdateSubscription as jest.Mock).mockResolvedValue(row);
            const service = createService(subscriptionRepo, mediaRepo, organizationRepo);
            const result = await service.grantPaidSubscriptionForAdmin({
                organizationId,
                subscriptionTier: "TEAM",
                period: "YEARLY",
            });
            expect(subscriptionRepo.createOrUpdateSubscription).toHaveBeenCalledWith(
                expect.objectContaining({
                    organizationId,
                    subscriptionTier: "TEAM",
                    period: "YEARLY",
                    channelsPerWorkspace: pricing.TEAM.channel_per_workspace,
                    isTrialing: false,
                    cancelAt: null,
                })
            );
            expect(result).toBe(row);
        });

        it("supports granting the MAX tier", async () => {
            const row = subscriptionRow("MAX");
            (subscriptionRepo.createOrUpdateSubscription as jest.Mock).mockResolvedValue(row);
            const service = createService(subscriptionRepo, mediaRepo, organizationRepo);
            await service.grantPaidSubscriptionForAdmin({
                organizationId,
                subscriptionTier: "MAX",
            });
            expect(subscriptionRepo.createOrUpdateSubscription).toHaveBeenCalledWith(
                expect.objectContaining({
                    organizationId,
                    subscriptionTier: "MAX",
                    channelsPerWorkspace: pricing.MAX.channel_per_workspace,
                })
            );
        });
    });
});
