/** Nav sign-out link on peerpush.com (verified on pricing when signed out). */
export const PEERPUSH_LOGIN_NAV_SELECTOR = 'a[href="/auth/login"]';

export const PEERPUSH_LOGIN_URL = 'https://peerpush.com/auth/login';

export function isPeerPushLoggedIn(doc: Document = document): boolean {
	return !doc.querySelector(PEERPUSH_LOGIN_NAV_SELECTOR);
}
