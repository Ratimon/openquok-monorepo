import { httpGateway } from '$lib/core/index';
import { getMediaPresenter } from '$lib/medias';
import { workspaceSettingsPresenter } from '$lib/settings';
import { OAuthAppsRepository, type OAuthAppsConfig } from '$lib/developers/UpsertOAuthApp.repository.svelte';
import { OAuthAppsPresenter } from '$lib/developers/UpsertOAuthApp.presenter.svelte';

const oauthAppsBase = '/api/v1/oauth-apps';
const oauthAppsConfig: OAuthAppsConfig = {
	endpoints: {
		getApp: (organizationId) => `${oauthAppsBase}/app?organizationId=${encodeURIComponent(organizationId)}`,
		create: oauthAppsBase,
		update: oauthAppsBase,
		delete: (oauthAppId, organizationId) =>
			`${oauthAppsBase}/${encodeURIComponent(oauthAppId)}?organizationId=${encodeURIComponent(organizationId)}`,
		rotateSecret: `${oauthAppsBase}/rotate-secret`
	}
};

export const oauthAppsRepository = new OAuthAppsRepository(httpGateway, oauthAppsConfig);

export const oauthAppsPresenter = new OAuthAppsPresenter(
	oauthAppsRepository,
	workspaceSettingsPresenter,
	getMediaPresenter
);

export { OAuthAppsRepository, toOauthAppPm } from '$lib/developers/UpsertOAuthApp.repository.svelte';
export type {
	OAuthAppsConfig,
	OauthAppProgrammerModel,
	OauthAppWireDto
} from '$lib/developers/UpsertOAuthApp.repository.svelte';
export { OAuthAppsPresenter, OAuthAppsPresenterStatus } from '$lib/developers/UpsertOAuthApp.presenter.svelte';
