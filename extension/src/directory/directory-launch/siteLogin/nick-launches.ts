/** Desktop header CTA when signed out (`data-cta` from nicklaunches.com nav; footer still links to `/signin/` when signed in). */
export const NICK_LAUNCHES_LOGIN_NAV_SELECTOR = 'a[data-cta="nav_sign_in"]';

export const NICK_LAUNCHES_LOGIN_URL =
	'https://nicklaunches.com/signin/?callbackUrl=/submit/new/';

function nickLaunchesPathname(doc: Document): string {
	return doc.defaultView?.location?.pathname ?? '';
}

function isNickLaunchesSignInPath(doc: Document): boolean {
	const path = nickLaunchesPathname(doc);
	return path === '/signin' || path.startsWith('/signin/');
}

function isNickLaunchesAuthGateVisible(doc: Document): boolean {
	const text = doc.body?.textContent ?? '';
	if (/sign in with google/i.test(text) && /welcome back/i.test(text)) return true;
	if (/sign in to continue/i.test(text)) return true;
	const password = doc.querySelector('input[type="password"]');
	const signupLink = doc.querySelector(
		'a[href*="sign-up"], a[href*="signup"], a[href*="mode=signup"]'
	);
	return Boolean(password && signupLink);
}

function hasNickLaunchesListingEditor(doc: Document): boolean {
	return Boolean(
		doc.querySelector(
			'input[name="name"], input[name="url"], textarea[name="description"], textarea[name="tagline"], .ProseMirror, [contenteditable="true"]'
		)
	);
}

function isNickLaunchesSubmitNewWithoutListing(doc: Document): boolean {
	const path = nickLaunchesPathname(doc);
	if (!path.startsWith('/submit/new')) return false;
	return !hasNickLaunchesListingEditor(doc);
}

export function isNickLaunchesLoggedIn(doc: Document = document): boolean {
	if (isNickLaunchesSignInPath(doc)) return false;
	if (isNickLaunchesAuthGateVisible(doc)) return false;

	const path = nickLaunchesPathname(doc);
	if (path.startsWith('/submit/new') && hasNickLaunchesListingEditor(doc)) {
		return true;
	}

	if (doc.querySelector(NICK_LAUNCHES_LOGIN_NAV_SELECTOR)) return false;
	if (isNickLaunchesSubmitNewWithoutListing(doc)) return false;
	return true;
}