import { faker } from "@faker-js/faker";

import * as dataforseoClient from "../connections/dataforseo/dataforseoClient";
import type { DirectorySeoRepository } from "../repositories/DirectorySeoRepository";
import type { SubscriptionService } from "./SubscriptionService";
import { DirectorySeoService } from "./DirectorySeoService";

jest.mock("../config/GlobalConfig", () => ({
    config: {
        dataforseo: { apiKey: "dGVzdDpzZWNyZXQ=" },
        directorySeo: {
            enabled: true,
            cacheTtlHours: 168,
            weeklyRefreshEnabled: true,
            historyBackfillMaxDays: 90,
            historyBackfillTtlDays: 7,
        },
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
        replaceProviderHistoryForDomain: jest.fn(),
        updateProviderHistoryBackfilledAt: jest.fn(),
    };

    const subscriptionService = {
        resolveOrganizationPlanTier: jest.fn().mockResolvedValue("SOLO"),
    };

    const backlinksClient = {
        fetchBacklinksSummaryLive: jest.fn().mockResolvedValue({ domainRating: 55 }),
        fetchBacklinksTimeseriesSummaryLive: jest.fn().mockResolvedValue({
            points: [{ capturedAt: "2026-10-01T00:00:00.000Z", domainRating: 42 }],
        }),
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

    describe("ensureProviderHistoryBackfill", () => {
        it("skips when provider_history_backfilled_at is within TTL", async () => {
            const { directorySeoRepository, subscriptionService, backlinksClient } = createMocks();
            directorySeoRepository.getSnapshot.mockResolvedValue({
                domain: "acme.test",
                domain_rating: 40,
                source: "dataforseo",
                checked_at: new Date().toISOString(),
                provider_history_backfilled_at: new Date().toISOString(),
            });

            const service = new DirectorySeoService(
                directorySeoRepository as unknown as DirectorySeoRepository,
                subscriptionService as unknown as SubscriptionService,
                backlinksClient
            );

            await service.ensureProviderHistoryBackfill("acme.test", 30);
            expect(backlinksClient.fetchBacklinksTimeseriesSummaryLive).not.toHaveBeenCalled();
        });

        it("imports timeseries and updates backfill timestamp when stale or missing", async () => {
            const { directorySeoRepository, subscriptionService, backlinksClient } = createMocks();
            directorySeoRepository.getSnapshot.mockResolvedValue({
                domain: "acme.test",
                domain_rating: 40,
                source: "dataforseo",
                checked_at: new Date().toISOString(),
                provider_history_backfilled_at: null,
            });

            const service = new DirectorySeoService(
                directorySeoRepository as unknown as DirectorySeoRepository,
                subscriptionService as unknown as SubscriptionService,
                backlinksClient
            );

            await service.ensureProviderHistoryBackfill("https://acme.test", 30);

            expect(backlinksClient.fetchBacklinksTimeseriesSummaryLive).toHaveBeenCalledWith(
                "acme.test",
                expect.objectContaining({ groupRange: "day" })
            );
            expect(directorySeoRepository.replaceProviderHistoryForDomain).toHaveBeenCalledWith(
                expect.objectContaining({
                    domain: "acme.test",
                    points: [{ domainRating: 42, capturedAt: "2026-10-01T00:00:00.000Z" }],
                })
            );
            expect(directorySeoRepository.updateProviderHistoryBackfilledAt).toHaveBeenCalledWith(
                "acme.test",
                expect.any(String)
            );
        });

        it("does not call DataForSEO when the provider is disabled", async () => {
            const configuredSpy = jest
                .spyOn(dataforseoClient, "isDataForSeoConfigured")
                .mockReturnValue(false);

            const { directorySeoRepository, subscriptionService, backlinksClient } = createMocks();
            const service = new DirectorySeoService(
                directorySeoRepository as unknown as DirectorySeoRepository,
                subscriptionService as unknown as SubscriptionService,
                backlinksClient
            );

            await service.ensureProviderHistoryBackfill("acme.test", 30);
            expect(backlinksClient.fetchBacklinksTimeseriesSummaryLive).not.toHaveBeenCalled();
            expect(directorySeoRepository.getSnapshot).not.toHaveBeenCalled();

            configuredSpy.mockRestore();
        });
    });

});
