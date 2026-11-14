import {
	isBrowserExtensionPageBridgeRelay,
	type BrowserExtensionResponse,
} from 'openquok-common';

import { handleExternalMessage } from './externalHandlers.js';

export function isPageBridgeRelayMessage(message: Record<string, unknown>): boolean {
	return isBrowserExtensionPageBridgeRelay(message);
}

export async function handlePageBridgeRelayMessage(
	message: Record<string, unknown>
): Promise<BrowserExtensionResponse> {
	if (!isBrowserExtensionPageBridgeRelay(message)) {
		return { ok: false, error: 'Invalid extension message.' };
	}
	return handleExternalMessage(message.payload, { url: message.pageUrl });
}
