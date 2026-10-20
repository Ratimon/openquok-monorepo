import { planLimitsForTier, type SubscriptionTier } from "openquok-common";
import { config } from "../config/GlobalConfig";
import type { SeoDomainMetricSnapshotRow } from "../data/types/directorySeoTypes";
import { ValidationError } from "../errors/InfraError";
import {
    fetchBacklinksSummaryLive,
    isDataForSeoConfigured,
    type BacklinksSummaryLiveResult,
} from "../connections/dataforseo/dataforseoClient";
import { normalizeSeoDomain } from "../connections/dataforseo/normalizeSeoDomain";
import type { DirectorySeoRepository } from "../repositories/DirectorySeoRepository";
import type { SubscriptionService } from "./SubscriptionService";
import { logger } from "../utils/Logger";

const METRIC_SOURCE = "dataforseo";
const HISTORY_SAMPLE_MS = 7 * 24 * 60 * 60 * 1000;

export type DirectorySeoRefreshOptions = {
    force?: boolean;
};

export type DirectorySeoWeeklyRefreshResult = {
    attempted: number;
    refreshed: number;
};

export type DirectorySeoBacklinksClient = {
    fetchBacklinksSummaryLive(domain: string): Promise<BacklinksSummaryLiveResult>;
};

function directorySeoConfig(): {
    cacheTtlMs: number;
    weeklyRefreshEnabled: boolean;
} {
    const directorySeo = config.directorySeo as {
        cacheTtlHours?: number;
        weeklyRefreshEnabled?: boolean;
    };
    const hours = directorySeo?.cacheTtlHours ?? 168;
    return {
        cacheTtlMs: Math.max(1, hours) * 60 * 60 * 1000,
        weeklyRefreshEnabled: directorySeo?.weeklyRefreshEnabled ?? true,
    };
}

function ratingsEqual(a: number | null | undefined, b: number | null | undefined): boolean {
    if (a == null && b == null) return true;
    if (a == null || b == null) return false;
    return Number(a) === Number(b);
}

/**
 * Directory SEO domain rating cache (global snapshots + history).
 * Rebuildable cache in Postgres; API calls only via DataForSEO backlinks summary/live.
 */
export class DirectorySeoService {
    constructor(
        private readonly directorySeoRepository: DirectorySeoRepository,
        private readonly subscriptionService: SubscriptionService,
        private readonly backlinksClient: DirectorySeoBacklinksClient = {
            fetchBacklinksSummaryLive,
        }
    ) {}

    cacheTtlMs(): number {
        return directorySeoConfig().cacheTtlMs;
    }

    isProviderConfigured(): boolean {
        return isDataForSeoConfigured();
    }

    isSnapshotStale(checkedAtIso: string, nowMs = Date.now()): boolean {
        const checkedAt = Date.parse(checkedAtIso);
        if (!Number.isFinite(checkedAt)) return true;
        return nowMs - checkedAt >= this.cacheTtlMs();
    }

    /**
     * Distinct normalized domains tracked for paid Directory SEO workspaces:
     * main profile `website_url` + workspace competitors.
     */
    async listEntitledDomains(): Promise<string[]> {
        const domains = new Set<string>();
        const tierByOrg = new Map<string, SubscriptionTier>();

        const resolveEntitled = async (organizationId: string): Promise<boolean> => {
            let tier = tierByOrg.get(organizationId);
            if (!tier) {
                tier = await this.subscriptionService.resolveOrganizationPlanTier(organizationId);
                tierByOrg.set(organizationId, tier);
            }
            return planLimitsForTier(tier).directory_seo_enabled;
        };

        const competitors = await this.directorySeoRepository.listCompetitorDomainsByOrganization();
        for (const row of competitors) {
            if (!(await resolveEntitled(row.organization_id))) continue;
            const normalized = normalizeSeoDomain(row.domain) ?? row.domain.trim().toLowerCase();
            if (normalized) domains.add(normalized);
        }

        const profiles = await this.directorySeoRepository.listMainProfileWebsiteUrls();
        for (const row of profiles) {
            if (!(await resolveEntitled(row.organization_id))) continue;
            const normalized = normalizeSeoDomain(row.website_url);
            if (normalized) domains.add(normalized);
        }

        return [...domains].sort((a, b) => a.localeCompare(b));
    }

    /** Domains entitled for refresh whose snapshot is missing or older than the global TTL. */
    async listStaleDomainsForRefresh(): Promise<string[]> {
        const entitled = await this.listEntitledDomains();
        const stale: string[] = [];
        for (const domain of entitled) {
            const snapshot = await this.directorySeoRepository.getSnapshot(domain);
            if (!snapshot || this.isSnapshotStale(snapshot.checked_at)) {
                stale.push(domain);
            }
        }
        return stale;
    }

    /**
     * Idempotent read-through refresh: respects cache TTL unless `force` is set.
     * When DataForSEO is disabled, returns the existing snapshot (if any) without calling out.
     */
    async refreshDomain(
        rawDomain: string,
        options: DirectorySeoRefreshOptions = {}
    ): Promise<SeoDomainMetricSnapshotRow | null> {
        const domain = normalizeSeoDomain(rawDomain);
        if (!domain) {
            throw new ValidationError("Enter a valid domain hostname");
        }

        const existing = await this.directorySeoRepository.getSnapshot(domain);
        if (!options.force && existing && !this.isSnapshotStale(existing.checked_at)) {
            return existing;
        }

        if (!this.isProviderConfigured()) {
            return existing ?? null;
        }

        const summary = await this.backlinksClient.fetchBacklinksSummaryLive(domain);
        const checkedAt = new Date().toISOString();
        const updated = await this.directorySeoRepository.upsertSnapshot({
            domain,
            domainRating: summary.domainRating,
            source: METRIC_SOURCE,
            checkedAt,
        });

        const lastHistory = await this.directorySeoRepository.getLatestHistory(domain);
        if (
            this.shouldRecordHistory(
                existing?.domain_rating ?? null,
                summary.domainRating,
                lastHistory?.captured_at ?? null
            )
        ) {
            await this.directorySeoRepository.insertHistory({
                domain,
                domainRating: summary.domainRating,
                capturedAt: checkedAt,
            });
        }

        return updated;
    }

    /** Stateless weekly sweep: reload stale domains from Postgres each run. */
    async runWeeklyRefresh(): Promise<DirectorySeoWeeklyRefreshResult> {
        const { weeklyRefreshEnabled } = directorySeoConfig();
        if (!weeklyRefreshEnabled || !this.isProviderConfigured()) {
            return { attempted: 0, refreshed: 0 };
        }

        const stale = await this.listStaleDomainsForRefresh();
        let refreshed = 0;
        for (const domain of stale) {
            try {
                const row = await this.refreshDomain(domain, { force: false });
                if (row) refreshed += 1;
            } catch (err) {
                logger.warn({
                    msg: "[DirectorySeo] Weekly refresh failed for domain",
                    domain,
                    err,
                });
            }
        }
        return { attempted: stale.length, refreshed };
    }

    private shouldRecordHistory(
        previousRating: number | null,
        newRating: number | null,
        lastCapturedAtIso: string | null
    ): boolean {
        if (!ratingsEqual(previousRating, newRating)) return true;
        if (!lastCapturedAtIso) return true;
        const lastMs = Date.parse(lastCapturedAtIso);
        if (!Number.isFinite(lastMs)) return true;
        return Date.now() - lastMs >= HISTORY_SAMPLE_MS;
    }
}
