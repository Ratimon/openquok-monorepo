/** Header “Log in” link on uneed.best (verified on /pricing when signed out; SPA hydrates nav). */
export const UNEED_LOGIN_NAV_SELECTOR = 'a[href="/login"]';

export const UNEED_LOGIN_URL = 'https://uneed.best/login';

export function isUneedLoggedIn(doc: Document = document): boolean {
	return !doc.querySelector(UNEED_LOGIN_NAV_SELECTOR);
}
