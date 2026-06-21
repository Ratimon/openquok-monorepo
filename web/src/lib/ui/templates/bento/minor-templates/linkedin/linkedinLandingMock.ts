import type { CreateSocialPostChannelViewModel } from '$lib/channels/GetChannel.presenter.svelte';

export const LINKEDIN_LANDING_MOCK_CHANNEL: CreateSocialPostChannelViewModel = {
	id: 'landing-mock-linkedin-page',
	internalId: 'landing-mock-linkedin-page-internal',
	name: 'OpenQuok Company',
	identifier: 'linkedin-page',
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

export const LINKEDIN_LANDING_MOCK_BODY =
	'Case-study carousel queued for your LinkedIn Page — buyers who research your company see polished B2B content, not an empty feed.';

export const LINKEDIN_LANDING_MOCK_SCHEDULED_LOCAL = '2026-06-12T09:00';

export const LINKEDIN_LANDING_MOCK_CAROUSEL_NAME = 'Q2 pipeline playbook';

export const LINKEDIN_LANDING_MOCK_CAROUSEL_BODY =
	'Turn slide decks into a LinkedIn document carousel — OpenQuok builds the PDF and publishes to your Page when buyers are most likely to vet you.';
