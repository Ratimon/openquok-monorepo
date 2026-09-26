import type { CreateSocialPostChannelViewModel } from '$lib/channels/GetChannel.presenter.svelte';
import { LANDING_MOCK_BRAND_PROFILE } from '$lib/ui/templates/bento/minor-templates/landing/landingMockProfiles';

export const BLUESKY_LANDING_MOCK_CHANNEL: CreateSocialPostChannelViewModel = {
	id: 'landing-mock-bluesky',
	internalId: 'landing-mock-bluesky-internal',
	name: 'openquok.bsky.social',
	identifier: 'bluesky',
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
	editor: 'normal'
};

export const BLUESKY_LANDING_MOCK_CHANNELS = [BLUESKY_LANDING_MOCK_CHANNEL];

export const BLUESKY_LANDING_MOCK_BODY =
	'Ship the weekly product update — up to four images or one video, 300 characters max.';

export const BLUESKY_LANDING_MOCK_SCHEDULED_LOCAL = '2026-06-14T09:00';

export const BLUESKY_LANDING_MOCK_MEDIA_URLS = [LANDING_MOCK_BRAND_PROFILE];

export const BLUESKY_LANDING_MOCK_THREAD_REPLIES = [
	{
		id: 'landing-bluesky-reply-1',
		message: 'Follow-up reply publishes after your chosen delay.',
		delaySeconds: 300
	}
];
