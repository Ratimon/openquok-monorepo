import type { CreateSocialPostChannelViewModel } from '$lib/channels/GetChannel.presenter.svelte';

export const THREADS_LANDING_MOCK_CHANNEL: CreateSocialPostChannelViewModel = {
	id: 'landing-mock-threads',
	internalId: 'landing-mock-threads-internal',
	name: 'OpenQuok',
	identifier: 'threads',
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

export const THREADS_LANDING_MOCK_BODY =
	'Attach media and queue one follow-up reply after publish.';

/** `datetime-local` value for the mock schedule footer (Friday 9:00 AM). */
export const THREADS_LANDING_MOCK_SCHEDULED_LOCAL = '2026-06-12T09:00';

export const THREADS_LANDING_MOCK_MEDIA_URLS = ['/landing/social-profile.webp'];

export const THREADS_LANDING_MOCK_THREAD_REPLIES = [
	{
		id: 'landing-threads-reply-1',
		message: 'Each reply runs after your chosen delay',
		delaySeconds: 300
	}
];

export const THREADS_LANDING_MOCK_PROVIDER_SETTINGS = {
	threads: {
		enabled: true,
		message: "That's a wrap — thanks for reading.",
		internalEngagementPlug: {
			enabled: false,
			delaySeconds: 120,
			message: '',
			plugName: 'threads-internal-follow-up',
			integrationId: 'landing-mock-threads'
		}
	}
};
