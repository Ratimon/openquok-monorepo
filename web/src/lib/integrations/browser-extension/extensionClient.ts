import {
	BROWSER_EXTENSION_MESSAGE_TYPE,
	isBrowserExtensionErrorResponse,
	isBrowserExtensionSuccessResponse,
	type BrowserExtensionRequest,
	type BrowserExtensionResponse,
	type BrowserExtensionSessionCookie
} from 'openquok-common';

import {
	getBrowserExtensionIdCandidates,
	isBrowserExtensionConfigured
} from '$lib/integrations/browser-extension/extensionConfig';
import {
	isFirefoxWebExtensionBridgeBrowser,
	sendBrowserExtensionRequestViaPageBridge
} from '$lib/integrations/browser-extension/pageRuntimeBridge';

type ChromeRuntimeSendMessage = (
	extensionId: string,
	message: unknown,
	responseCallback: (response: unknown) => void
) => void;

type ChromeRuntime = {
	sendMessage: ChromeRuntimeSendMessage;
	lastError?: { message?: string };
};

function getChromeRuntime(): ChromeRuntime | null {
	if (typeof window === 'undefined') return null;
	const runtime = (window as Window & { chrome?: { runtime?: ChromeRuntime } }).chrome?.runtime;
	if (!runtime || typeof runtime.sendMessage !== 'function') return null;
	return runtime;
}

export function isBrowserExtensionRuntimeAvailable(): boolean {
	if (!isBrowserExtensionConfigured()) return false;
	if (isFirefoxWebExtensionBridgeBrowser()) {
		return typeof window !== 'undefined';
	}
	return getChromeRuntime() !== null;
}

function parseExtensionResponse(response: unknown): BrowserExtensionResponse {
	if (isBrowserExtensionErrorResponse(response) || isBrowserExtensionSuccessResponse(response)) {
		return response;
	}
	return { ok: false, error: 'Unexpected response from the browser extension.' };
}

export function sendBrowserExtensionRequest(
	extensionId: string,
	request: BrowserExtensionRequest
): Promise<BrowserExtensionResponse> {
	if (isFirefoxWebExtensionBridgeBrowser()) {
		return sendBrowserExtensionRequestViaPageBridge(request);
	}
	return new Promise((resolve, reject) => {
		const runtime = getChromeRuntime();
		if (!runtime) {
			reject(new Error('Chrome extension messaging is not available in this browser.'));
			return;
		}
		try {
			runtime.sendMessage(extensionId, request, (response) => {
				const lastError = runtime.lastError;
				if (lastError?.message) {
					reject(new Error(lastError.message));
					return;
				}
				resolve(parseExtensionResponse(response));
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Could not reach the browser extension.';
			reject(new Error(message));
		}
	});
}

/** Cleared in unit tests when env or mock runtime changes between examples. */
let resolvedBrowserExtensionId: string | null = null;

export function resetResolvedBrowserExtensionIdForTests(): void {
	resolvedBrowserExtensionId = null;
}

async function pingExtensionId(extensionId: string): Promise<boolean> {
	try {
		const response = await sendBrowserExtensionRequest(extensionId, {
			type: BROWSER_EXTENSION_MESSAGE_TYPE.PING
		});
		return response.ok && response.type === BROWSER_EXTENSION_MESSAGE_TYPE.PING;
	} catch {
		return false;
	}
}

/**
 * Pings configured extension IDs in order until one responds (cached for the page session).
 */
export async function resolveBrowserExtensionId(): Promise<string> {
	if (resolvedBrowserExtensionId) {
		return resolvedBrowserExtensionId;
	}
	const candidates = getBrowserExtensionIdCandidates();
	for (const extensionId of candidates) {
		if (await pingExtensionId(extensionId)) {
			resolvedBrowserExtensionId = extensionId;
			return extensionId;
		}
	}
	return '';
}

async function sendToConfiguredExtension(
	request: BrowserExtensionRequest
): Promise<BrowserExtensionResponse> {
	const extensionId = await resolveBrowserExtensionId();
	if (!extensionId) {
		return { ok: false, error: 'OpenQuok browser extension is not configured for this site.' };
	}
	try {
		return await sendBrowserExtensionRequest(extensionId, request);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Could not reach the browser extension.';
		return { ok: false, error: message };
	}
}

export async function pingBrowserExtension(): Promise<
	{ ok: true; version?: string } | { ok: false; error: string }
> {
	const response = await sendToConfiguredExtension({ type: BROWSER_EXTENSION_MESSAGE_TYPE.PING });
	if (!response.ok) {
		return { ok: false, error: response.error };
	}
	if (response.type !== BROWSER_EXTENSION_MESSAGE_TYPE.PING) {
		return { ok: false, error: 'Unexpected extension response.' };
	}
	return { ok: true, version: response.version };
}

export async function fetchBrowserExtensionSessionCookies(
	providerId: string
): Promise<{ ok: true; cookies: BrowserExtensionSessionCookie[] } | { ok: false; error: string }> {
	const response = await sendToConfiguredExtension({
		type: BROWSER_EXTENSION_MESSAGE_TYPE.GET_COOKIES,
		providerId
	});
	if (!response.ok) {
		return { ok: false, error: response.error };
	}
	if (response.type !== BROWSER_EXTENSION_MESSAGE_TYPE.GET_COOKIES) {
		return { ok: false, error: 'Unexpected extension response.' };
	}
	if (response.providerId !== providerId) {
		return { ok: false, error: 'Extension returned cookies for a different provider.' };
	}
	return { ok: true, cookies: response.cookies };
}
