import { faker } from "@faker-js/faker";

import type { DirectorySeoRepository } from "../repositories/DirectorySeoRepository";
import type { SubscriptionService } from "./SubscriptionService";
import { DirectorySeoService } from "./DirectorySeoService";

jest.mock("../config/GlobalConfig", () => ({
    config: {
        dataforseo: { apiKey: "dGVzdDpzZWNyZXQ=" },
        directorySeo: { enabled: true, cacheTtlHours: 168, weeklyRefreshEnabled: true },
    },
}));

const organizationId = faker.string.uuid();

function createMocks() {
    const directorySeoRepository = {
        countCompetitorsForOrganization: jest.fn(),
        listCompetitorDomainsByOrganization: jest.fn().mockResolvedValue([]),
        listMainProfileWebsiteUrls: jest.fn().mockResolvedValue([
            { organization_id: organizationId, website_url: "https://www.acme.test" },
        ]),
        getSnapshot: jest.fn(),
        upsertSnapshot: jest.fn(),
        getLatestHistory: jest.fn(),
        insertHistory: jest.fn(),
    };

    const subscriptionService = {
        resolveOrganizationPlanTier: jest.fn().mockResolvedValue("SOLO"),
    };

    const backlinksClient = {
        fetchBacklinksSummaryLive: jest.fn().mockResolvedValue({ domainRating: 55 }),
    };

    return { directorySeoRepository, subscriptionService, backlinksClient };
}

describe("DirectorySeoService", () => {
    it("returns cached snapshot when within TTL", async () => {
        const { directorySeoRepository, subscriptionService, backlinksClient } = createMocks();
        const freshCheckedAt = new Date().toISOString();
        directorySeoRepository.getSnapshot.mockResolvedValue({
            domain: "acme.test",
            domain_rating: 40,
            source: "dataforseo",
            checked_at: freshCheckedAt,
        });

        const service = new DirectorySeoService(
            directorySeoRepository as unknown as DirectorySeoRepository,
            subscriptionService as unknown as SubscriptionService,
            backlinksClient
        );

        const row = await service.refreshDomain("https://acme.test");
        expect(row?.domain_rating).toBe(40);
        expect(backlinksClient.fetchBacklinksSummaryLive).not.toHaveBeenCalled();
    });

    it("calls DataForSEO and upserts when cache is stale", async () => {
        const { directorySeoRepository, subscriptionService, backlinksClient } = createMocks();
        const staleCheckedAt = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
        directorySeoRepository.getSnapshot.mockResolvedValue({
            domain: "acme.test",
            domain_rating: 40,
            source: "dataforseo",
            checked_at: staleCheckedAt,
        });
        directorySeoRepository.getLatestHistory.mockResolvedValue(null);
        directorySeoRepository.upsertSnapshot.mockResolvedValue({
            domain: "acme.test",
            domain_rating: 55,
            source: "dataforseo",
            checked_at: new Date().toISOString(),
        });

        const service = new DirectorySeoService(
            directorySeoRepository as unknown as DirectorySeoRepository,
            subscriptionService as unknown as SubscriptionService,
            backlinksClient
        );

        await service.refreshDomain("acme.test");
        expect(backlinksClient.fetchBacklinksSummaryLive).toHaveBeenCalledWith("acme.test");
        expect(directorySeoRepository.upsertSnapshot).toHaveBeenCalled();
        expect(directorySeoRepository.insertHistory).toHaveBeenCalled();
    });

    it("lists entitled domains from main profiles on paid tiers", async () => {
        const { directorySeoRepository, subscriptionService, backlinksClient } = createMocks();
        const service = new DirectorySeoService(
            directorySeoRepository as unknown as DirectorySeoRepository,
            subscriptionService as unknown as SubscriptionService,
            backlinksClient
        );

        const domains = await service.listEntitledDomains();
        expect(domains).toEqual(["acme.test"]);
    });

    it("skips main profile domains when directory SEO is disabled on the plan", async () => {
        const { directorySeoRepository, subscriptionService, backlinksClient } = createMocks();
        subscriptionService.resolveOrganizationPlanTier.mockResolvedValue("FREE");

        const service = new DirectorySeoService(
            directorySeoRepository as unknown as DirectorySeoRepository,
            subscriptionService as unknown as SubscriptionService,
            backlinksClient
        );

        const domains = await service.listEntitledDomains();
        expect(domains).toEqual([]);
    });

    it("runWeeklyRefresh reloads stale domains from the repository and refreshes each", async () => {
        const { directorySeoRepository, subscriptionService, backlinksClient } = createMocks();
        directorySeoRepository.getSnapshot.mockResolvedValue(null);
        directorySeoRepository.getLatestHistory.mockResolvedValue(null);
        directorySeoRepository.upsertSnapshot.mockImplementation(async (input) => ({
            domain: input.domain,
            domain_rating: input.domainRating,
            source: "dataforseo",
            checked_at: input.checkedAt,
        }));

        const service = new DirectorySeoService(
            directorySeoRepository as unknown as DirectorySeoRepository,
            subscriptionService as unknown as SubscriptionService,
            backlinksClient
        );

        const result = await service.runWeeklyRefresh();
        expect(result).toEqual({ attempted: 1, refreshed: 1 });
        expect(backlinksClient.fetchBacklinksSummaryLive).toHaveBeenCalledWith("acme.test");
    });

});
