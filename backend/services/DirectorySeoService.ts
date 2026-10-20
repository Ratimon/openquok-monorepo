import { planLimitsForTier, type SubscriptionTier } from "openquok-common";
import { config } from "../config/GlobalConfig";
import type { SeoDomainMetricSnapshotRow } from "../data/types/directorySeoTypes";
import { ValidationError } from "../errors/InfraError";
import {
    fetchBacklinksSummaryLive,
    fetchBacklinksTimeseriesSummaryLive,
    isDataForSeoConfigured,
    type BacklinksSummaryLiveResult,
    type BacklinksTimeseriesSummaryLiveResult,
    type FetchBacklinksTimeseriesSummaryLiveOptions,
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
    fetchBacklinksTimeseriesSummaryLive(
        domain: string,
        options: FetchBacklinksTimeseriesSummaryLiveOptions
    ): Promise<BacklinksTimeseriesSummaryLiveResult>;
};

const HISTORY_BACKFILL_DAYS_CAP = 366;

function directorySeoConfig(): {
    cacheTtlMs: number;
    weeklyRefreshEnabled: boolean;
    historyBackfillMaxDays: number;
    historyBackfillTtlMs: number;
} {
    const directorySeo = config.directorySeo as {
        cacheTtlHours?: number;
        weeklyRefreshEnabled?: boolean;
        historyBackfillMaxDays?: number;
        historyBackfillTtlDays?: number;
    };
    const hours = directorySeo?.cacheTtlHours ?? 168;
    const historyBackfillMaxDays = Math.max(1, directorySeo?.historyBackfillMaxDays ?? 90);
    const historyBackfillTtlDays = Math.max(1, directorySeo?.historyBackfillTtlDays ?? 7);
    return {
        cacheTtlMs: Math.max(1, hours) * 60 * 60 * 1000,
        weeklyRefreshEnabled: directorySeo?.weeklyRefreshEnabled ?? true,
        historyBackfillMaxDays,
        historyBackfillTtlMs: historyBackfillTtlDays * 24 * 60 * 60 * 1000,
    };
}

function formatUtcDateOnly(date: Date): string {
    return date.toISOString().slice(0, 10);
}

function addUtcDays(date: Date, days: number): Date {
    const copy = new Date(date.getTime());
    copy.setUTCDate(copy.getUTCDate() + days);
    return copy;
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
            fetchBacklinksTimeseriesSummaryLive,
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

    /**
     * Import daily domain-rating history from DataForSEO when cache is missing or past backfill TTL.
     * Failures are logged and do not throw — callers can still read existing history rows.
     */
    async ensureProviderHistoryBackfill(rawDomain: string, requestedDays: number): Promise<void> {
        const domain = normalizeSeoDomain(rawDomain);
        if (!domain) {
            return;
        }

        if (!this.isProviderConfigured()) {
            return;
        }

        const { historyBackfillMaxDays } = directorySeoConfig();
        const backfillDays = Math.min(
            HISTORY_BACKFILL_DAYS_CAP,
            Math.max(Math.max(1, requestedDays), historyBackfillMaxDays)
        );

        const snapshot = await this.directorySeoRepository.getSnapshot(domain);
        if (this.isProviderHistoryBackfillFresh(snapshot?.provider_history_backfilled_at)) {
            return;
        }

        const now = new Date();
        const dateTo = formatUtcDateOnly(now);
        const dateFrom = formatUtcDateOnly(addUtcDays(now, -backfillDays));
        const sinceIso = `${dateFrom}T00:00:00.000Z`;

        try {
            const timeseries = await this.backlinksClient.fetchBacklinksTimeseriesSummaryLive(
                domain,
                { dateFrom, dateTo, groupRange: "day" }
            );

            const points = timeseries.points.map((point) => ({
                domainRating: point.domainRating,
                capturedAt: point.capturedAt,
            }));

            await this.directorySeoRepository.replaceProviderHistoryForDomain({
                domain,
                sinceIso,
                points,
            });

            const backfilledAt = new Date().toISOString();
            await this.directorySeoRepository.updateProviderHistoryBackfilledAt(domain, backfilledAt);

            logger.info({
                msg: "[DirectorySeo] Provider history backfill completed",
                domain,
                backfillDays,
                pointCount: points.length,
            });
        } catch (err) {
            logger.warn({
                msg: "[DirectorySeo] Provider history backfill failed",
                domain,
                backfillDays,
                err,
            });
        }
    }

    private isProviderHistoryBackfillFresh(
        backfilledAtIso: string | null | undefined,
        nowMs = Date.now()
    ): boolean {
        if (!backfilledAtIso) {
            return false;
        }
        const backfilledAt = Date.parse(backfilledAtIso);
        if (!Number.isFinite(backfilledAt)) {
            return false;
        }
        const { historyBackfillTtlMs } = directorySeoConfig();
        return nowMs - backfilledAt < historyBackfillTtlMs;
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
