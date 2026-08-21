import type { CreateSocialPostChannelViewModel } from '$lib/channels/GetChannel.presenter.svelte';

import { LANDING_SOCIAL_PROFILE_URL } from '$lib/ui/templates/bento/minor-templates/landing/landingStaticAssets';

export const DEVTO_LANDING_MOCK_CHANNEL: CreateSocialPostChannelViewModel = {
	id: 'landing-mock-devto',
	internalId: 'landing-mock-devto-internal',
	name: 'OpenQuok on Dev.to',
	identifier: 'devto',
	picture: LANDING_SOCIAL_PROFILE_URL,
	type: 'social',
	disabled: false,
	inBetweenSteps: false,
	refreshNeeded: false,
	schedulable: true,
	unschedulableReason: null,
	group: null,
	postingTimes: [{ time: 540 }]
};

export const DEVTO_LANDING_MOCK_BODY =
	'Queue this markdown article with title, tags, cover, series, and an optional canonical URL before it goes live.';

/** `datetime-local` value for the mock schedule footer (Tuesday 9:00 AM). */
export const DEVTO_LANDING_MOCK_SCHEDULED_LOCAL = '2026-06-16T09:00';

export const DEVTO_LANDING_MOCK_COVER_URL = LANDING_SOCIAL_PROFILE_URL;

export const DEVTO_LANDING_MOCK_PROVIDER_SETTINGS = {
	devto: {
		title: 'Ship technical posts with tags and series you approve',
		organization: 1,
		series: 'Shipping notes',
		tags: [
			{ value: 'webdev', label: 'webdev' },
			{ value: 'productivity', label: 'productivity' }
		],
		mainImage: { path: LANDING_SOCIAL_PROFILE_URL }
	}
};

export const DEVTO_LANDING_MOCK_CANONICAL_SETTINGS = {
	devto: {
		title: 'Syndicate this tutorial to Dev.to without losing the original URL',
		canonical: 'https://openquok.com/docs/social-integration/devto',
		organization: 1,
		tags: [
			{ value: 'webdev', label: 'webdev' },
			{ value: 'opensource', label: 'opensource' }
		],
		mainImage: { path: LANDING_SOCIAL_PROFILE_URL }
	}
};
