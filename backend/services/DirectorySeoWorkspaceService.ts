import { SubscriptionSection } from "openquok-common";

import type { DirectorySeoRepository } from "../repositories/DirectorySeoRepository";
import type { AutoLaunchRepository } from "../repositories/AutoLaunchRepository";
import type { IntegrationConnectionService } from "./IntegrationConnectionService";
import type { SubscriptionGuardService } from "../guards/subscription/SubscriptionGuardService";
import type { DirectorySeoService } from "./DirectorySeoService";
import { normalizeSeoDomain } from "../connections/dataforseo/normalizeSeoDomain";
import { ValidationError } from "../errors/InfraError";
import { AutoLaunchProfileNotFoundError } from "../errors/AutoLaunchError";
import {
    toDirectorySeoCompetitorDto,
    toDirectorySeoDomainMetricDto,
    toDirectorySeoHistoryPointDto,
    type DirectorySeoHistoryPointDto,
    type DirectorySeoWorkspaceOverviewDto,
} from "../utils/dtos/DirectorySeoDTO";
import type {
    DirectorySeoAddCompetitorBody,
    DirectorySeoDeleteCompetitorBody,
    DirectorySeoRefreshBody,
} from "../data/schemas/directorySeoSchemas";

const DELTA_DAYS = [7, 30, 90] as const;

function manualRefreshAvailableAtIso(
    checkedAtIso: string | null | undefined,
    cacheTtlMs: number,
    nowMs = Date.now()
): string | null {
    if (!checkedAtIso?.trim()) return null;
    const checkedAt = Date.parse(checkedAtIso);
    if (!Number.isFinite(checkedAt)) return null;
    const availableAt = checkedAt + cacheTtlMs;
    if (nowMs >= availableAt) return null;
    return new Date(availableAt).toISOString();
}

export class DirectorySeoWorkspaceService {
    constructor(
        private readonly directorySeoRepository: DirectorySeoRepository,
        private readonly autoLaunchRepository: AutoLaunchRepository,
        private readonly directorySeoService: DirectorySeoService,
        private readonly integrationConnectionService: IntegrationConnectionService,
        private readonly subscriptionGuard: SubscriptionGuardService
    ) {}

    async getWorkspaceOverview(
        authUserId: string,
        organizationId: string,
        productProfileId: string
    ): Promise<DirectorySeoWorkspaceOverviewDto> {
        await this.assertDirectorySeoEnabled(authUserId, organizationId);
        const productDomain = await this.resolveMainProductDomain(
            authUserId,
            organizationId,
            productProfileId
        );
        const providerConfigured = this.directorySeoService.isProviderConfigured();

        const competitors = await this.directorySeoRepository.listCompetitorsForOrganization(
            organizationId
        );

        if (productDomain && providerConfigured) {
            await this.directorySeoService.refreshDomain(productDomain, { force: false });
        }

        const productMetric = productDomain
            ? await this.buildDomainMetricDto(productDomain)
            : null;

        const competitorDtos = await Promise.all(
            competitors.map(async (row) => {
                if (providerConfigured) {
                    await this.directorySeoService.refreshDomain(row.domain, { force: false });
                }
                const snapshot = await this.directorySeoRepository.getSnapshot(row.domain);
                return toDirectorySeoCompetitorDto(row, snapshot);
            })
        );

        const productSnapshot = productDomain
            ? await this.directorySeoRepository.getSnapshot(productDomain)
            : null;

        return {
            productDomain: productMetric,
            competitors: competitorDtos,
            providerConfigured,
            manualRefreshAvailableAt: manualRefreshAvailableAtIso(
                productSnapshot?.checked_at ?? null,
                this.directorySeoService.cacheTtlMs()
            ),
        };
    }

    async getWorkspaceHistory(
        authUserId: string,
        organizationId: string,
        productProfileId: string,
        days: number
    ): Promise<DirectorySeoHistoryPointDto[]> {
        await this.assertDirectorySeoEnabled(authUserId, organizationId);
        const productDomain = await this.resolveMainProductDomain(
            authUserId,
            organizationId,
            productProfileId
        );
        if (!productDomain) {
            return [];
        }

        if (this.directorySeoService.isProviderConfigured()) {
            await this.directorySeoService.refreshDomain(productDomain, { force: false });
        }

        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
        const rows = await this.directorySeoRepository.listHistoryForDomain({
            domain: productDomain,
            sinceIso: since,
        });
        return rows.map(toDirectorySeoHistoryPointDto);
    }

    async addCompetitor(authUserId: string, body: DirectorySeoAddCompetitorBody) {
        await this.integrationConnectionService.assertOrganizationMember(
            authUserId,
            body.organizationId
        );
        await this.subscriptionGuard.assert(SubscriptionSection.DIRECTORY_SEO_COMPETITORS_PER_WORKSPACE, {
            scope: "workspaceWithDelta",
            organizationId: body.organizationId,
            authUserId,
            delta: 1,
        });

        const domain = normalizeSeoDomain(body.domain);
        if (!domain) {
            throw new ValidationError("Enter a valid competitor domain");
        }

        const row = await this.directorySeoRepository.insertCompetitor({
            organizationId: body.organizationId,
            domain,
            label: body.label ?? null,
            sortOrder: body.sortOrder ?? 0,
        });

        const snapshot = await this.directorySeoRepository.getSnapshot(domain);
        return toDirectorySeoCompetitorDto(row, snapshot);
    }

    async deleteCompetitor(authUserId: string, body: DirectorySeoDeleteCompetitorBody): Promise<void> {
        await this.integrationConnectionService.assertOrganizationMember(
            authUserId,
            body.organizationId
        );
        await this.assertDirectorySeoEnabled(authUserId, body.organizationId);

        const domain = normalizeSeoDomain(body.domain) ?? body.domain.trim().toLowerCase();
        const removed = await this.directorySeoRepository.deleteCompetitor(body.organizationId, domain);
        if (!removed) {
            throw new ValidationError("Competitor not found");
        }
    }

    async refreshWorkspace(
        authUserId: string,
        body: DirectorySeoRefreshBody
    ): Promise<DirectorySeoWorkspaceOverviewDto> {
        await this.assertDirectorySeoEnabled(authUserId, body.organizationId);

        const productDomain = await this.resolveMainProductDomain(
            authUserId,
            body.organizationId,
            body.productProfileId
        );
        if (!productDomain) {
            throw new ValidationError(
                "Add a website URL to your main product profile before refreshing ratings."
            );
        }

        if (!this.directorySeoService.isProviderConfigured()) {
            throw new ValidationError(
                "Domain rating lookup is not configured on this server. Contact your workspace admin."
            );
        }

        const existingSnapshot = await this.directorySeoRepository.getSnapshot(productDomain);
        if (
            existingSnapshot &&
            !this.directorySeoService.isSnapshotStale(existingSnapshot.checked_at)
        ) {
            const nextAt = manualRefreshAvailableAtIso(
                existingSnapshot.checked_at,
                this.directorySeoService.cacheTtlMs()
            );
            throw new ValidationError(
                nextAt
                    ? `You can refresh ratings again after ${new Date(nextAt).toLocaleString()}.`
                    : "You can refresh ratings again in about a week."
            );
        }

        await this.directorySeoService.refreshDomain(productDomain, { force: true });

        const competitors = await this.directorySeoRepository.listCompetitorsForOrganization(
            body.organizationId
        );
        for (const competitor of competitors) {
            await this.directorySeoService.refreshDomain(competitor.domain, { force: true });
        }

        return this.getWorkspaceOverview(authUserId, body.organizationId, body.productProfileId);
    }

    private async assertDirectorySeoEnabled(authUserId: string, organizationId: string): Promise<void> {
        await this.integrationConnectionService.assertOrganizationMember(authUserId, organizationId);
        await this.subscriptionGuard.assert(SubscriptionSection.DIRECTORY_SEO_ENABLED, {
            scope: "workspace",
            organizationId,
            authUserId,
        });
    }

    private async resolveMainProductDomain(
        authUserId: string,
        organizationId: string,
        productProfileId: string
    ): Promise<string | null> {
        await this.integrationConnectionService.assertOrganizationMember(authUserId, organizationId);
        const profile = await this.autoLaunchRepository.findProfileById(productProfileId);
        if (!profile || profile.organization_id !== organizationId) {
            throw new AutoLaunchProfileNotFoundError(productProfileId);
        }

        const mainProfile =
            profile.profile_kind === "directory_variant" && profile.parent_profile_id
                ? await this.autoLaunchRepository.findProfileById(profile.parent_profile_id)
                : profile;
        if (!mainProfile || mainProfile.organization_id !== organizationId) {
            throw new AutoLaunchProfileNotFoundError(productProfileId);
        }

        const website = mainProfile.website_url;
        if (!website?.trim()) return null;
        return normalizeSeoDomain(website);
    }

    private async buildDomainMetricDto(domain: string) {
        const snapshot = await this.directorySeoRepository.getSnapshot(domain);
        const now = Date.now();
        const rating7DaysAgo = await this.directorySeoRepository.findHistoryRatingAtOrBefore(
            domain,
            new Date(now - DELTA_DAYS[0] * 24 * 60 * 60 * 1000).toISOString()
        );
        const rating30DaysAgo = await this.directorySeoRepository.findHistoryRatingAtOrBefore(
            domain,
            new Date(now - DELTA_DAYS[1] * 24 * 60 * 60 * 1000).toISOString()
        );
        const rating90DaysAgo = await this.directorySeoRepository.findHistoryRatingAtOrBefore(
            domain,
            new Date(now - DELTA_DAYS[2] * 24 * 60 * 60 * 1000).toISOString()
        );

        return toDirectorySeoDomainMetricDto({
            domain,
            snapshot,
            rating7DaysAgo,
            rating30DaysAgo,
            rating90DaysAgo,
        });
    }
}
