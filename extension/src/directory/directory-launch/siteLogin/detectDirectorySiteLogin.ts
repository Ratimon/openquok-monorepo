import { isPeerPushLoggedIn, PEERPUSH_LOGIN_URL } from './peerpush.js';
import type { DirectorySiteLoginAdapter, DirectorySiteLoginDetection } from './types.js';
import { isUneedLoggedIn, UNEED_LOGIN_URL } from './uneed.js';

const adapters: Readonly<Record<string, DirectorySiteLoginAdapter>> = {
	peerpush: {
		isLoggedIn: isPeerPushLoggedIn,
		loginUrl: PEERPUSH_LOGIN_URL
	},
	uneed: {
		isLoggedIn: isUneedLoggedIn,
		loginUrl: UNEED_LOGIN_URL
	}
};

export function detectDirectorySiteLogin(
	siteKey: string,
	doc: Document = document
): DirectorySiteLoginDetection {
	const adapter = adapters[siteKey];
	if (!adapter) {
		return { loggedIn: true, loginUrl: '' };
	}
	return {
		loggedIn: adapter.isLoggedIn(doc),
		loginUrl: adapter.loginUrl
	};
}
