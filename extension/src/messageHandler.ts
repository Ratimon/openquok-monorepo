import {
	BROWSER_EXTENSION_MESSAGE_TYPE,
	isBrowserExtensionRequest,
	listCookieSessionProviderSummaries,
	type BrowserExtensionErrorResponse,
	type BrowserExtensionRequest,
	type BrowserExtensionResponse,
} from 'openquok-common';

import { EXTENSION_VERSION } from './constants.js';
import { extractCookies } from './cookies/extractCookies.js';
import { clearRefreshAlarm, scheduleRefreshAlarm } from './refresh/alarms.js';
import { getCookieSessionProvider } from './providers/provider.registry.js';
import {
	removeRefreshRegistration,
	saveRefreshRegistration,
} from './storage/refreshTokenStorage.js';

function errorResponse(error: string, code?: string): BrowserExtensionErrorResponse {
	return { ok: false, error, ...(code ? { code } : {}) };
}

export async function handleBrowserExtensionRequest(
	request: BrowserExtensionRequest
): Promise<BrowserExtensionResponse> {
	switch (request.type) {
		case BROWSER_EXTENSION_MESSAGE_TYPE.PING:
			return { ok: true, type: BROWSER_EXTENSION_MESSAGE_TYPE.PING, version: EXTENSION_VERSION };

		case BROWSER_EXTENSION_MESSAGE_TYPE.GET_PROVIDERS:
			return {
				ok: true,
				type: BROWSER_EXTENSION_MESSAGE_TYPE.GET_PROVIDERS,
				providers: listCookieSessionProviderSummaries(),
			};

		case BROWSER_EXTENSION_MESSAGE_TYPE.GET_COOKIES: {
			const provider = getCookieSessionProvider(request.providerId);
			if (!provider) {
				return errorResponse(`Unknown provider "${request.providerId}".`, 'UNKNOWN_PROVIDER');
			}
			try {
				const cookies = await extractCookies(provider);
				return {
					ok: true,
					type: BROWSER_EXTENSION_MESSAGE_TYPE.GET_COOKIES,
					providerId: request.providerId,
					cookies,
				};
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Failed to read cookies.';
				return errorResponse(message, 'COOKIES_UNAVAILABLE');
			}
		}

		case BROWSER_EXTENSION_MESSAGE_TYPE.STORE_REFRESH_TOKEN: {
			const provider = getCookieSessionProvider(request.providerId);
			if (!provider) {
				return errorResponse(`Unknown provider "${request.providerId}".`, 'UNKNOWN_PROVIDER');
			}
			await saveRefreshRegistration({
				providerId: request.providerId,
				integrationId: request.integrationId,
				backendUrl: request.backendUrl,
				refreshToken: request.refreshToken,
			});
			await scheduleRefreshAlarm(request.providerId, request.integrationId);
			return { ok: true, type: BROWSER_EXTENSION_MESSAGE_TYPE.STORE_REFRESH_TOKEN };
		}

		case BROWSER_EXTENSION_MESSAGE_TYPE.REMOVE_REFRESH_TOKEN: {
			await removeRefreshRegistration(request.providerId, request.integrationId);
			await clearRefreshAlarm(request.providerId, request.integrationId);
			return { ok: true, type: BROWSER_EXTENSION_MESSAGE_TYPE.REMOVE_REFRESH_TOKEN };
		}

		default:
			return errorResponse('Unsupported message type.');
	}
}

export async function handleExternalMessage(
	message: unknown
): Promise<BrowserExtensionResponse> {
	if (!isBrowserExtensionRequest(message)) {
		return errorResponse('Invalid extension message.');
	}
	return handleBrowserExtensionRequest(message);
}
