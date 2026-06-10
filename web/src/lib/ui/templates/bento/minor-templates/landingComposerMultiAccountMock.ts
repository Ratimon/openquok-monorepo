import type { CreateSocialPostChannelViewModel } from '$lib/channels/GetChannel.presenter.svelte';

import {
	FACEBOOK_LANDING_MOCK_CHANNEL,
	FACEBOOK_LANDING_MOCK_LINK_URL
} from '$lib/ui/templates/bento/minor-templates/facebookLandingMock';
import {
	INSTAGRAM_LANDING_MOCK_CHANNEL,
	INSTAGRAM_LANDING_MOCK_MEDIA_URLS,
	INSTAGRAM_LANDING_MOCK_THREAD_REPLIES
} from '$lib/ui/templates/bento/minor-templates/instagramLandingMock';
import {
	THREADS_LANDING_MOCK_CHANNEL,
	THREADS_LANDING_MOCK_MEDIA_URLS,
	THREADS_LANDING_MOCK_PROVIDER_SETTINGS,
	THREADS_LANDING_MOCK_THREAD_REPLIES
} from '$lib/ui/templates/bento/minor-templates/threadsLandingMock';

export const LANDING_COMPOSER_MOCK_CHANNELS: CreateSocialPostChannelViewModel[] = [
	FACEBOOK_LANDING_MOCK_CHANNEL,
	THREADS_LANDING_MOCK_CHANNEL,
	INSTAGRAM_LANDING_MOCK_CHANNEL
];

export const LANDING_COMPOSER_MOCK_SELECTED_IDS = LANDING_COMPOSER_MOCK_CHANNELS.map((ch) => ch.id);

export const LANDING_COMPOSER_MOCK_GLOBAL_BODY =
	'One draft for every connected account — click a target to customize copy, media, and platform settings without starting over.';

export const LANDING_COMPOSER_MOCK_CUSTOM_BODIES: Record<string, string> = {
	[FACEBOOK_LANDING_MOCK_CHANNEL.id]:
		'Add a link URL for a Facebook link-preview card, or attach MP4 Reels for Page video posts.',
	[THREADS_LANDING_MOCK_CHANNEL.id]:
		'Attach media and queue one follow-up reply after publish — tune thread finisher in settings.',
	[INSTAGRAM_LANDING_MOCK_CHANNEL.id]:
		'Queue a carousel or single MP4 Reel — set post type, collaborators, and text follow-up comments.'
};

/** `datetime-local` value for the mock schedule footer (Friday 9:00 AM). */
export const LANDING_COMPOSER_MOCK_SCHEDULED_LOCAL = '2026-06-12T09:00';

export const LANDING_COMPOSER_MOCK_MEDIA_BY_CHANNEL: Record<string, string[]> = {
	[THREADS_LANDING_MOCK_CHANNEL.id]: THREADS_LANDING_MOCK_MEDIA_URLS,
	[INSTAGRAM_LANDING_MOCK_CHANNEL.id]: INSTAGRAM_LANDING_MOCK_MEDIA_URLS
};

export const LANDING_COMPOSER_MOCK_THREAD_REPLIES_BY_CHANNEL: Record<
	string,
	{ id: string; message: string; delaySeconds: number }[]
> = {
	[THREADS_LANDING_MOCK_CHANNEL.id]: [...THREADS_LANDING_MOCK_THREAD_REPLIES],
	[INSTAGRAM_LANDING_MOCK_CHANNEL.id]: [...INSTAGRAM_LANDING_MOCK_THREAD_REPLIES]
};

export const LANDING_COMPOSER_MOCK_PROVIDER_SETTINGS_BY_CHANNEL: Record<string, Record<string, unknown>> =
	{
		[FACEBOOK_LANDING_MOCK_CHANNEL.id]: {
			facebook: { url: FACEBOOK_LANDING_MOCK_LINK_URL }
		},
		[THREADS_LANDING_MOCK_CHANNEL.id]: THREADS_LANDING_MOCK_PROVIDER_SETTINGS,
		[INSTAGRAM_LANDING_MOCK_CHANNEL.id]: {
			instagram: {
				postType: 'post' as const,
				collaborators: ['openquok'],
				trialReel: false,
				graduationStrategy: 'MANUAL' as const
			}
		}
	};
