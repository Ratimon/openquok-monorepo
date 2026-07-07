import type {
	PostKanbanCardViewModel,
	PostKanbanChannelSlotViewModel
} from '$lib/posts/postKanbanBoard.types';

import { FACEBOOK_LANDING_MOCK_CHANNEL } from '$lib/ui/templates/bento/minor-templates/facebook/facebookLandingMock';
import { INSTAGRAM_LANDING_MOCK_BUSINESS_CHANNEL } from '$lib/ui/templates/bento/minor-templates/instagram/instagramLandingMock';
import { LINKEDIN_LANDING_MOCK_CHANNEL } from '$lib/ui/templates/bento/minor-templates/linkedin/linkedinLandingMock';
import { THREADS_LANDING_MOCK_CHANNEL } from '$lib/ui/templates/bento/minor-templates/threads/threadsLandingMock';
import { TIKTOK_LANDING_MOCK_CHANNEL } from '$lib/ui/templates/bento/minor-templates/tiktok/tiktokLandingMock';
import { X_LANDING_MOCK_CHANNEL } from '$lib/ui/templates/bento/minor-templates/x/xLandingMock';
import { YOUTUBE_LANDING_MOCK_CHANNEL } from '$lib/ui/templates/bento/minor-templates/youtube/youtubeLandingMock';

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

/** Mixed-platform kanban cards for generic agent host landing pages. */
export const AGENT_MULTI_PLATFORM_KANBAN_CARDS: PostKanbanCardViewModel[] = [
	{
		postId: 'landing-agent-kanban-fb-draft',
		postGroup: 'landing-agent-kanban-group-1',
		column: 'draft',
		contentPreview: 'Friday Reel — MP4 ready to queue on your Facebook Page.',
		publishLabel: 'Jun 12, 2026',
		publishTimeLabel: '9:00 AM',
		relativePublishLabel: '(in 4 days)',
		statusLabel: 'Draft',
		publishDateIso: '2026-06-12T09:00:00.000Z',
		note: 'Review agent caption before scheduling',
		channelSlots: [facebookSlot],
		hiddenChannelCount: 0,
		primaryChannelName: FACEBOOK_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: true,
		isReviewed: false,
		tagNames: ['reels']
	},
	{
		postId: 'landing-agent-kanban-threads-scheduled',
		postGroup: 'landing-agent-kanban-group-2',
		column: 'scheduled',
		contentPreview: 'Launch thread with two scheduled follow-up replies.',
		publishLabel: 'Jun 14, 2026',
		publishTimeLabel: '10:30 AM',
		relativePublishLabel: '(in 6 days)',
		statusLabel: 'Scheduled',
		publishDateIso: '2026-06-14T10:30:00.000Z',
		note: null,
		channelSlots: [threadsSlot],
		hiddenChannelCount: 0,
		primaryChannelName: THREADS_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: false,
		isReviewed: true,
		tagNames: ['launch']
	},
	{
		postId: 'landing-agent-kanban-ig-draft',
		postGroup: 'landing-agent-kanban-group-3',
		column: 'draft',
		contentPreview: 'Carousel draft — four images queued for Instagram feed.',
		publishLabel: 'Jun 16, 2026',
		publishTimeLabel: '2:00 PM',
		relativePublishLabel: '(in 8 days)',
		statusLabel: 'Draft',
		publishDateIso: '2026-06-16T14:00:00.000Z',
		note: 'Confirm cover image',
		channelSlots: [instagramSlot],
		hiddenChannelCount: 0,
		primaryChannelName: INSTAGRAM_LANDING_MOCK_BUSINESS_CHANNEL.name,
		isAgentEdited: true,
		isReviewed: false,
		tagNames: ['carousel']
	},
	{
		postId: 'landing-agent-kanban-yt-scheduled',
		postGroup: 'landing-agent-kanban-group-4',
		column: 'scheduled',
		contentPreview: 'Product walkthrough — MP4 upload with title and privacy set.',
		publishLabel: 'Jun 18, 2026',
		publishTimeLabel: '8:00 AM',
		relativePublishLabel: '(in 10 days)',
		statusLabel: 'Scheduled',
		publishDateIso: '2026-06-18T08:00:00.000Z',
		note: 'Approved in review',
		channelSlots: [youtubeSlot],
		hiddenChannelCount: 0,
		primaryChannelName: YOUTUBE_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: true,
		isReviewed: true,
		tagNames: []
	},
	{
		postId: 'landing-agent-kanban-tiktok-draft',
		postGroup: 'landing-agent-kanban-group-5',
		column: 'draft',
		contentPreview: 'Vertical video draft — trending audio added in TikTok app.',
		publishLabel: 'Jun 20, 2026',
		publishTimeLabel: '6:00 PM',
		relativePublishLabel: '(in 12 days)',
		statusLabel: 'Draft',
		publishDateIso: '2026-06-20T18:00:00.000Z',
		note: 'Pick sound in TikTok before publish',
		channelSlots: [tiktokSlot],
		hiddenChannelCount: 0,
		primaryChannelName: TIKTOK_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: false,
		isReviewed: false,
		tagNames: ['viral']
	},
	{
		postId: 'landing-agent-kanban-linkedin-scheduled',
		postGroup: 'landing-agent-kanban-group-6',
		column: 'scheduled',
		contentPreview: 'Case-study carousel queued for your LinkedIn Page.',
		publishLabel: 'Jun 22, 2026',
		publishTimeLabel: '11:00 AM',
		relativePublishLabel: '(in 14 days)',
		statusLabel: 'Scheduled',
		publishDateIso: '2026-06-22T11:00:00.000Z',
		note: null,
		channelSlots: [linkedinSlot],
		hiddenChannelCount: 0,
		primaryChannelName: LINKEDIN_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: false,
		isReviewed: true,
		tagNames: ['b2b']
	},
	{
		postId: 'landing-agent-kanban-x-draft',
		postGroup: 'landing-agent-kanban-group-7',
		column: 'draft',
		contentPreview: 'Launch tweet with follow-up reply chain — agent draft.',
		publishLabel: 'Jun 24, 2026',
		publishTimeLabel: '3:30 PM',
		relativePublishLabel: '(in 16 days)',
		statusLabel: 'Draft',
		publishDateIso: '2026-06-24T15:30:00.000Z',
		note: 'Review reply timing',
		channelSlots: [xSlot],
		hiddenChannelCount: 0,
		primaryChannelName: X_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: true,
		isReviewed: false,
		tagNames: []
	}
];

export const AGENT_MULTI_PLATFORM_MOCK_CHANNELS = [
	FACEBOOK_LANDING_MOCK_CHANNEL,
	THREADS_LANDING_MOCK_CHANNEL,
	INSTAGRAM_LANDING_MOCK_BUSINESS_CHANNEL,
	YOUTUBE_LANDING_MOCK_CHANNEL,
	TIKTOK_LANDING_MOCK_CHANNEL,
	LINKEDIN_LANDING_MOCK_CHANNEL,
	X_LANDING_MOCK_CHANNEL
];
