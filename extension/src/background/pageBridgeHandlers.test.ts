import { describe, expect, it, vi } from 'vitest';

import { BROWSER_EXTENSION_MESSAGE_TYPE, BROWSER_EXTENSION_PAGE_BRIDGE_RUNTIME_MESSAGE } from 'openquok-common';

import {
	handlePageBridgeRelayMessage,
	isPageBridgeRelayMessage,
} from './pageBridgeHandlers.js';

vi.mock('../constants.js', () => ({ EXTENSION_VERSION: 'test' }));
vi.mock('../providers/provider.registry.js', () => ({
	getCookieSessionProvider: vi.fn(),
}));
vi.mock('../cookies/extractCookies.js', () => ({ extractCookies: vi.fn() }));
vi.mock('../storage/refreshTokenStorage.js', () => ({
	saveRefreshRegistration: vi.fn(),
	removeRefreshRegistration: vi.fn(),
}));
vi.mock('../refresh/alarms.js', () => ({
	scheduleRefreshAlarm: vi.fn(),
	clearRefreshAlarm: vi.fn(),
}));
vi.mock('./directoryHandlers.js', () => ({ persistHandoff: vi.fn() }));
vi.mock('../shared/dashboardOriginStorage.js', () => ({ rememberDashboardOrigin: vi.fn() }));

describe('pageBridgeHandlers', () => {
	it('recognizes relay messages', () => {
		expect(
			isPageBridgeRelayMessage({
				type: BROWSER_EXTENSION_PAGE_BRIDGE_RUNTIME_MESSAGE.RELAY,
				requestId: 'abc',
				pageUrl: 'https://www.openquok.com/account',
				payload: { type: BROWSER_EXTENSION_MESSAGE_TYPE.PING },
			})
		).toBe(true);
	});

	it('handles ping relay messages', async () => {
		const response = await handlePageBridgeRelayMessage({
			type: BROWSER_EXTENSION_PAGE_BRIDGE_RUNTIME_MESSAGE.RELAY,
			requestId: 'abc',
			pageUrl: 'https://www.openquok.com/account',
			payload: { type: BROWSER_EXTENSION_MESSAGE_TYPE.PING },
		});
		expect(response).toEqual({
			ok: true,
			type: BROWSER_EXTENSION_MESSAGE_TYPE.PING,
			version: 'test',
		});
	});
});
