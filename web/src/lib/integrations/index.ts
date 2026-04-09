import { httpGateway } from '$lib/core/index';
import type { IntegrationsConfig } from '$lib/integrations/Integrations.repository.svelte';
import { IntegrationsRepository } from '$lib/integrations/Integrations.repository.svelte';

const base = '/api/v1/integrations';

const integrationsConfig: IntegrationsConfig = {
	endpoints: {
		catalog: base,
		getAuthorizeUrl: (provider) => `${base}/social/${provider}`,
		connectSocial: (provider) => `${base}/social-connect/${provider}`,
		listByOrganization: `${base}/list`
	}
};

export const integrationsRepository = new IntegrationsRepository(httpGateway, integrationsConfig);

export { IntegrationsRepository } from '$lib/integrations/Integrations.repository.svelte';
export type { IntegrationCatalogItemDto, ConnectedIntegrationDto, SocialProviderIdentifier } from '$lib/integrations/Integrations.repository.svelte';

