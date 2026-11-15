import {
	isBrowserExtensionRequest,
	type BrowserExtensionRequest,
	type BrowserExtensionResponse,
} from './messages.js';

/**
 * `window.postMessage` bridge between the OpenQuok web app and the dashboard content script
 * (Firefox and any browser without `externally_connectable` / `chrome.runtime.sendMessage(extensionId)`).
 */
export const BROWSER_EXTENSION_PAGE_BRIDGE_SOURCE = 'openquok-browser-extension' as const;

export const BROWSER_EXTENSION_PAGE_BRIDGE_MESSAGE = {
	/** Page → content script: invoke an extension API request. */
	REQUEST: 'OPENQUOK_EXTENSION_PAGE_REQUEST',
	/** Content script → page: correlated response payload. */
	RESPONSE: 'OPENQUOK_EXTENSION_PAGE_RESPONSE',
} as const;

/** Content script → background: relay a page-originated request. */
export const BROWSER_EXTENSION_PAGE_BRIDGE_RUNTIME_MESSAGE = {
	RELAY: 'OPENQUOK_EXTENSION_PAGE_BRIDGE_RELAY',
} as const;

export type BrowserExtensionPageBridgeMessageType =
	(typeof BROWSER_EXTENSION_PAGE_BRIDGE_MESSAGE)[keyof typeof BROWSER_EXTENSION_PAGE_BRIDGE_MESSAGE];

const PAGE_BRIDGE_MESSAGE_TYPES = new Set<string>(Object.values(BROWSER_EXTENSION_PAGE_BRIDGE_MESSAGE));

export type BrowserExtensionPageBridgeRequest = {
	source: typeof BROWSER_EXTENSION_PAGE_BRIDGE_SOURCE;
	type: typeof BROWSER_EXTENSION_PAGE_BRIDGE_MESSAGE.REQUEST;
	requestId: string;
	payload: BrowserExtensionRequest;
};

export type BrowserExtensionPageBridgeResponse = {
	source: typeof BROWSER_EXTENSION_PAGE_BRIDGE_SOURCE;
	type: typeof BROWSER_EXTENSION_PAGE_BRIDGE_MESSAGE.RESPONSE;
	requestId: string;
	payload: BrowserExtensionResponse;
};

export type BrowserExtensionPageBridgeRelay = {
	type: typeof BROWSER_EXTENSION_PAGE_BRIDGE_RUNTIME_MESSAGE.RELAY;
	requestId: string;
	payload: BrowserExtensionRequest;
	pageUrl: string;
};

function isNonEmptyString(value: unknown): value is string {
	return typeof value === 'string' && value.trim().length > 0;
}

export function isBrowserExtensionPageBridgeRequest(
	value: unknown
): value is BrowserExtensionPageBridgeRequest {
	if (!value || typeof value !== 'object') return false;
	const record = value as Record<string, unknown>;
	return (
		record.source === BROWSER_EXTENSION_PAGE_BRIDGE_SOURCE &&
		record.type === BROWSER_EXTENSION_PAGE_BRIDGE_MESSAGE.REQUEST &&
		isNonEmptyString(record.requestId) &&
		isBrowserExtensionRequest(record.payload)
	);
}

export function isBrowserExtensionPageBridgeResponse(
	value: unknown
): value is BrowserExtensionPageBridgeResponse {
	if (!value || typeof value !== 'object') return false;
	const record = value as Record<string, unknown>;
	if (record.source !== BROWSER_EXTENSION_PAGE_BRIDGE_SOURCE) return false;
	if (record.type !== BROWSER_EXTENSION_PAGE_BRIDGE_MESSAGE.RESPONSE) return false;
	if (!isNonEmptyString(record.requestId)) return false;
	if (!record.payload || typeof record.payload !== 'object') return false;
	const payload = record.payload as Record<string, unknown>;
	return payload.ok === true || payload.ok === false;
}

export function isBrowserExtensionPageBridgeRelay(
	value: unknown
): value is BrowserExtensionPageBridgeRelay {
	if (!value || typeof value !== 'object') return false;
	const record = value as Record<string, unknown>;
	return (
		record.type === BROWSER_EXTENSION_PAGE_BRIDGE_RUNTIME_MESSAGE.RELAY &&
		isNonEmptyString(record.requestId) &&
		isBrowserExtensionRequest(record.payload) &&
		isNonEmptyString(record.pageUrl)
	);
}

export function isBrowserExtensionPageBridgeMessageType(
	value: unknown
): value is BrowserExtensionPageBridgeMessageType {
	return typeof value === 'string' && PAGE_BRIDGE_MESSAGE_TYPES.has(value);
}
