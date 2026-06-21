import type { CreateSocialPostChannelViewModel } from '$lib/channels/GetChannel.presenter.svelte';

export const X_LANDING_MOCK_CHANNEL: CreateSocialPostChannelViewModel = {
	id: 'landing-mock-x',
	internalId: 'landing-mock-x-internal',
	name: 'OpenQuok',
	identifier: 'x',
	picture: '/landing/social-profile.webp',
	type: 'social',
	disabled: false,
	inBetweenSteps: false,
	refreshNeeded: false,
	schedulable: true,
	unschedulableReason: null,
	group: null,
	additionalSettings: '[]',
	postingTimes: [{ time: 540 }]
};

export const X_LANDING_MOCK_BODY =
	'Ship the launch tweet, then queue one follow-up reply with a delay.';

export const X_LANDING_MOCK_SCHEDULED_LOCAL = '2026-06-12T09:00';

export const X_LANDING_MOCK_MEDIA_URLS = ['/landing/social-profile.webp'];

export const X_LANDING_MOCK_THREAD_REPLIES = [
	{
		id: 'landing-x-reply-1',
		message: 'Thread reply publishes after your chosen delay',
		delaySeconds: 300
	}
];

export const X_LANDING_MOCK_PROVIDER_SETTINGS = {
	x: {
		whoCanReplyPost: 'following' as const,
		communityUrl: '',
		madeWithAi: false,
		paidPartnership: false,
		enabled: true,
		message: "That's a wrap — thanks for reading."
	}
};
