import { afterEach, describe, expect, it, vi } from 'vitest';

import { BROWSER_EXTENSION_MESSAGE_TYPE } from 'openquok-common';

import {
	pingBrowserExtension,
	resetResolvedBrowserExtensionIdForTests,
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
		vi.unstubAllGlobals();
		resetResolvedBrowserExtensionIdForTests();
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
		vi.stubEnv('VITE_OPENQUOK_BROWSER_EXTENSION_IDS', '');
		const result = await pingBrowserExtension();
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toMatch(/not configured/i);
		}
	});

	it('sendBrowserExtensionRequest uses the page bridge on Firefox', async () => {
		vi.stubEnv('VITE_OPENQUOK_BROWSER_EXTENSION_ID', extensionId);
		vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 Firefox/128.0' });
		const win = ensureWindow();
		let onMessage: ((event: MessageEvent) => void) | undefined;
		const postMessage = vi.fn((message: { requestId?: string }) => {
			const requestId = message.requestId ?? '';
			queueMicrotask(() => {
				onMessage?.({
					source: win,
					origin: win.location?.origin ?? 'https://www.openquok.com',
					data: {
						source: 'openquok-browser-extension',
						type: 'OPENQUOK_EXTENSION_PAGE_RESPONSE',
						requestId,
						payload: { ok: true, type: BROWSER_EXTENSION_MESSAGE_TYPE.PING, version: 'fx' }
					}
				} as MessageEvent);
			});
		});
		const addEventListener = vi.fn((event: string, handler: (event: MessageEvent) => void) => {
			if (event === 'message') onMessage = handler;
		});
		Object.assign(win, {
			location: { origin: 'https://www.openquok.com' },
			postMessage,
			addEventListener,
			removeEventListener: vi.fn(),
			clearTimeout: vi.fn((id: number) => id),
			setTimeout: vi.fn(() => 0)
		});
		delete (win as Window & { chrome?: unknown }).chrome;

		const response = await sendBrowserExtensionRequest(extensionId, {
			type: BROWSER_EXTENSION_MESSAGE_TYPE.PING
		});
		expect(response).toEqual({
			ok: true,
			type: BROWSER_EXTENSION_MESSAGE_TYPE.PING,
			version: 'fx'
		});
		expect(postMessage).toHaveBeenCalled();
	});

	it('pingBrowserExtension falls back to the second configured id', async () => {
		vi.stubEnv('VITE_OPENQUOK_BROWSER_EXTENSION_IDS', 'chromium:missing-id,edge:edge-id');
		vi.stubEnv('VITE_OPENQUOK_BROWSER_EXTENSION_ID', '');
		vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 Chrome/120.0' });
		const win = ensureWindow();
		(win as Window & { chrome?: { runtime: { sendMessage: typeof vi.fn; lastError?: unknown } } }).chrome =
			{
				runtime: {
					sendMessage: vi.fn((id, _msg, cb) => {
						if (id === 'missing-id') {
							cb({ ok: false, error: 'nope' });
							return;
						}
						cb({ ok: true, type: BROWSER_EXTENSION_MESSAGE_TYPE.PING, version: '2.0.0' });
					})
				}
			};

		const result = await pingBrowserExtension();
		expect(result).toEqual({ ok: true, version: '2.0.0' });
	});
});
