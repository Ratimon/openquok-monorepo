import {
	COOKIE_SESSION_PROVIDERS,
	getCookieSessionProvider,
	type CookieSessionProvider,
} from 'openquok-common';

/** Cookie-session providers registered in this extension build (mirrors `openquok-common`). */
export const cookieSessionProviders: readonly CookieSessionProvider[] = COOKIE_SESSION_PROVIDERS;

export { getCookieSessionProvider };
