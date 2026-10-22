import type { LinkDirectoryRepository } from "../repositories/LinkDirectoryRepository";
import type { DirectorySeoService } from "./DirectorySeoService";
import { LinkDirectoryCatalogMetricsService } from "./LinkDirectoryCatalogMetricsService";

function createMocks() {
    const linkDirectoryRepository = {
        listSitesForCatalogDrRefresh: jest.fn().mockResolvedValue([
            { id: "site-1", slug: "example", site_url: "https://www.example.com" },
        ]),
        updateSiteCatalogDomainMetrics: jest.fn().mockResolvedValue(undefined),
    };

    const directorySeoService = {
        isProviderConfigured: jest.fn().mockReturnValue(true),
        refreshDomain: jest.fn().mockResolvedValue({
            domain: "example.com",
            domain_rating: 42.7,
            source: "dataforseo",
            checked_at: "2026-10-20T00:00:00.000Z",
        }),
    };

    return { linkDirectoryRepository, directorySeoService };
}

describe("LinkDirectoryCatalogMetricsService", () => {
    it("updates catalog rows from refreshed snapshots", async () => {
        const { linkDirectoryRepository, directorySeoService } = createMocks();

        const service = new LinkDirectoryCatalogMetricsService(
            linkDirectoryRepository as unknown as LinkDirectoryRepository,
            directorySeoService as unknown as DirectorySeoService
        );
        const result = await service.refreshCatalogDomainRatings({ force: true });

        expect(directorySeoService.refreshDomain).toHaveBeenCalledWith("example.com", { force: true });
        expect(linkDirectoryRepository.updateSiteCatalogDomainMetrics).toHaveBeenCalledWith({
            siteId: "site-1",
            domainRating: 43,
            metricsUpdatedAt: "2026-10-20T00:00:00.000Z",
            metricsSource: "dataforseo",
        });
        expect(result.updated).toBe(1);
        expect(result.failed).toBe(0);
    });

    it("skips DB writes on dry run", async () => {
        const { linkDirectoryRepository, directorySeoService } = createMocks();

        const service = new LinkDirectoryCatalogMetricsService(
            linkDirectoryRepository as unknown as LinkDirectoryRepository,
            directorySeoService as unknown as DirectorySeoService
        );
        await service.refreshCatalogDomainRatings({ dryRun: true });

        expect(linkDirectoryRepository.updateSiteCatalogDomainMetrics).not.toHaveBeenCalled();
    });
});
