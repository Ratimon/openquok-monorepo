import type { CreateSocialPostChannelViewModel } from '$lib/channels/GetChannel.presenter.svelte';

import { LANDING_SOCIAL_PROFILE_URL } from '$lib/ui/templates/bento/minor-templates/landing/landingStaticAssets';

export const TIKTOK_BUSINESS_LANDING_MOCK_CHANNEL: CreateSocialPostChannelViewModel = {
	id: 'landing-mock-tiktok-business',
	internalId: 'landing-mock-tiktok-business-internal',
	name: 'OpenQuok',
	identifier: 'tiktok-business',
	picture: LANDING_SOCIAL_PROFILE_URL,
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

export const TIKTOK_BUSINESS_LANDING_MOCK_BODY = 'Video (9:16)';

/** `datetime-local` value for the mock schedule footer (Friday 9:00 AM). */
export const TIKTOK_BUSINESS_LANDING_MOCK_SCHEDULED_LOCAL = '2026-06-12T09:00';

/** Demo video for the 9:16 TikTok preview panel (`vertical-video.mp4` + `.webm`). */
export const TIKTOK_BUSINESS_LANDING_MOCK_MEDIA_URLS = ['/landing/vertical-video.mp4'];

export const TIKTOK_BUSINESS_LANDING_MOCK_PROVIDER_SETTINGS = {
	'tiktok-business': {
		privacy_level: 'PUBLIC_TO_EVERYONE' as const,
		content_posting_method: 'DIRECT_POST' as const,
		title: '',
		duet: false,
		stitch: false,
		comment: true,
		autoAddMusic: false,
		brand_content_toggle: false,
		brand_organic_toggle: false,
		video_made_with_ai: false,
		music_sound_id: '7123456789012345678',
		poi_id: '2253586231148780'
	}
};
