import type { IntegrationsConfig } from '$lib/integrations/Integrations.repository.svelte';

import { httpGateway } from '$lib/core/index';
import { IntegrationsRepository } from '$lib/integrations/Integrations.repository.svelte';
import { ContinueIntegrationPresenter } from '$lib/integrations/ContinueIntegration.presenter.svelte';

const integrationsBase = '/api/v1/integrations';

/** SessionStorage key: JSON `{ integrationId, pages, state }` between OAuth callback and the picker route. */
export const INSTAGRAM_BUSINESS_PICKER_SESSION_KEY = 'openquok:instagram-business:connect-pages' as const;

const integrationsConfig: IntegrationsConfig = {
	endpoints: {
		catalog: `${integrationsBase}`,
		socialAuthorize: (provider) => `${integrationsBase}/social/${encodeURIComponent(provider)}`,
		connectSocial: (provider) => `${integrationsBase}/social-connect/${encodeURIComponent(provider)}`,
		listByOrganization: `${integrationsBase}/list`,
		customers: `${integrationsBase}/customers`,
		integrationGroup: (integrationId: string) =>
			`${integrationsBase}/${encodeURIComponent(integrationId)}/group`,
		disable: `${integrationsBase}/disable`,
		enable: `${integrationsBase}/enable`,
		deleteChannel: `${integrationsBase}`,
		providerConnect: (integrationId: string) =>
			`${integrationsBase}/provider/${encodeURIComponent(integrationId)}/connect`,
		publicProviderConnect: (integrationId: string) =>
			`${integrationsBase}/public/provider/${encodeURIComponent(integrationId)}/connect`,
		postingTimes: (integrationId: string) =>
			`${integrationsBase}/${encodeURIComponent(integrationId)}/time`
	}
};

export const integrationsRepository = new IntegrationsRepository(httpGateway, integrationsConfig);
export const continueIntegrationPresenter = new ContinueIntegrationPresenter(integrationsRepository);

export { IntegrationsRepository } from '$lib/integrations/Integrations.repository.svelte';
export {
	ContinueIntegrationPresenter,
	ContinueIntegrationStatus,
	type ContinueSocialIntegrationViewModel
} from '$lib/integrations/ContinueIntegration.presenter.svelte';
