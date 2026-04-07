import { config } from "../config/GlobalConfig";
import { IntegrationManager } from "../integrations/integrationManager";
import type { IntegrationRepository, IntegrationRow } from "../repositories/IntegrationRepository";
import type { AuthTokenDetails, SocialProvider } from "../integrations/social.integrations.interface";
import { runRefreshTokenOrchestration } from "openquok-orchestrator";
import { logger } from "../utils/Logger";

/** Token refresh orchestration; long-running refresh timing runs as an in-process Flowcraft loop under `orchestrator/`. */
export class RefreshIntegrationService {
    constructor(
        private readonly integrationRepository: IntegrationRepository,
        private readonly integrationManager: IntegrationManager
    ) {}

    async refresh(integration: IntegrationRow): Promise<false | AuthTokenDetails> {
        const socialProvider = this.integrationManager.getSocialIntegration(integration.provider_identifier);
        if (!socialProvider) {
            return false;
        }

        const refresh = await this.refreshProcess(integration, socialProvider);
        if (!refresh) {
            return false;
        }

        await this.integrationRepository.upsertIntegration({
            organizationId: integration.organization_id,
            internalId: integration.internal_id,
            name: integration.name,
            picture: integration.picture,
            providerIdentifier: integration.provider_identifier,
            integrationType: integration.type === "article" ? "article" : "social",
            token: refresh.accessToken,
            refreshToken: refresh.refreshToken ?? "",
            expiresInSeconds: refresh.expiresIn,
            profile: integration.profile,
            inBetweenSteps: integration.in_between_steps,
            additionalSettingsJson: integration.additional_settings,
            customInstanceDetails: integration.custom_instance_details,
            postingTimesJson: integration.posting_times,
            rootInternalId: integration.root_internal_id,
        });

        return refresh;
    }

    async startRefreshWorkflow(organizationId: string, integrationId: string, integration: SocialProvider): Promise<boolean> {
        if (!integration.refreshCron) {
            return false;
        }

        const orchestrator = (config.bullmq as { integrationRefresh?: { enabled?: boolean } }).integrationRefresh;
        if (!orchestrator?.enabled) {
            return false;
        }

        return runRefreshTokenOrchestration(
            { integrationId, organizationId },
            {
                integrationRepository: this.integrationRepository,
                runRefresh: (row: IntegrationRow) => this.refresh(row),
            }
        );
    }

    private async refreshProcess(
        integration: IntegrationRow,
        socialProvider: SocialProvider
    ): Promise<AuthTokenDetails | false> {
        const rt = integration.refresh_token;
        if (!rt || !socialProvider.refreshToken) {
            await this.markRefreshFailed(integration);
            return false;
        }

        const refresh: false | AuthTokenDetails = await socialProvider.refreshToken(rt).catch(() => false);

        if (!refresh || !refresh.accessToken) {
            await this.markRefreshFailed(integration);
            return false;
        }

        if (
            !socialProvider.reConnect ||
            !integration.root_internal_id ||
            integration.root_internal_id === integration.internal_id
        ) {
            return refresh;
        }

        const reConnect = await socialProvider.reConnect(
            integration.root_internal_id,
            integration.internal_id,
            refresh.accessToken
        );

        return {
            ...refresh,
            ...reConnect,
        };
    }

    private async markRefreshFailed(integration: IntegrationRow): Promise<void> {
        await this.integrationRepository.setRefreshNeeded(integration.organization_id, integration.id, true);
        logger.warn({
            msg: "Integration token refresh failed; refresh_needed set",
            integrationId: integration.id,
            organizationId: integration.organization_id,
            provider: integration.provider_identifier,
        });
    }
}
