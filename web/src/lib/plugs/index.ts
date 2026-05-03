import type { PlugRepositoryConfig } from '$lib/plugs/Plug.repository.svelte';

import { httpGateway } from '$lib/core/index';
import { PlugRepository } from '$lib/plugs/Plug.repository.svelte';
import { GetPlugPresenter } from '$lib/plugs/GetPlug.presenter.svelte';
import { GlobalPlugSettingsPresenter } from '$lib/plugs/GlobalPlugSettings.presenter.svelte';

const integrationsBase = '/api/v1/integrations';

const plugRepositoryConfig: PlugRepositoryConfig = {
	endpoints: {
		plugList: `${integrationsBase}/plug/list`,
		integrationPlugs: (integrationId: string) =>
			`${integrationsBase}/${encodeURIComponent(integrationId)}/plugs`,
		integrationPlugActivate: (plugId: string) =>
			`${integrationsBase}/plugs/${encodeURIComponent(plugId)}/activate`,
		integrationPlugDelete: (plugId: string) =>
			`${integrationsBase}/plugs/${encodeURIComponent(plugId)}`
	}
};

export const plugRepository = new PlugRepository(httpGateway, plugRepositoryConfig);

export const getPlugPresenter = new GetPlugPresenter();

export const globalPlugSettingsPresenter = new GlobalPlugSettingsPresenter(
	plugRepository,
	getPlugPresenter
);

export { PlugRepository } from '$lib/plugs/Plug.repository.svelte';
export { GetPlugPresenter } from '$lib/plugs/GetPlug.presenter.svelte';
export { GlobalPlugSettingsPresenter } from '$lib/plugs/GlobalPlugSettings.presenter.svelte';
