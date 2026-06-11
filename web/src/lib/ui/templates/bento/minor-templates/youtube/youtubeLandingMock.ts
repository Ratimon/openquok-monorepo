import type { CreateSocialPostChannelViewModel } from '$lib/channels/GetChannel.presenter.svelte';

import { LANDING_SOCIAL_PROFILE_URL } from '$lib/ui/templates/bento/minor-templates/landing/landingStaticAssets';

export const YOUTUBE_LANDING_MOCK_CHANNEL: CreateSocialPostChannelViewModel = {
	id: 'landing-mock-youtube',
	internalId: 'landing-mock-youtube-internal',
	name: 'OpenQuok Channel',
	identifier: 'youtube',
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

export const YOUTUBE_LANDING_MOCK_BODY =
	'Product walkthrough — schedule this MP4 upload with title, privacy, tags, and an optional custom thumbnail before publish.';

/** `datetime-local` value for the mock schedule footer (Friday 9:00 AM). */
export const YOUTUBE_LANDING_MOCK_SCHEDULED_LOCAL = '2026-06-12T09:00';

/** Demo video for the 16:9 YouTube preview panel. */
export const YOUTUBE_LANDING_MOCK_MEDIA_URLS = ['/landing/2-calendar-filters.mp4'];

export const YOUTUBE_LANDING_MOCK_PROVIDER_SETTINGS = {
	youtube: {
		title: 'OpenQuok walkthrough — schedule MP4 uploads from one calendar',
		type: 'public' as const,
		selfDeclaredMadeForKids: 'no' as const,
		tags: [
			{ value: 'scheduling', label: 'scheduling' },
			{ value: 'youtube', label: 'youtube' }
		],
		thumbnail: { path: 'composer-media/landing-youtube-thumb.webp' }
	}
};
