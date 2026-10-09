/** Discriminant for messages sent from the OpenQuok web app to the browser extension. */
export const BROWSER_EXTENSION_MESSAGE_TYPE = {
	PING: 'PING',
	GET_PROVIDERS: 'GET_PROVIDERS',
	GET_COOKIES: 'GET_COOKIES',
	STORE_REFRESH_TOKEN: 'STORE_REFRESH_TOKEN',
	REMOVE_REFRESH_TOKEN: 'REMOVE_REFRESH_TOKEN',
} as const;

export type BrowserExtensionMessageType =
	(typeof BROWSER_EXTENSION_MESSAGE_TYPE)[keyof typeof BROWSER_EXTENSION_MESSAGE_TYPE];

const MESSAGE_TYPES = new Set<string>(Object.values(BROWSER_EXTENSION_MESSAGE_TYPE));

export function isBrowserExtensionMessageType(value: unknown): value is BrowserExtensionMessageType {
	return typeof value === 'string' && MESSAGE_TYPES.has(value);
}

/** Cookie fields exchanged between the extension and the connect flow (values required for connect). */
export type BrowserExtensionSessionCookie = {
	name: string;
	value: string;
	domain: string;
	path?: string;
	secure?: boolean;
	httpOnly?: boolean;
	sameSite?: 'unspecified' | 'no_restriction' | 'lax' | 'strict';
	expirationDate?: number;
};

export type BrowserExtensionRequest =
	| { type: typeof BROWSER_EXTENSION_MESSAGE_TYPE.PING }
	| { type: typeof BROWSER_EXTENSION_MESSAGE_TYPE.GET_PROVIDERS }
	| { type: typeof BROWSER_EXTENSION_MESSAGE_TYPE.GET_COOKIES; providerId: string }
	| {
			type: typeof BROWSER_EXTENSION_MESSAGE_TYPE.STORE_REFRESH_TOKEN;
			providerId: string;
			integrationId: string;
			backendUrl: string;
			refreshToken: string;
	  }
	| {
			type: typeof BROWSER_EXTENSION_MESSAGE_TYPE.REMOVE_REFRESH_TOKEN;
			providerId: string;
			integrationId: string;
	  };

export type BrowserExtensionProviderSummary = {
	identifier: string;
	name: string;
};

export type BrowserExtensionSuccessResponse =
	| { ok: true; type: typeof BROWSER_EXTENSION_MESSAGE_TYPE.PING; version?: string }
	| {
			ok: true;
			type: typeof BROWSER_EXTENSION_MESSAGE_TYPE.GET_PROVIDERS;
			providers: BrowserExtensionProviderSummary[];
	  }
	| {
			ok: true;
			type: typeof BROWSER_EXTENSION_MESSAGE_TYPE.GET_COOKIES;
			providerId: string;
			cookies: BrowserExtensionSessionCookie[];
	  }
	| { ok: true; type: typeof BROWSER_EXTENSION_MESSAGE_TYPE.STORE_REFRESH_TOKEN }
	| { ok: true; type: typeof BROWSER_EXTENSION_MESSAGE_TYPE.REMOVE_REFRESH_TOKEN };

export type BrowserExtensionErrorResponse = {
	ok: false;
	error: string;
	code?: string;
};

export type BrowserExtensionResponse = BrowserExtensionSuccessResponse | BrowserExtensionErrorResponse;

function isNonEmptyString(value: unknown): value is string {
	return typeof value === 'string' && value.trim().length > 0;
}

function readRequestType(record: Record<string, unknown>): BrowserExtensionMessageType | null {
	const type = record.type;
	return isBrowserExtensionMessageType(type) ? type : null;
}

/** Runtime guard for externally_connectable messages from the web dashboard. */
export function isBrowserExtensionRequest(value: unknown): value is BrowserExtensionRequest {
	if (!value || typeof value !== 'object') return false;
	const record = value as Record<string, unknown>;
	const type = readRequestType(record);
	if (!type) return false;

	switch (type) {
		case BROWSER_EXTENSION_MESSAGE_TYPE.PING:
		case BROWSER_EXTENSION_MESSAGE_TYPE.GET_PROVIDERS:
			return true;
		case BROWSER_EXTENSION_MESSAGE_TYPE.GET_COOKIES:
			return isNonEmptyString(record.providerId);
		case BROWSER_EXTENSION_MESSAGE_TYPE.STORE_REFRESH_TOKEN:
			return (
				isNonEmptyString(record.providerId) &&
				isNonEmptyString(record.integrationId) &&
				isNonEmptyString(record.backendUrl) &&
				isNonEmptyString(record.refreshToken)
			);
		case BROWSER_EXTENSION_MESSAGE_TYPE.REMOVE_REFRESH_TOKEN:
			return isNonEmptyString(record.providerId) && isNonEmptyString(record.integrationId);
		default:
			return false;
	}
}

export function isBrowserExtensionErrorResponse(
	value: unknown
): value is BrowserExtensionErrorResponse {
	if (!value || typeof value !== 'object') return false;
	const record = value as Record<string, unknown>;
	return record.ok === false && typeof record.error === 'string';
}

export function isBrowserExtensionSuccessResponse(
	value: unknown
): value is BrowserExtensionSuccessResponse {
	if (!value || typeof value !== 'object') return false;
	const record = value as Record<string, unknown>;
	if (record.ok !== true) return false;
	return isBrowserExtensionMessageType(record.type);
}
