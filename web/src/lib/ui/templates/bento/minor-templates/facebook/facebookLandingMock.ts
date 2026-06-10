import type { CreateSocialPostChannelViewModel } from '$lib/channels/GetChannel.presenter.svelte';

export const FACEBOOK_LANDING_MOCK_CHANNEL: CreateSocialPostChannelViewModel = {
	id: 'landing-mock-facebook',
	internalId: 'landing-mock-facebook-internal',
	name: 'OpenQuok Brand Page',
	identifier: 'facebook',
	picture: '/landing/social-profile.webp',
	type: 'social',
	disabled: false,
	inBetweenSteps: false,
	refreshNeeded: false,
	schedulable: true,
	unschedulableReason: null,
	group: null,
	postingTimes: [{ time: 540 }]
};

export const FACEBOOK_LANDING_MOCK_BODY =
	'Friday Reel is ready — queue this Page post now and OpenQuok publishes while you prep the next shoot.';

/** `datetime-local` value for the mock schedule footer (Friday 9:00 AM). */
export const FACEBOOK_LANDING_MOCK_SCHEDULED_LOCAL = '2026-06-12T09:00';

export const FACEBOOK_LANDING_MOCK_LINK_URL = 'https://openquok.com/docs/social-integration/facebook';

export const FACEBOOK_LANDING_MOCK_LINK_BODY =
	'Schedule MP4 Reels to your Page, or add a URL on text-only posts for link-preview cards — tune Facebook settings per post when you customize a network.';
