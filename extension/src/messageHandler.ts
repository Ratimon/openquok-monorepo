import {
	AUTO_LAUNCH_MESSAGE_TYPE,
	BROWSER_EXTENSION_MESSAGE_TYPE,
	coerceAutoLaunchHandoffRequestFields,
	isBrowserExtensionRequest,
	listCookieSessionProviderSummaries,
	type BrowserExtensionErrorResponse,
	type BrowserExtensionRequest,
	type BrowserExtensionResponse,
} from 'openquok-common';

import { persistHandoff } from './auto-launch/backgroundHandlers.js';
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

		case BROWSER_EXTENSION_MESSAGE_TYPE.AUTO_LAUNCH_HANDOFF:
			return errorResponse('Handoff must be sent from the OpenQuok dashboard.', 'AUTO_LAUNCH_HANDOFF_FAILED');

		default:
			return errorResponse('Unsupported message type.');
	}
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export async function handleExternalMessage(
	message: unknown,
	sender?: chrome.runtime.MessageSender
): Promise<BrowserExtensionResponse> {
	if (isRecord(message) && message.type === AUTO_LAUNCH_MESSAGE_TYPE.HANDOFF) {
		const fields = coerceAutoLaunchHandoffRequestFields(message);
		if (!fields) {
			return errorResponse(
				'Directory launch handoff data was incomplete. Refresh OpenQuok, then rebuild and reload the browser extension.',
				'AUTO_LAUNCH_HANDOFF_INVALID'
			);
		}
		try {
			const { submissionId } = await persistHandoff(fields, sender?.url);
			return {
				ok: true,
				type: BROWSER_EXTENSION_MESSAGE_TYPE.AUTO_LAUNCH_HANDOFF,
				submissionId,
			};
		} catch (error) {
			const messageText = error instanceof Error ? error.message : 'Handoff failed.';
			return errorResponse(messageText, 'AUTO_LAUNCH_HANDOFF_FAILED');
		}
	}

	if (!isBrowserExtensionRequest(message)) {
		return errorResponse('Invalid extension message.');
	}
	return handleBrowserExtensionRequest(message);
}
