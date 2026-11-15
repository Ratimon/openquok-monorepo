import { afterEach, describe, expect, it, vi } from 'vitest';

import { BROWSER_EXTENSION_MESSAGE_TYPE } from 'openquok-common';

import {
	isFirefoxWebExtensionBridgeBrowser,
	sendBrowserExtensionRequestViaPageBridge
} from '$lib/integrations/browser-extension/pageRuntimeBridge';

describe('pageRuntimeBridge', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it('detects Firefox user agent', () => {
		vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 Firefox/128.0' });
		expect(isFirefoxWebExtensionBridgeBrowser()).toBe(true);
	});

	it('resolves page bridge responses', async () => {
		const origin = 'https://www.openquok.com';
		let messageHandler: ((event: MessageEvent) => void) | undefined;

		const win = {
			location: { origin },
			postMessage: vi.fn((message: unknown) => {
				const record = message as { requestId?: string };
				const requestId = record.requestId ?? '';
				queueMicrotask(() => {
					messageHandler?.({
						source: win as unknown as Window,
						origin,
						data: {
							source: 'openquok-browser-extension',
							type: 'OPENQUOK_EXTENSION_PAGE_RESPONSE',
							requestId,
							payload: { ok: true, type: BROWSER_EXTENSION_MESSAGE_TYPE.PING, version: '0.1.0' }
						}
					} as MessageEvent);
				});
			}),
			addEventListener: vi.fn((type: string, handler: EventListener) => {
				if (type === 'message') messageHandler = handler as (event: MessageEvent) => void;
			}),
			removeEventListener: vi.fn(),
			clearTimeout: vi.fn(),
			setTimeout: vi.fn(() => 0)
		};
		vi.stubGlobal('window', win);

		const response = await sendBrowserExtensionRequestViaPageBridge({
			type: BROWSER_EXTENSION_MESSAGE_TYPE.PING
		});
		expect(response).toEqual({
			ok: true,
			type: BROWSER_EXTENSION_MESSAGE_TYPE.PING,
			version: '0.1.0'
		});
	});
});
