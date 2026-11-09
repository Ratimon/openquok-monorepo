/** Header sign-in link when signed out (may hydrate after first paint on pricing). */
export const OPEN_LAUNCH_LOGIN_NAV_SELECTOR = 'a[href="/sign-in"]';

export const OPEN_LAUNCH_LOGIN_URL = 'https://open-launch.com/sign-in';

function isOpenLaunchAuthGateVisible(doc: Document): boolean {
	const password = doc.querySelector('input[type="password"]');
	if (!password) return false;
	if (doc.querySelector('a[href="/sign-up"]')) return true;
	const text = doc.body?.textContent ?? '';
	return /login with google/i.test(text) && /welcome back/i.test(text);
}

export function isOpenLaunchLoggedIn(doc: Document = document): boolean {
	if (doc.querySelector(OPEN_LAUNCH_LOGIN_NAV_SELECTOR)) return false;
	if (isOpenLaunchAuthGateVisible(doc)) return false;
	return true;
}
