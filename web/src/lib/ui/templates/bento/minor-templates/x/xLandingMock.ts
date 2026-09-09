import type { CreateSocialPostChannelViewModel } from '$lib/channels/GetChannel.presenter.svelte';
import {
	LANDING_MOCK_BRAND_PROFILE,
	LANDING_MOCK_PERSONAL_PROFILE
} from '$lib/ui/templates/bento/minor-templates/landing/landingMockProfiles';

/** Company X profile — publishes the main post in landing mocks. */
export const X_LANDING_MOCK_CHANNEL: CreateSocialPostChannelViewModel = {
	id: 'landing-mock-x',
	internalId: 'landing-mock-x-internal',
	name: 'OpenQuok Brand',
	identifier: 'x',
	picture: LANDING_MOCK_BRAND_PROFILE,
	type: 'social',
	disabled: false,
	inBetweenSteps: false,
	refreshNeeded: false,
	schedulable: true,
	unschedulableReason: null,
	group: null,
	additionalSettings: '[]',
	postingTimes: [{ time: 540 }],
	editor: 'html'
};

/** Personal X profile — cross-account repost after the company post. */
export const X_LANDING_MOCK_ACTING_CHANNEL: CreateSocialPostChannelViewModel = {
	id: 'landing-mock-x-brand',
	internalId: 'landing-mock-x-brand-internal',
	name: 'OpenQuok',
	identifier: 'x',
	picture: LANDING_MOCK_PERSONAL_PROFILE,
	type: 'social',
	disabled: false,
	inBetweenSteps: false,
	refreshNeeded: false,
	schedulable: true,
	unschedulableReason: null,
	group: null,
	additionalSettings: '[]',
	postingTimes: [{ time: 540 }],
	editor: 'html'
};

export const X_LANDING_MOCK_CHANNELS = [X_LANDING_MOCK_CHANNEL, X_LANDING_MOCK_ACTING_CHANNEL];

export const X_LANDING_MOCK_CROSS_ACCOUNT_PLUG_DEFS = [
	{
		identifier: 'x-repost-post-users',
		title: 'Add re-posters',
		description: 'Choose other X channels to repost this post.',
		pickIntegration: ['x'],
		fields: [] as Array<{
			name: string;
			description: string;
			type: string;
			placeholder: string;
		}>
	}
];

export const X_LANDING_MOCK_BODY =
	'Ship the company launch post — a personal profile can repost after publish.';

export const X_LANDING_MOCK_SCHEDULED_LOCAL = '2026-06-12T09:00';

export const X_LANDING_MOCK_MEDIA_URLS = [LANDING_MOCK_BRAND_PROFILE];

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
		enabled: false,
		message: '',
		crossAccountPlugs: [
			{
				plugName: 'x-repost-post-users',
				enabled: true,
				delayMs: 0,
				integrationIds: [X_LANDING_MOCK_ACTING_CHANNEL.id],
				fields: {}
			}
		]
	}
};
