import { afterEach, describe, expect, it, vi } from 'vitest';

import { BROWSER_EXTENSION_MESSAGE_TYPE } from 'openquok-common';

import {
	pingBrowserExtension,
	sendBrowserExtensionRequest
} from '$lib/integrations/browser-extension/extensionClient';

function ensureWindow(): Window {
	if (typeof globalThis.window === 'undefined') {
		(globalThis as { window: Window }).window = globalThis as unknown as Window;
	}
	return globalThis.window;
}

describe('extensionClient', () => {
	const extensionId = 'test-extension-id';

	afterEach(() => {
		vi.unstubAllEnvs();
		const win = ensureWindow();
		delete (win as Window & { chrome?: unknown }).chrome;
	});

	it('sendBrowserExtensionRequest resolves success responses', async () => {
		vi.stubEnv('VITE_OPENQUOK_BROWSER_EXTENSION_ID', extensionId);
		const win = ensureWindow();
		(win as Window & { chrome?: { runtime: { sendMessage: typeof vi.fn; lastError?: unknown } } }).chrome =
			{
				runtime: {
					sendMessage: vi.fn((_id, _msg, cb) => {
						cb({ ok: true, type: BROWSER_EXTENSION_MESSAGE_TYPE.PING, version: '1.0.0' });
					})
				}
			};

		const response = await sendBrowserExtensionRequest(extensionId, {
			type: BROWSER_EXTENSION_MESSAGE_TYPE.PING
		});
		expect(response).toEqual({
			ok: true,
			type: BROWSER_EXTENSION_MESSAGE_TYPE.PING,
			version: '1.0.0'
		});
	});

	it('pingBrowserExtension returns error when extension id env is missing', async () => {
		vi.stubEnv('VITE_OPENQUOK_BROWSER_EXTENSION_ID', '');
		const result = await pingBrowserExtension();
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toMatch(/not configured/i);
		}
	});
});
