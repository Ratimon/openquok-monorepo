/** Header sign-in when signed out (e.g. `href="/login?next=submit"` on devhunt.org). */
export const DEVHUNT_LOGIN_NAV_SELECTOR = 'a[href^="/login"]';

export const DEVHUNT_LOGIN_URL = 'https://devhunt.org/login';

function isDevhuntLoginPath(doc: Document): boolean {
	const path = doc.defaultView?.location?.pathname ?? '';
	return path === '/login' || path.startsWith('/login/');
}

function isDevhuntAuthGateVisible(doc: Document): boolean {
	const text = doc.body?.textContent ?? '';
	if (/log in to launch your tool/i.test(text)) return true;
	if (/log in to your account/i.test(text)) return true;
	if (/log in to devhunt/i.test(text) && /continue with github/i.test(text)) return true;
	return false;
}

function isDevhuntAccountToolsFormVisible(doc: Document): boolean {
	const path = doc.defaultView?.location?.pathname ?? '';
	if (!path.startsWith('/account/tools')) return false;
	return Boolean(doc.getElementById('form-container'));
}

export function isDevhuntLoggedIn(doc: Document = document): boolean {
	if (isDevhuntLoginPath(doc)) return false;
	if (doc.querySelector(DEVHUNT_LOGIN_NAV_SELECTOR)) return false;
	if (isDevhuntAuthGateVisible(doc)) return false;
	if (isDevhuntAccountToolsFormVisible(doc)) return true;
	return true;
}