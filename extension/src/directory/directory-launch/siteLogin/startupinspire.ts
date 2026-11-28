/** Header sign-in link when signed out (footer may retain `/login` in menus while signed in). */
export const STARTUPINSPIRE_LOGIN_NAV_SELECTOR = 'a[href="/login"], a[href^="/login?"]';

export const STARTUPINSPIRE_LOGIN_URL = 'https://www.startupinspire.com/login';

/** Account menu targets (Angular renders `/dashboard`, not `/account`). */
const STARTUPINSPIRE_SIGNED_IN_NAV_SELECTOR =
	'a[href="/dashboard/account"], a[href^="/dashboard/account?"], a[href="/account"], a[href^="/account?"]';

const STARTUPINSPIRE_STORED_USER_KEY = 'currentUser';

function startupinspirePathname(doc: Document): string {
	return doc.defaultView?.location?.pathname ?? '';
}

function isStartupinspireAuthPath(doc: Document): boolean {
	const path = startupinspirePathname(doc).toLowerCase();
	return (
		path === '/login' ||
		path.startsWith('/login/') ||
		path === '/register' ||
		path.startsWith('/register/')
	);
}

function isStartupinspireAuthGateVisible(doc: Document): boolean {
	const password = doc.querySelector('input[type="password"]');
	const email = doc.querySelector(
		'input[type="email"], input[name*="email" i], input[placeholder*="email" i]'
	);
	if (!password || !email) return false;
	const text = doc.body?.textContent ?? '';
	if (/\blog in\b/i.test(text)) return true;
	if (/register here/i.test(text)) return true;
	if (/forgot password/i.test(text)) return true;
	return false;
}

/** Log in CTA in header/nav, not stale footer links. */
function hasStartupinspireHeaderLoginNav(doc: Document): boolean {
	for (const el of doc.querySelectorAll(STARTUPINSPIRE_LOGIN_NAV_SELECTOR)) {
		if (!(el instanceof HTMLAnchorElement)) continue;
		if (el.closest('footer, [class*="footer" i]')) continue;
		const label = (el.textContent ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
		if (!label) continue;
		if (label.includes('log in') || label === 'login') return true;
	}
	return false;
}

function hasStartupinspireSignedInNav(doc: Document): boolean {
	return Boolean(doc.querySelector(STARTUPINSPIRE_SIGNED_IN_NAV_SELECTOR));
}

/** Site auth is persisted in `localStorage` (`currentUser` with `token` / `user.id`). */
function hasStartupinspireStoredSession(doc: Document): boolean {
	try {
		const storage = doc.defaultView?.localStorage;
		if (!storage) return false;
		const raw = storage.getItem(STARTUPINSPIRE_STORED_USER_KEY);
		if (!raw) return false;
		const parsed = JSON.parse(raw) as { token?: string; user?: { id?: number } };
		if (typeof parsed?.token === 'string' && parsed.token.trim().length > 0) return true;
		const userId = parsed?.user?.id;
		return typeof userId === 'number' && userId > 0;
	} catch {
		return false;
	}
}

function isStartupinspirePricingPath(doc: Document): boolean {
	const path = startupinspirePathname(doc).toLowerCase();
	return path === '/pricing' || path.startsWith('/pricing/');
}

/** Startup create/edit form (`formcontrolname` from dashboard startup wizard). */
function hasStartupinspireStartupFormEditor(doc: Document): boolean {
	return Boolean(
		doc.querySelector(
			"input[formcontrolname='startup_name'], input[name='startup_name'], input[formcontrolname='startup_headline'], input[formcontrolname='startup_url'], input[formcontrolname='startup_technology']"
		)
	);
}

function isStartupinspireDashboardPath(doc: Document): boolean {
	return startupinspirePathname(doc).toLowerCase().startsWith('/dashboard');
}

function isStartupinspireStartupWizardPath(doc: Document): boolean {
	const path = startupinspirePathname(doc).toLowerCase();
	return path.startsWith('/dashboard/startup');
}

export function isStartupinspireLoggedIn(doc: Document = document): boolean {
	if (isStartupinspireAuthPath(doc)) return false;
	if (isStartupinspireAuthGateVisible(doc)) return false;

	if (hasStartupinspireStoredSession(doc)) return true;

	if (hasStartupinspireSignedInNav(doc)) return true;

	if (isStartupinspireStartupWizardPath(doc)) {
		return hasStartupinspireStartupFormEditor(doc);
	}

	if (isStartupinspireDashboardPath(doc)) {
		return true;
	}

	if (hasStartupinspireHeaderLoginNav(doc)) return false;

	// Pricing has no header login link; rely on `currentUser` above for session checks.
	if (isStartupinspirePricingPath(doc)) return false;

	// Other signed-out public routes (startup gallery, …)
	return false;
}