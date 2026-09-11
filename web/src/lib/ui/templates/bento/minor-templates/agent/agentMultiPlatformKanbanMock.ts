import type {
	PostKanbanCardViewModel,
	PostKanbanChannelSlotViewModel
} from '$lib/posts/postKanbanBoard.types';

import { applyLandingKanbanMockSchedule } from '$lib/ui/templates/bento/minor-templates/landing/landingKanbanMockSchedule';
import { FACEBOOK_LANDING_MOCK_CHANNEL } from '$lib/ui/templates/bento/minor-templates/facebook/facebookLandingMock';
import { INSTAGRAM_LANDING_MOCK_BUSINESS_CHANNEL } from '$lib/ui/templates/bento/minor-templates/instagram/instagramLandingMock';
import { LINKEDIN_LANDING_MOCK_CHANNEL } from '$lib/ui/templates/bento/minor-templates/linkedin/linkedinLandingMock';
import { THREADS_LANDING_MOCK_CHANNEL } from '$lib/ui/templates/bento/minor-templates/threads/threadsLandingMock';
import { TIKTOK_LANDING_MOCK_CHANNEL } from '$lib/ui/templates/bento/minor-templates/tiktok/tiktokLandingMock';
import { X_LANDING_MOCK_CHANNEL } from '$lib/ui/templates/bento/minor-templates/x/xLandingMock';
import { YOUTUBE_LANDING_MOCK_CHANNEL } from '$lib/ui/templates/bento/minor-templates/youtube/youtubeLandingMock';
import { DEVTO_LANDING_MOCK_CHANNEL } from '$lib/ui/templates/bento/minor-templates/devto/devtoLandingMock';

function channelSlot(
	channel: typeof FACEBOOK_LANDING_MOCK_CHANNEL
): PostKanbanChannelSlotViewModel {
	return {
		integrationId: channel.id,
		picture: channel.picture,
		name: channel.name,
		identifier: channel.identifier
	};
}

const facebookSlot = channelSlot(FACEBOOK_LANDING_MOCK_CHANNEL);
const threadsSlot = channelSlot(THREADS_LANDING_MOCK_CHANNEL);
const instagramSlot = channelSlot(INSTAGRAM_LANDING_MOCK_BUSINESS_CHANNEL);
const youtubeSlot = channelSlot(YOUTUBE_LANDING_MOCK_CHANNEL);
const tiktokSlot = channelSlot(TIKTOK_LANDING_MOCK_CHANNEL);
const linkedinSlot = channelSlot(LINKEDIN_LANDING_MOCK_CHANNEL);
const xSlot = channelSlot(X_LANDING_MOCK_CHANNEL);
const devtoSlot = channelSlot(DEVTO_LANDING_MOCK_CHANNEL);

/** Mixed-platform kanban cards for generic agent host landing pages. */
export function getAgentMultiPlatformKanbanCards(): PostKanbanCardViewModel[] {
	return [
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-agent-kanban-fb-draft',
				postGroup: 'landing-agent-kanban-group-1',
				column: 'draft',
				contentPreview: 'Friday Reel — MP4 ready to queue on your Facebook Page.',
				note: 'Review agent caption before scheduling',
				channelSlots: [facebookSlot],
				hiddenChannelCount: 0,
				primaryChannelName: FACEBOOK_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: true,
				isReviewed: false,
				tagNames: ['reels']
			},
			2,
			{ hour: 9 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-agent-kanban-threads-scheduled',
				postGroup: 'landing-agent-kanban-group-2',
				column: 'scheduled',
				contentPreview: 'Launch thread with two scheduled follow-up replies.',
				note: null,
				channelSlots: [threadsSlot],
				hiddenChannelCount: 0,
				primaryChannelName: THREADS_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: false,
				isReviewed: true,
				tagNames: ['launch']
			},
			4,
			{ hour: 10, minute: 30 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-agent-kanban-ig-draft',
				postGroup: 'landing-agent-kanban-group-3',
				column: 'draft',
				contentPreview: 'Carousel draft — four images queued for Instagram feed.',
				note: 'Confirm cover image',
				channelSlots: [instagramSlot],
				hiddenChannelCount: 0,
				primaryChannelName: INSTAGRAM_LANDING_MOCK_BUSINESS_CHANNEL.name,
				isAgentEdited: true,
				isReviewed: false,
				tagNames: ['carousel']
			},
			6,
			{ hour: 14 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-agent-kanban-yt-scheduled',
				postGroup: 'landing-agent-kanban-group-4',
				column: 'scheduled',
				contentPreview: 'Product walkthrough — MP4 upload with title and privacy set.',
				note: 'Approved in review',
				channelSlots: [youtubeSlot],
				hiddenChannelCount: 0,
				primaryChannelName: YOUTUBE_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: true,
				isReviewed: true,
				tagNames: []
			},
			8,
			{ hour: 8 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-agent-kanban-tiktok-draft',
				postGroup: 'landing-agent-kanban-group-5',
				column: 'draft',
				contentPreview: 'Vertical video draft — trending audio added in TikTok app.',
				note: 'Pick sound in TikTok before publish',
				channelSlots: [tiktokSlot],
				hiddenChannelCount: 0,
				primaryChannelName: TIKTOK_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: false,
				isReviewed: false,
				tagNames: ['viral']
			},
			10,
			{ hour: 18 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-agent-kanban-linkedin-scheduled',
				postGroup: 'landing-agent-kanban-group-6',
				column: 'scheduled',
				contentPreview: 'Case-study carousel queued for your LinkedIn Page.',
				note: null,
				channelSlots: [linkedinSlot],
				hiddenChannelCount: 0,
				primaryChannelName: LINKEDIN_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: false,
				isReviewed: true,
				tagNames: ['b2b']
			},
			12,
			{ hour: 11 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-agent-kanban-x-draft',
				postGroup: 'landing-agent-kanban-group-7',
				column: 'draft',
				contentPreview: 'Launch tweet with follow-up reply chain — agent draft.',
				note: 'Review reply timing',
				channelSlots: [xSlot],
				hiddenChannelCount: 0,
				primaryChannelName: X_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: true,
				isReviewed: false,
				tagNames: []
			},
			14,
			{ hour: 15, minute: 30 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-agent-kanban-devto-scheduled',
				postGroup: 'landing-agent-kanban-group-8',
				column: 'scheduled',
				contentPreview: 'Markdown tutorial — title, tags, and canonical URL set for Dev.to.',
				note: 'Approved in review',
				channelSlots: [devtoSlot],
				hiddenChannelCount: 0,
				primaryChannelName: DEVTO_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: true,
				isReviewed: true,
				tagNames: ['webdev']
			},
			16,
			{ hour: 9 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-agent-kanban-fb-published',
				postGroup: 'landing-agent-kanban-group-9',
				column: 'published',
				contentPreview: 'Facebook Page post that already went live this week.',
				note: null,
				channelSlots: [facebookSlot],
				hiddenChannelCount: 0,
				primaryChannelName: FACEBOOK_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: false,
				isReviewed: true,
				tagNames: ['reels']
			},
			-3,
			{ hour: 16 }
		)
	];
}

export const AGENT_MULTI_PLATFORM_MOCK_CHANNELS = [
	FACEBOOK_LANDING_MOCK_CHANNEL,
	THREADS_LANDING_MOCK_CHANNEL,
	INSTAGRAM_LANDING_MOCK_BUSINESS_CHANNEL,
	YOUTUBE_LANDING_MOCK_CHANNEL,
	TIKTOK_LANDING_MOCK_CHANNEL,
	LINKEDIN_LANDING_MOCK_CHANNEL,
	X_LANDING_MOCK_CHANNEL,
	DEVTO_LANDING_MOCK_CHANNEL
];
