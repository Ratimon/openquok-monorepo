/** Header sign-in when signed out (`/login/` from site nav when hydrated). */
export const ALTERNATIVETO_LOGIN_NAV_SELECTOR =
	'a[href="/login/"], a[href^="/login/?"], a[href="/login"]';

export const ALTERNATIVETO_LOGIN_URL = 'https://alternativeto.net/login/?returnUrl=/manage-item/';

function alternativetoPathname(doc: Document): string {
	return doc.defaultView?.location?.pathname ?? '';
}

function isAlternativetoLoginPath(doc: Document): boolean {
	const path = alternativetoPathname(doc);
	return path === '/login' || path.startsWith('/login/');
}

function isAlternativetoAuthGateVisible(doc: Document): boolean {
	const text = doc.body?.textContent ?? '';
	if (/sign in to alternativeto/i.test(text)) return true;
	if (/continue with google/i.test(text) && /github|apple|email/i.test(text)) return true;
	if (/log in to your account/i.test(text) && /google/i.test(text)) return true;
	const password = doc.querySelector('input[type="password"]');
	const email = doc.querySelector('input[type="email"]');
	return Boolean(password && email);
}

function hasAlternativetoManageItemEditor(doc: Document): boolean {
	return Boolean(
		doc.querySelector(
			"input[name*='product_name' i], input[name='name'], input[aria-label*='application name' i], textarea[name*='short' i], input[type='url'][name*='website' i], input[type='file'][name*='icon' i]"
		)
	);
}

function hasAlternativetoUserEditForm(doc: Document): boolean {
	return Boolean(
		doc.querySelector(
			"input[name*='github' i], input[name*='twitter' i], input[aria-label*='github' i], input[aria-label*='twitter' i]"
		)
	);
}

function isAlternativetoManageItemWithoutForm(doc: Document): boolean {
	const path = alternativetoPathname(doc);
	if (path !== '/manage-item' && !path.startsWith('/manage-item/')) return false;
	if (hasAlternativetoManageItemEditor(doc)) return false;
	return isAlternativetoAuthGateVisible(doc) || /sign in to continue/i.test(doc.body?.textContent ?? '');
}

function isAlternativetoUserEditWithoutForm(doc: Document): boolean {
	const path = alternativetoPathname(doc);
	if (path !== '/user/edit' && !path.startsWith('/user/edit/')) return false;
	if (hasAlternativetoUserEditForm(doc)) return false;
	return isAlternativetoAuthGateVisible(doc);
}

export function isAlternativetoLoggedIn(doc: Document = document): boolean {
	if (isAlternativetoLoginPath(doc)) return false;
	if (isAlternativetoAuthGateVisible(doc)) return false;

	const path = alternativetoPathname(doc);
	if (
		(path === '/manage-item' || path.startsWith('/manage-item/')) &&
		hasAlternativetoManageItemEditor(doc)
	) {
		return true;
	}
	if ((path === '/user/edit' || path.startsWith('/user/edit/')) && hasAlternativetoUserEditForm(doc)) {
		return true;
	}

	if (doc.querySelector(ALTERNATIVETO_LOGIN_NAV_SELECTOR)) return false;
	if (isAlternativetoManageItemWithoutForm(doc)) return false;
	if (isAlternativetoUserEditWithoutForm(doc)) return false;
	return true;
}