import type { HubAccountSignInCtaVariant } from '$lib/ui/components/account/hubAccountSignInCta.types';

const SESSION_KEYS: Record<HubAccountSignInCtaVariant, string> = {
	listings: 'openquok:hub-sign-in-cta-shown:listings:v1',
	backlinks: 'openquok:hub-sign-in-cta-shown:backlinks:v1'
};

export function markHubAccountSignInCtaShown(variant: HubAccountSignInCtaVariant): void {
	if (typeof sessionStorage === 'undefined') return;
	try {
		sessionStorage.setItem(SESSION_KEYS[variant], '1');
	} catch {
		// ignore quota / private mode
	}
}

export function wasHubAccountSignInCtaShown(variant: HubAccountSignInCtaVariant): boolean {
	if (typeof sessionStorage === 'undefined') return true;
	try {
		return sessionStorage.getItem(SESSION_KEYS[variant]) === '1';
	} catch {
		return true;
	}
}

/** Once per session after the first logged-out bookmark add on a public hub. */
export function offerHubAccountSignInCtaAfterBookmark(args: {
	variant: HubAccountSignInCtaVariant;
	isLoggedIn: boolean;
	addedBookmark: boolean;
}): boolean {
	if (args.isLoggedIn || !args.addedBookmark) return false;
	if (wasHubAccountSignInCtaShown(args.variant)) return false;
	markHubAccountSignInCtaShown(args.variant);
	return true;
}
