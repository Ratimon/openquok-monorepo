/** Header sign-in link when signed out (may hydrate after first paint). */
export const FAZIER_LOGIN_NAV_SELECTOR = 'a[href="/login"]';

export const FAZIER_LOGIN_URL = 'https://fazier.com/login';

function isFazierLoginPath(doc: Document): boolean {
	const path = doc.defaultView?.location?.pathname ?? '';
	return path === '/login' || path.startsWith('/login/');
}

function isFazierAuthGateVisible(doc: Document): boolean {
	const text = doc.body?.textContent ?? '';
	if (/login to fazier/i.test(text) && /continue with google/i.test(text)) return true;
	if (/new to fazier/i.test(text) && /continue with email/i.test(text)) return true;
	return false;
}

export function isFazierLoggedIn(doc: Document = document): boolean {
	if (isFazierLoginPath(doc)) return false;
	if (doc.querySelector(FAZIER_LOGIN_NAV_SELECTOR)) return false;
	if (isFazierAuthGateVisible(doc)) return false;
	return true;
}