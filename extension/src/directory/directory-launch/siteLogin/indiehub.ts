/** Header sign-in when signed out (`/auth/login` from site nav when hydrated). */
export const INDIEHUB_LOGIN_NAV_SELECTOR = 'a[href="/auth/login"], a[href^="/auth/login?"]';

export const INDIEHUB_LOGIN_URL = 'https://indiehub.best/auth/login?callbackUrl=/submit';

function indiehubPathname(doc: Document): string {
	return doc.defaultView?.location?.pathname ?? '';
}

function isIndiehubAuthPath(doc: Document): boolean {
	const path = indiehubPathname(doc);
	return path === '/auth/login' || path.startsWith('/auth/login/') || path.startsWith('/auth/sign');
}

function isIndiehubAuthGateVisible(doc: Document): boolean {
	const text = doc.body?.textContent ?? '';
	if (/welcome back/i.test(text) && /github/i.test(text)) return true;
	if (/welcome back/i.test(text) && doc.querySelector('input[type="email"]')) return true;
	const password = doc.querySelector('input[type="password"]');
	const email = doc.querySelector('input[type="email"]');
	return Boolean(password && email);
}

function hasIndiehubSubmitDetailsEditor(doc: Document): boolean {
	return Boolean(
		doc.querySelector(
			"input[name='name'], input[aria-label*='name' i], .ProseMirror, [contenteditable='true'], input[type='file'][accept*='image']"
		)
	);
}

function hasIndiehubSubmitStepper(doc: Document): boolean {
	const text = doc.body?.textContent ?? '';
	return /\bdetails\b/i.test(text) && /\bpayment\b/i.test(text) && /\bpublish\b/i.test(text);
}

function isIndiehubSubmitWithoutDetails(doc: Document): boolean {
	const path = indiehubPathname(doc);
	if (path !== '/submit' && !path.startsWith('/submit/')) return false;
	if (hasIndiehubSubmitDetailsEditor(doc)) return false;
	if (hasIndiehubSubmitStepper(doc)) return false;
	return isIndiehubAuthGateVisible(doc) || /login to your account/i.test(doc.body?.textContent ?? '');
}

export function isIndiehubLoggedIn(doc: Document = document): boolean {
	if (isIndiehubAuthPath(doc)) return false;
	if (isIndiehubAuthGateVisible(doc)) return false;

	const path = indiehubPathname(doc);
	if ((path === '/submit' || path.startsWith('/submit/')) && hasIndiehubSubmitDetailsEditor(doc)) {
		return true;
	}

	if (doc.querySelector(INDIEHUB_LOGIN_NAV_SELECTOR)) return false;
	if (isIndiehubSubmitWithoutDetails(doc)) return false;
	return true;
}