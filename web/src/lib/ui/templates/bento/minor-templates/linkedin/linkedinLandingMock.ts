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
	postingTimes: [{ time: 540 }],
	editor: 'normal'
};

/** Personal LinkedIn profile — acting account for cross-account comment and reshare preview. */
export const LINKEDIN_LANDING_MOCK_ACTING_CHANNEL: CreateSocialPostChannelViewModel = {
	id: 'landing-mock-linkedin',
	internalId: 'landing-mock-linkedin-internal',
	name: 'OpenQuok',
	identifier: 'linkedin',
	picture: '/landing/social-profile.webp',
	type: 'social',
	disabled: false,
	inBetweenSteps: false,
	refreshNeeded: false,
	schedulable: true,
	unschedulableReason: null,
	group: null,
	postingTimes: [{ time: 540 }],
	editor: 'normal'
};

export const LINKEDIN_LANDING_MOCK_CHANNELS = [
	LINKEDIN_LANDING_MOCK_CHANNEL,
	LINKEDIN_LANDING_MOCK_ACTING_CHANNEL
];

export const LINKEDIN_LANDING_MOCK_CROSS_ACCOUNT_PLUG_DEFS = [
	{
		identifier: 'linkedin-add-comment',
		title: 'Add comments',
		description: 'Choose other LinkedIn channels to comment on this post.',
		pickIntegration: ['linkedin', 'linkedin-page'],
		fields: [
			{
				name: 'comment',
				description: 'The comment to add to the post',
				type: 'textarea',
				placeholder: 'Enter your comment here'
			}
		]
	},
	{
		identifier: 'linkedin-repost-post-users',
		title: 'Add re-posters',
		description: 'Choose other LinkedIn channels to reshare this post.',
		pickIntegration: ['linkedin', 'linkedin-page'],
		fields: [] as Array<{
			name: string;
			description: string;
			type: string;
			placeholder: string;
		}>
	}
];

export const LINKEDIN_LANDING_MOCK_BODY =
	'Case-study carousel queued for your LinkedIn Page — buyers who research your company see polished B2B content, not an empty feed.';

export const LINKEDIN_LANDING_MOCK_SCHEDULED_LOCAL = '2026-06-12T09:00';

export const LINKEDIN_LANDING_MOCK_CAROUSEL_NAME = 'Q2 pipeline playbook';

export const LINKEDIN_LANDING_MOCK_CAROUSEL_BODY =
	'Turn slide decks into a LinkedIn document carousel — OpenQuok builds the PDF and publishes to your Page when buyers are most likely to vet you.';

export const LINKEDIN_LANDING_MOCK_THREAD_REPLIES = [
	{
		id: 'landing-linkedin-reply-1',
		message: 'Comment with the deck link five minutes after publish.',
		delaySeconds: 300
	}
];

export const LINKEDIN_LANDING_MOCK_PROVIDER_SETTINGS = {
	linkedin: {
		postAsImagesCarousel: true,
		carouselName: LINKEDIN_LANDING_MOCK_CAROUSEL_NAME,
		crossAccountPlugs: [
			{
				plugName: 'linkedin-add-comment',
				enabled: true,
				delayMs: 0,
				integrationIds: [LINKEDIN_LANDING_MOCK_ACTING_CHANNEL.id],
				fields: {
					comment: 'Worth a look — sharing the Q2 playbook from our team account.'
				}
			},
			{
				plugName: 'linkedin-repost-post-users',
				enabled: true,
				delayMs: 0,
				integrationIds: [LINKEDIN_LANDING_MOCK_ACTING_CHANNEL.id],
				fields: {} as Record<string, string>
			}
		]
	}
};
