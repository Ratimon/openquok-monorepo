import type { BrowserExtensionSessionCookie } from 'openquok-common';

import { encodeCredentialsConnectCode } from '$lib/integrations/utils/credentialsConnect';

/** Base64 JSON cookie map — same shape as extension `encodeCookiesConnectCode` and Skool `social-connect` `code`. */
export function encodeExtensionConnectCode(cookies: BrowserExtensionSessionCookie[]): string {
	const record: Record<string, string> = {};
	for (const cookie of cookies) {
		if (cookie.name && cookie.value) {
			record[cookie.name] = cookie.value;
		}
	}
	return encodeCredentialsConnectCode(record);
}
