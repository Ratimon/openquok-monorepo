import type { OAuthAppsConfig } from '$lib/developers/OAuthApps.repository.svelte';

import { httpGateway } from '$lib/core/index';
import { getMediaPresenter } from '$lib/medias';
import { workspaceSettingsPresenter } from '$lib/settings';
import { OAuthAppsRepository } from '$lib/developers/OAuthApps.repository.svelte';
import { UpsertOAuthAppsPresenter } from '$lib/developers/UpsertOAuthApp.presenter.svelte';

const oauthAppsBase = '/api/v1/oauth-apps';
const oauthAppsConfig: OAuthAppsConfig = {
	endpoints: {
		getApp: (organizationId: string) => `${oauthAppsBase}/app?organizationId=${encodeURIComponent(organizationId)}`,
		create: oauthAppsBase,
		update: oauthAppsBase,
		delete: (oauthAppId: string, organizationId: string) =>
			`${oauthAppsBase}/${encodeURIComponent(oauthAppId)}?organizationId=${encodeURIComponent(organizationId)}`,
		rotateSecret: `${oauthAppsBase}/rotate-secret`
	}
};

export const oauthAppsRepository = new OAuthAppsRepository(httpGateway, oauthAppsConfig);

export const upsertOauthAppsPresenter = new UpsertOAuthAppsPresenter(
	oauthAppsRepository,
	workspaceSettingsPresenter,
	getMediaPresenter
);

export { OAuthAppsRepository, toOauthAppPm } from '$lib/developers/OAuthApps.repository.svelte';
export type {
	OAuthAppsConfig,
	OauthAppProgrammerModel,
	OauthAppWireDto
} from '$lib/developers/OAuthApps.repository.svelte';
export { UpsertOAuthAppsPresenter, OAuthAppsPresenterStatus } from '$lib/developers/UpsertOAuthApp.presenter.svelte';
