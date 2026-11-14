import { BROWSER_EXTENSION_MESSAGE_TYPE } from './messages.js';
import {
	BROWSER_EXTENSION_PAGE_BRIDGE_MESSAGE,
	BROWSER_EXTENSION_PAGE_BRIDGE_RUNTIME_MESSAGE,
	BROWSER_EXTENSION_PAGE_BRIDGE_SOURCE,
	isBrowserExtensionPageBridgeRelay,
	isBrowserExtensionPageBridgeRequest,
	isBrowserExtensionPageBridgeResponse,
} from './pageRuntimeBridge.js';

describe('pageRuntimeBridge', () => {
	it('accepts a valid page bridge request', () => {
		expect(
			isBrowserExtensionPageBridgeRequest({
				source: BROWSER_EXTENSION_PAGE_BRIDGE_SOURCE,
				type: BROWSER_EXTENSION_PAGE_BRIDGE_MESSAGE.REQUEST,
				requestId: 'req-1',
				payload: { type: BROWSER_EXTENSION_MESSAGE_TYPE.PING },
			})
		).toBe(true);
	});

	it('rejects malformed page bridge requests', () => {
		expect(isBrowserExtensionPageBridgeRequest({ type: BROWSER_EXTENSION_PAGE_BRIDGE_MESSAGE.REQUEST })).toBe(
			false
		);
	});

	it('accepts a valid page bridge response', () => {
		expect(
			isBrowserExtensionPageBridgeResponse({
				source: BROWSER_EXTENSION_PAGE_BRIDGE_SOURCE,
				type: BROWSER_EXTENSION_PAGE_BRIDGE_MESSAGE.RESPONSE,
				requestId: 'req-1',
				payload: { ok: true, type: BROWSER_EXTENSION_MESSAGE_TYPE.PING, version: '0.1.0' },
			})
		).toBe(true);
	});

	it('accepts a valid runtime relay', () => {
		expect(
			isBrowserExtensionPageBridgeRelay({
				type: BROWSER_EXTENSION_PAGE_BRIDGE_RUNTIME_MESSAGE.RELAY,
				requestId: 'req-2',
				pageUrl: 'https://www.openquok.com/account',
				payload: { type: BROWSER_EXTENSION_MESSAGE_TYPE.GET_PROVIDERS },
			})
		).toBe(true);
	});
});
