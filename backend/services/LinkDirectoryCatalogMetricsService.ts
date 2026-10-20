import { normalizeSeoDomain } from "../connections/dataforseo/normalizeSeoDomain";
import type {
    LinkDirectoryCatalogDrRefreshOptions,
    LinkDirectoryCatalogDrRefreshResult,
    LinkDirectoryCatalogDrRefreshSiteResult,
} from "../data/types/linkDirectoryTypes";
import type { LinkDirectoryRepository } from "../repositories/LinkDirectoryRepository";
import type { DirectorySeoService } from "./DirectorySeoService";
import { logger } from "../utils/Logger";

const CATALOG_METRICS_SOURCE = "dataforseo";

function toCatalogDomainRating(value: number | null | undefined): number | null {
    if (value == null || !Number.isFinite(value)) return null;
    return Math.round(value);
}

/**
 * Refreshes build-backlinks catalog DR on `link_directory_sites` using the global
 * DataForSEO snapshot cache (`seo_domain_metric_snapshots`).
 */
export class LinkDirectoryCatalogMetricsService {
    constructor(
        private readonly linkDirectoryRepository: LinkDirectoryRepository,
        private readonly directorySeoService: DirectorySeoService
    ) {}

    async refreshCatalogDomainRatings(
        options: LinkDirectoryCatalogDrRefreshOptions = {}
    ): Promise<LinkDirectoryCatalogDrRefreshResult> {
        const providerConfigured = this.directorySeoService.isProviderConfigured();
        const sites = await this.linkDirectoryRepository.listSitesForCatalogDrRefresh({
            publishedOnly: options.publishedOnly ?? false,
            siteId: options.siteId,
            slug: options.slug,
        });

        const siteResults: LinkDirectoryCatalogDrRefreshSiteResult[] = [];
        let updated = 0;
        let skipped = 0;
        let failed = 0;

        for (const site of sites) {
            const domain = normalizeSeoDomain(site.site_url);
            if (!domain) {
                failed += 1;
                siteResults.push({
                    siteId: site.id,
                    slug: site.slug,
                    domain: null,
                    domainRating: null,
                    skipped: false,
                    error: "Invalid or missing site_url hostname",
                });
                continue;
            }

            try {
                const snapshot = await this.directorySeoService.refreshDomain(domain, {
                    force: options.force ?? false,
                });
                const domainRating = toCatalogDomainRating(snapshot?.domain_rating ?? null);

                if (!snapshot) {
                    skipped += 1;
                    siteResults.push({
                        siteId: site.id,
                        slug: site.slug,
                        domain,
                        domainRating: null,
                        skipped: true,
                        error: providerConfigured
                            ? "No domain rating returned"
                            : "DataForSEO is not configured and no cached snapshot exists",
                    });
                    continue;
                }

                if (options.dryRun) {
                    siteResults.push({
                        siteId: site.id,
                        slug: site.slug,
                        domain,
                        domainRating,
                        skipped: false,
                    });
                    updated += 1;
                    continue;
                }

                await this.linkDirectoryRepository.updateSiteCatalogDomainMetrics({
                    siteId: site.id,
                    domainRating,
                    metricsUpdatedAt: snapshot.checked_at,
                    metricsSource: CATALOG_METRICS_SOURCE,
                });
                updated += 1;
                siteResults.push({
                    siteId: site.id,
                    slug: site.slug,
                    domain,
                    domainRating,
                    skipped: false,
                });
            } catch (err) {
                failed += 1;
                const message = err instanceof Error ? err.message : String(err);
                logger.warn({
                    msg: "[LinkDirectory] Catalog DR refresh failed for site",
                    siteId: site.id,
                    slug: site.slug,
                    domain,
                    err,
                });
                siteResults.push({
                    siteId: site.id,
                    slug: site.slug,
                    domain,
                    domainRating: null,
                    skipped: false,
                    error: message,
                });
            }
        }

        return {
            attempted: sites.length,
            updated,
            skipped,
            failed,
            providerConfigured,
            sites: siteResults,
        };
    }
}
