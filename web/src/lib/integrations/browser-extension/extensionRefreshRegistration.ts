import { BROWSER_EXTENSION_MESSAGE_TYPE, isCookieSessionProviderId } from 'openquok-common';

import { sendBrowserExtensionRequest } from '$lib/integrations/browser-extension/extensionClient';
import {
	getBrowserExtensionBackendUrl,
	getBrowserExtensionId,
	isBrowserExtensionConfigured
} from '$lib/integrations/browser-extension/extensionConfig';

export async function registerBrowserExtensionRefreshToken(params: {
	providerId: string;
	integrationId: string;
	refreshToken: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
	if (!isCookieSessionProviderId(params.providerId)) {
		return { ok: true };
	}
	if (!isBrowserExtensionConfigured()) {
		return {
			ok: false,
			error: 'Install the OpenQuok browser extension and set VITE_OPENQUOK_BROWSER_EXTENSION_ID to enable automatic session refresh.'
		};
	}
	const backendUrl = getBrowserExtensionBackendUrl();
	if (!backendUrl) {
		return { ok: false, error: 'Could not resolve API URL for the browser extension.' };
	}
	const extensionId = getBrowserExtensionId();
	const response = await sendBrowserExtensionRequest(extensionId, {
		type: BROWSER_EXTENSION_MESSAGE_TYPE.STORE_REFRESH_TOKEN,
		providerId: params.providerId,
		integrationId: params.integrationId,
		backendUrl,
		refreshToken: params.refreshToken
	});
	if (!response.ok) {
		return { ok: false, error: response.error };
	}
	return { ok: true };
}

/** Best-effort cleanup when a channel is removed from the workspace. */
export async function removeBrowserExtensionRefreshToken(params: {
	providerId: string;
	integrationId: string;
}): Promise<void> {
	if (!isCookieSessionProviderId(params.providerId) || !isBrowserExtensionConfigured()) {
		return;
	}
	const extensionId = getBrowserExtensionId();
	try {
		await sendBrowserExtensionRequest(extensionId, {
			type: BROWSER_EXTENSION_MESSAGE_TYPE.REMOVE_REFRESH_TOKEN,
			providerId: params.providerId,
			integrationId: params.integrationId
		});
	} catch {
		/* extension may be uninstalled — disconnect still succeeds */
	}
}
