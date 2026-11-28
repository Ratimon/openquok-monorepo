export const TRUSTPILOT_LOGIN_URL = 'https://businessapp.b2b.trustpilot.com/';

function trustpilotPathname(doc: Document): string {
	return doc.defaultView?.location?.pathname ?? '';
}

function isTrustpilotAuthPath(doc: Document): boolean {
	const path = trustpilotPathname(doc).toLowerCase();
	return (
		path.includes('/login') ||
		path.includes('/sign-in') ||
		path.includes('/signin') ||
		path.includes('/auth/')
	);
}

function isTrustpilotCompanySettingsPath(doc: Document): boolean {
	return trustpilotPathname(doc).toLowerCase().includes('company-settings');
}

/** At least one mapped autofill control visible (sections may mount one at a time). */
function hasTrustpilotCompanySettingsEditor(doc: Document): boolean {
	const hasName = Boolean(
		doc.querySelector(
			"input[aria-label*='company name' i], input[placeholder*='company name' i], input[name*='company' i][name*='name' i], input[name*='company_name' i]"
		)
	);
	const hasDomain = Boolean(
		doc.querySelector(
			"input[aria-label*='domain' i], input[placeholder*='domain' i], input[name*='domain' i], input[type='url']"
		)
	);
	const hasDescription = Boolean(
		doc.querySelector(
			"textarea[aria-label*='describe' i], textarea[placeholder*='describe' i], textarea[name*='description' i], [contenteditable='true'][aria-label*='describe' i]"
		)
	);
	const hasLogo = Boolean(
		doc.querySelector("input[type='file'][accept*='image'], input[type='file'][name*='logo' i]")
	);
	return hasName || hasDomain || hasDescription || hasLogo;
}

/**
 * Logged-in company settings chrome (sidebar sections). Trustpilot mounts one section at a time —
 * do not require every profile field in the DOM at once.
 */
function hasTrustpilotCompanySettingsShell(doc: Document): boolean {
	if (!isTrustpilotCompanySettingsPath(doc)) return false;
	const text = doc.body?.textContent ?? '';
	if (/about your business/i.test(text) && /company description/i.test(text)) return true;
	if (/contact info/i.test(text) && /confirm company details/i.test(text)) return true;
	if (/about your business/i.test(text) && /contact info/i.test(text)) return true;
	return hasTrustpilotCompanySettingsEditor(doc);
}

function hasTrustpilotLoginFormOnly(doc: Document): boolean {
	const password = doc.querySelector('input[type="password"]');
	const email = doc.querySelector('input[type="email"]');
	if (!password || !email) return false;
	if (hasTrustpilotCompanySettingsShell(doc)) return false;
	return true;
}

function isTrustpilotAuthGateVisible(doc: Document): boolean {
	if (hasTrustpilotCompanySettingsShell(doc)) return false;
	if (hasTrustpilotLoginFormOnly(doc)) return true;

	if (isTrustpilotCompanySettingsPath(doc)) {
		return false;
	}

	const text = doc.body?.textContent ?? '';
	if (/sign in to trustpilot business/i.test(text)) return true;
	if (/log in to trustpilot business/i.test(text)) return true;
	return false;
}

export function isTrustpilotLoggedIn(doc: Document = document): boolean {
	if (isTrustpilotAuthPath(doc)) return false;
	if (isTrustpilotAuthGateVisible(doc)) return false;

	if (isTrustpilotCompanySettingsPath(doc)) {
		return hasTrustpilotCompanySettingsShell(doc);
	}

	return true;
}