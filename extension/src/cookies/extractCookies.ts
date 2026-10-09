import type { BrowserExtensionSessionCookie, CookieSessionProvider } from 'openquok-common';

function toSessionCookie(cookie: chrome.cookies.Cookie): BrowserExtensionSessionCookie {
	return {
		name: cookie.name,
		value: cookie.value,
		domain: cookie.domain,
		path: cookie.path,
		secure: cookie.secure,
		httpOnly: cookie.httpOnly,
		sameSite: cookie.sameSite,
		expirationDate: cookie.expirationDate,
	};
}

/**
 * Reads provider session cookies from the browser. All `requiredCookies` must be present.
 */
export async function extractCookies(
	provider: CookieSessionProvider
): Promise<BrowserExtensionSessionCookie[]> {
	const all = await chrome.cookies.getAll({ url: provider.cookieUrl });
	const byName = new Map(all.map((cookie) => [cookie.name, cookie]));

	const sessionCookies: BrowserExtensionSessionCookie[] = [];
	for (const ref of provider.requiredCookies) {
		const match = byName.get(ref.name);
		if (!match?.value) {
			throw new Error(`Missing session cookie "${ref.name}" for ${provider.name}. Log in on skool.com and try again.`);
		}
		if (ref.domain && !match.domain.endsWith(ref.domain.replace(/^\./, ''))) {
			throw new Error(`Unexpected domain for cookie "${ref.name}".`);
		}
		sessionCookies.push(toSessionCookie(match));
	}

	return sessionCookies;
}

/** Base64 JSON object keyed by cookie name — same shape as dashboard `social-connect` `code`. */
export function encodeCookiesConnectCode(cookies: BrowserExtensionSessionCookie[]): string {
	const record: Record<string, string> = {};
	for (const cookie of cookies) {
		record[cookie.name] = cookie.value;
	}
	const json = JSON.stringify(record);
	const bytes = new TextEncoder().encode(json);
	let binary = '';
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}
	return btoa(binary);
}
