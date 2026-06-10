import type { CreateSocialPostChannelViewModel } from '$lib/channels/GetChannel.presenter.svelte';

import { LANDING_SOCIAL_PROFILE_URL } from '$lib/ui/templates/bento/minor-templates/landing/landingStaticAssets';

export const INSTAGRAM_LANDING_MOCK_BUSINESS_CHANNEL: CreateSocialPostChannelViewModel = {
	id: 'landing-mock-instagram-business',
	internalId: 'landing-mock-instagram-business-internal',
	name: 'OpenQuok Brand',
	identifier: 'instagram',
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

export const INSTAGRAM_LANDING_MOCK_STANDALONE_CHANNEL: CreateSocialPostChannelViewModel = {
	id: 'landing-mock-instagram-standalone',
	internalId: 'landing-mock-instagram-standalone-internal',
	name: 'OpenQuok Studio',
	identifier: 'instagram-standalone',
	picture: LANDING_SOCIAL_PROFILE_URL,
	type: 'social',
	disabled: false,
	inBetweenSteps: false,
	refreshNeeded: false,
	schedulable: true,
	unschedulableReason: null,
	group: null,
	postingTimes: [{ time: 600 }]
};

/** Composer / kanban bentos use the Standalone channel (gradient glyph via `socialProviderIcon`). */
export const INSTAGRAM_LANDING_MOCK_CHANNEL = INSTAGRAM_LANDING_MOCK_STANDALONE_CHANNEL;

export const INSTAGRAM_LANDING_ANALYTICS_MOCK_CHANNELS: CreateSocialPostChannelViewModel[] = [
	INSTAGRAM_LANDING_MOCK_BUSINESS_CHANNEL,
	INSTAGRAM_LANDING_MOCK_STANDALONE_CHANNEL
];

export const INSTAGRAM_LANDING_MOCK_BODY =
	'Queue a carousel or single MP4 Reel — tune post type, collaborators, and text follow-up comments before publish.';

/** `datetime-local` value for the mock schedule footer (Friday 9:00 AM). */
export const INSTAGRAM_LANDING_MOCK_SCHEDULED_LOCAL = '2026-06-12T09:00';

export const INSTAGRAM_LANDING_MOCK_MEDIA_URLS = [
	LANDING_SOCIAL_PROFILE_URL,
	LANDING_SOCIAL_PROFILE_URL
];

export const INSTAGRAM_LANDING_MOCK_THREAD_REPLIES = [
	{
		id: 'landing-instagram-reply-1',
		message: 'Link in bio for the full drop — text-only follow-ups publish after your delay.',
		delaySeconds: 120
	}
];

export const INSTAGRAM_LANDING_MOCK_PROVIDER_SETTINGS = {
	instagram: {
		postType: 'post' as const,
		collaborators: ['openquok'],
		trialReel: false,
		graduationStrategy: 'MANUAL' as const
	}
};
