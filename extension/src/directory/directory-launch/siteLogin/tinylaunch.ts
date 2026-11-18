/** Header sign-in link when signed out (may hydrate after first paint on pricing). */
export const TINYLAUNCH_LOGIN_NAV_SELECTOR = 'a[href="/login"]';

export const TINYLAUNCH_LOGIN_URL = 'https://www.tinylaunch.com/login';

function isTinylaunchAuthGateVisible(doc: Document): boolean {
	const text = doc.body?.textContent ?? '';
	if (/welcome back/i.test(text) && /login with google/i.test(text)) return true;
	if (doc.querySelector('input[type="password"]')) return true;
	return /sign up with email/i.test(text) && doc.querySelector('input[type="email"]');
}

export function isTinylaunchLoggedIn(doc: Document = document): boolean {
	if (doc.querySelector(TINYLAUNCH_LOGIN_NAV_SELECTOR)) return false;
	if (isTinylaunchAuthGateVisible(doc)) return false;
	return true;
}