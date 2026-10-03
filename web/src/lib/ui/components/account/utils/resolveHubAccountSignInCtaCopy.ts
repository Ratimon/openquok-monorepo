import type { HubAccountSignInCtaVariant } from '$lib/ui/components/account/hubAccountSignInCta.types';

export type HubAccountSignInCtaCopy = {
	title: string;
	description: string;
	inlineHint: string;
};

export function resolveHubAccountSignInCtaCopy(
	variant: HubAccountSignInCtaVariant
): HubAccountSignInCtaCopy {
	switch (variant) {
		case 'listings':
			return {
				title: 'Sign in to create your own library',
				description:
					'Create/compose building blocks and playbooks, then publish to the public hub.',
				inlineHint:
					'Bookmarks on this device stay local until you sign in. Sign in to sync Saved → Libs and use Your library.'
			};
		case 'backlinks':
			return {
				title: 'Sign in manage as shortlist',
				description:
					'Reorder saved sites and mark outreach Done.',
				inlineHint:
					'Your shortlist is saved on this device. Sign in to reorder, and mark outreach Done.'
			};
	}
}
