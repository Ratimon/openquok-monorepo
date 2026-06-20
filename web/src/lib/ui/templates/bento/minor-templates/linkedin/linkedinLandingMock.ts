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
	'Your thought-leadership post is ready — queue it for your LinkedIn Page and keep your professional feed consistent without daily manual publishing.';

export const LINKEDIN_LANDING_MOCK_SCHEDULED_LOCAL = '2026-06-12T09:00';

export const LINKEDIN_LANDING_MOCK_CAROUSEL_NAME = 'Product update slides';

export const LINKEDIN_LANDING_MOCK_CAROUSEL_BODY =
	'Turn your slide images into a LinkedIn document carousel — OpenQuok builds the PDF and publishes it to your Page when you schedule.';
