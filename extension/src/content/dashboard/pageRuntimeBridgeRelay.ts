import {
	BROWSER_EXTENSION_PAGE_BRIDGE_MESSAGE,
	BROWSER_EXTENSION_PAGE_BRIDGE_RUNTIME_MESSAGE,
	BROWSER_EXTENSION_PAGE_BRIDGE_SOURCE,
	isBrowserExtensionErrorResponse,
	isBrowserExtensionPageBridgeRequest,
	isBrowserExtensionSuccessResponse,
	type BrowserExtensionPageBridgeResponse,
	type BrowserExtensionResponse,
} from 'openquok-common';

import { sendRuntimeMessage } from '../../shared/extensionRuntime.js';

function isTrustedPageMessage(event: MessageEvent): boolean {
	return event.source === window && event.origin === window.location.origin;
}

function postBridgeResponse(response: BrowserExtensionPageBridgeResponse): void {
	window.postMessage(response, window.location.origin);
}

export function installBrowserExtensionPageRuntimeBridgeRelay(): void {
	window.addEventListener('message', (event) => {
		if (!isTrustedPageMessage(event)) return;
		const data = event.data as unknown;
		if (!isBrowserExtensionPageBridgeRequest(data)) return;

		void (async () => {
			let payload: BrowserExtensionResponse = {
				ok: false,
				error: 'OpenQuok extension did not respond.',
			};
			try {
				const relayResponse = await sendRuntimeMessage<BrowserExtensionResponse>({
					type: BROWSER_EXTENSION_PAGE_BRIDGE_RUNTIME_MESSAGE.RELAY,
					requestId: data.requestId,
					payload: data.payload,
					pageUrl: window.location.href,
				});
				if (
					relayResponse &&
					(isBrowserExtensionSuccessResponse(relayResponse) ||
						isBrowserExtensionErrorResponse(relayResponse))
				) {
					payload = relayResponse;
				}
			} catch {
				payload = { ok: false, error: 'OpenQuok extension is not available on this page.' };
			}

			postBridgeResponse({
				source: BROWSER_EXTENSION_PAGE_BRIDGE_SOURCE,
				type: BROWSER_EXTENSION_PAGE_BRIDGE_MESSAGE.RESPONSE,
				requestId: data.requestId,
				payload,
			});
		})();
	});
}
