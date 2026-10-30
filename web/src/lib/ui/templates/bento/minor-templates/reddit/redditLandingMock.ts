import type { CreateSocialPostChannelViewModel } from '$lib/channels/GetChannel.presenter.svelte';

import { url } from '$lib/utils/path';

import { LANDING_SOCIAL_PROFILE_URL } from '$lib/ui/templates/bento/minor-templates/landing/landingStaticAssets';

export const REDDIT_LANDING_MOCK_PICTURE = url('/docs/_assets/platforms/socials/reddit.svg');

export const REDDIT_LANDING_MOCK_CHANNEL: CreateSocialPostChannelViewModel = {
	id: 'landing-mock-reddit',
	internalId: 'landing-mock-reddit-internal',
	name: 'Reddit',
	identifier: 'reddit',
	picture: REDDIT_LANDING_MOCK_PICTURE,
	type: 'social',
	disabled: false,
	inBetweenSteps: false,
	refreshNeeded: false,
	schedulable: true,
	unschedulableReason: null,
	group: null,
	postingTimes: [{ time: 540 }],
	editor: 'markdown'
};

export const REDDIT_LANDING_MOCK_CHANNELS = [REDDIT_LANDING_MOCK_CHANNEL];

export const REDDIT_LANDING_MOCK_BODY = `## This week

- Shipped markdown drafts on the calendar
- You submit on **reddit.com** when each slot is due

No server auto-post — you click Post yourself.`;

/** `datetime-local` value for the mock schedule footer (Tuesday 9:00 AM). */
export const REDDIT_LANDING_MOCK_SCHEDULED_LOCAL = '2026-06-16T09:00';

export const REDDIT_LANDING_MOCK_PROVIDER_SETTINGS = {
	reddit: {
		subreddit: 'buildinpublic',
		title: 'What we shipped this week'
	}
};

export const REDDIT_LANDING_MOCK_MEDIA_URL = LANDING_SOCIAL_PROFILE_URL;
