import type { CreateSocialPostChannelViewModel } from '$lib/channels/GetChannel.presenter.svelte';
import { THREADS_CROSS_ACCOUNT_DEFAULT_DELAY_MS } from '$lib/posts/utils/create-post';
import {
	LANDING_MOCK_BRAND_PROFILE,
	LANDING_MOCK_CROSS_ACCOUNT_COMMENT,
	LANDING_MOCK_PERSONAL_PROFILE
} from '$lib/ui/templates/bento/minor-templates/landing/landingMockProfiles';

/** Company Threads profile — publishes the main thread in landing mocks. */
export const THREADS_LANDING_MOCK_CHANNEL: CreateSocialPostChannelViewModel = {
	id: 'landing-mock-threads',
	internalId: 'landing-mock-threads-internal',
	name: 'OpenQuok Brand',
	identifier: 'threads',
	picture: LANDING_MOCK_BRAND_PROFILE,
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

/** Personal Threads profile — cross-account comment after the company thread. */
export const THREADS_LANDING_MOCK_ACTING_CHANNEL: CreateSocialPostChannelViewModel = {
	id: 'landing-mock-threads-brand',
	internalId: 'landing-mock-threads-brand-internal',
	name: 'OpenQuok',
	identifier: 'threads',
	picture: LANDING_MOCK_PERSONAL_PROFILE,
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

export const THREADS_LANDING_MOCK_CHANNELS = [
	THREADS_LANDING_MOCK_CHANNEL,
	THREADS_LANDING_MOCK_ACTING_CHANNEL
];

export const THREADS_LANDING_MOCK_CROSS_ACCOUNT_PLUG_DEFS = [
	{
		identifier: 'threads-cross-account-comment',
		title: 'Add comments by other accounts',
		description: 'Choose other Threads channels.',
		pickIntegration: ['threads'],
		fields: [
			{
				name: 'comment',
				description: 'The comment to add to the thread',
				type: 'textarea',
				placeholder: 'Enter your comment here'
			}
		]
	}
];

export const THREADS_LANDING_MOCK_BODY =
	'Ship the company thread — a personal profile can comment after publish.';

/** `datetime-local` value for the mock schedule footer (Friday 9:00 AM). */
export const THREADS_LANDING_MOCK_SCHEDULED_LOCAL = '2026-06-12T09:00';

export const THREADS_LANDING_MOCK_MEDIA_URLS = [LANDING_MOCK_BRAND_PROFILE];

export const THREADS_LANDING_MOCK_THREAD_REPLIES = [
	{
		id: 'landing-threads-reply-1',
		message: 'Each reply runs after your chosen delay',
		delaySeconds: 300
	}
];

export const THREADS_LANDING_MOCK_PROVIDER_SETTINGS = {
	threads: {
		enabled: false,
		message: '',
		internalEngagementPlug: {
			enabled: false,
			delaySeconds: 120,
			message: '',
			plugName: 'threads-internal-follow-up',
			integrationId: 'landing-mock-threads'
		},
		crossAccountPlugs: [
			{
				plugName: 'threads-cross-account-comment',
				enabled: true,
				delayMs: THREADS_CROSS_ACCOUNT_DEFAULT_DELAY_MS,
				integrationIds: [THREADS_LANDING_MOCK_ACTING_CHANNEL.id],
				fields: {
					comment: LANDING_MOCK_CROSS_ACCOUNT_COMMENT
				}
			}
		]
	}
};
