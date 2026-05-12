import type { IntegrationService } from "./IntegrationService";
import type { IntegrationManager } from "../integrations/integrationManager";
import type { RefreshIntegrationService } from "./RefreshIntegrationService";
import type { AnalyticsData } from "../integrations/social.integrations.interface";

import dayjs from "dayjs";
import { AppError } from "../errors/AppError";

export class AnalyticsService {
    constructor(
        private readonly integrations: IntegrationService,
        private readonly manager: IntegrationManager,
        private readonly refreshIntegrationService: RefreshIntegrationService
    ) {}

    async getIntegrationAnalytics(params: {
        authUserId: string;
        organizationId: string;
        integrationId: string;
        date: number;
        assertOrganizationMember: (authUserId: string, organizationId: string) => Promise<void>;
    }): Promise<AnalyticsData[]> {
        const { authUserId, organizationId, integrationId, date, assertOrganizationMember } = params;

        await assertOrganizationMember(authUserId, organizationId);

        return this._fetchIntegrationAnalytics({ organizationId, integrationId, date });
    }

    /**
     * Programmatic platform analytics (`GET {api.prefix}/public/analytics/:integrationId`).
     * Same provider-driven flow as {@link getIntegrationAnalytics} but skips membership checks
     * because the organization is derived from the API key.
     */
    async getIntegrationAnalyticsProgrammatic(params: {
        organizationId: string;
        integrationId: string;
        date: number;
    }): Promise<AnalyticsData[]> {
        return this._fetchIntegrationAnalytics(params);
    }

    private async _fetchIntegrationAnalytics(params: {
        organizationId: string;
        integrationId: string;
        date: number;
    }): Promise<AnalyticsData[]> {
        const { organizationId, integrationId, date } = params;

        const row = await this.integrations.getById(organizationId, integrationId);
        if (!row) {
            throw new AppError("Integration not found", 404);
        }
        if ((row.type ?? "").toLowerCase() !== "social") {
            return [];
        }

        const provider = this.manager.getSocialIntegration(row.provider_identifier);
        if (!provider?.analytics) {
            return [];
        }

        const exp = row.token_expiration ? dayjs(row.token_expiration) : null;
        if (exp && exp.isValid() && exp.isBefore(dayjs())) {
            const refreshed = await this.refreshIntegrationService.refresh(row);
            if (!refreshed || !refreshed.accessToken) {
                return [];
            }
            row.token = refreshed.accessToken;
        }

        const cached = await this.integrations.getCachedIntegrationPayload(
            organizationId,
            integrationId,
            String(date)
        );
        if (cached) {
            return cached as AnalyticsData[];
        }

        const data = await provider.analytics(row.internal_id, row.token, date).catch(() => []);

        await this.integrations.setCachedIntegrationPayload(organizationId, integrationId, String(date), data as unknown[]);
        return data;
    }
}

