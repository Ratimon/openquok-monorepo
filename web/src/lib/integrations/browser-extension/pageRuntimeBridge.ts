import {
	BROWSER_EXTENSION_PAGE_BRIDGE_MESSAGE,
	BROWSER_EXTENSION_PAGE_BRIDGE_SOURCE,
	isBrowserExtensionPageBridgeResponse,
	type BrowserExtensionRequest,
	type BrowserExtensionResponse,
} from 'openquok-common';

const DEFAULT_PAGE_BRIDGE_TIMEOUT_MS = 12_000;

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function isFirefoxWebExtensionBridgeBrowser(): boolean {
	if (typeof navigator === 'undefined') return false;
	return /Firefox\//i.test(navigator.userAgent);
}

function randomRequestId(): string {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}
	return `openquok-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isTrustedBridgeResponse(event: MessageEvent, requestId: string): boolean {
	if (event.source !== window) return false;
	if (event.origin !== window.location.origin) return false;
	const data = event.data as unknown;
	if (!isPlainObject(data)) return false;
	if (data.source !== BROWSER_EXTENSION_PAGE_BRIDGE_SOURCE) return false;
	if (!isBrowserExtensionPageBridgeResponse(data)) return false;
	return data.requestId === requestId;
}

export function sendBrowserExtensionRequestViaPageBridge(
	request: BrowserExtensionRequest,
	timeoutMs: number = DEFAULT_PAGE_BRIDGE_TIMEOUT_MS
): Promise<BrowserExtensionResponse> {
	if (typeof window === 'undefined') {
		return Promise.resolve({ ok: false, error: 'Extension messaging is not available in this environment.' });
	}

	const requestId = randomRequestId();

	return new Promise((resolve) => {
		let settled = false;

		const finish = (response: BrowserExtensionResponse) => {
			if (settled) return;
			settled = true;
			window.removeEventListener('message', onMessage);
			window.clearTimeout(timeoutId);
			resolve(response);
		};

		const onMessage = (event: MessageEvent) => {
			if (!isTrustedBridgeResponse(event, requestId)) return;
			const payload = (event.data as { payload: BrowserExtensionResponse }).payload;
			finish(payload);
		};

		window.addEventListener('message', onMessage);
		const timeoutId = window.setTimeout(() => {
			finish({
				ok: false,
				error:
					'Timed out waiting for the OpenQuok extension. Confirm it is installed and enabled on this site.',
			});
		}, timeoutMs);

		window.postMessage(
			{
				source: BROWSER_EXTENSION_PAGE_BRIDGE_SOURCE,
				type: BROWSER_EXTENSION_PAGE_BRIDGE_MESSAGE.REQUEST,
				requestId,
				payload: request,
			},
			window.location.origin
		);
	});
}
