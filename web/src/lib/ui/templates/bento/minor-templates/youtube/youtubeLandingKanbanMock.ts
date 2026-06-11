import type {
	PostKanbanCardViewModel,
	PostKanbanChannelSlotViewModel
} from '$lib/posts/postKanbanBoard.types';

import { YOUTUBE_LANDING_MOCK_CHANNEL } from './youtubeLandingMock';

const youtubeChannelSlot: PostKanbanChannelSlotViewModel = {
	integrationId: YOUTUBE_LANDING_MOCK_CHANNEL.id,
	picture: YOUTUBE_LANDING_MOCK_CHANNEL.picture,
	name: YOUTUBE_LANDING_MOCK_CHANNEL.name,
	identifier: YOUTUBE_LANDING_MOCK_CHANNEL.identifier
};

/** Static kanban cards for the YouTube bulk-scheduling landing bento. */
export const YOUTUBE_LANDING_KANBAN_CARDS: PostKanbanCardViewModel[] = [
	{
		postId: 'landing-youtube-kanban-draft-agent',
		postGroup: 'landing-youtube-kanban-group-1',
		column: 'draft',
		contentPreview: 'Agent draft — MP4 walkthrough ready to queue on your YouTube channel.',
		publishLabel: 'Jun 12, 2026',
		publishTimeLabel: '9:00 AM',
		relativePublishLabel: '(in 4 days)',
		statusLabel: 'Draft',
		publishDateIso: '2026-06-12T09:00:00.000Z',
		note: 'Review title and privacy before scheduling',
		channelSlots: [youtubeChannelSlot],
		hiddenChannelCount: 0,
		primaryChannelName: YOUTUBE_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: true,
		isReviewed: false,
		tagNames: ['walkthrough']
	},
	{
		postId: 'landing-youtube-kanban-scheduled-human',
		postGroup: 'landing-youtube-kanban-group-2',
		column: 'scheduled',
		contentPreview: 'Friday upload — MP4 scheduled with public privacy and tags.',
		publishLabel: 'Jun 14, 2026',
		publishTimeLabel: '10:30 AM',
		relativePublishLabel: '(in 6 days)',
		statusLabel: 'Scheduled',
		publishDateIso: '2026-06-14T10:30:00.000Z',
		note: null,
		channelSlots: [youtubeChannelSlot],
		hiddenChannelCount: 0,
		primaryChannelName: YOUTUBE_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: false,
		isReviewed: true,
		tagNames: ['product']
	},
	{
		postId: 'landing-youtube-kanban-draft-human',
		postGroup: 'landing-youtube-kanban-group-3',
		column: 'draft',
		contentPreview: 'Tutorial clip — unlisted privacy set in YouTube settings.',
		publishLabel: 'Jun 18, 2026',
		publishTimeLabel: '2:00 PM',
		relativePublishLabel: '(in 10 days)',
		statusLabel: 'Draft',
		publishDateIso: '2026-06-18T14:00:00.000Z',
		note: 'Attach custom thumbnail',
		channelSlots: [youtubeChannelSlot],
		hiddenChannelCount: 0,
		primaryChannelName: YOUTUBE_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: false,
		isReviewed: false,
		tagNames: []
	},
	{
		postId: 'landing-youtube-kanban-scheduled-agent',
		postGroup: 'landing-youtube-kanban-group-4',
		column: 'scheduled',
		contentPreview: 'Agent-drafted upload — batch queued for next week.',
		publishLabel: 'Jun 20, 2026',
		publishTimeLabel: '8:00 AM',
		relativePublishLabel: '(in 12 days)',
		statusLabel: 'Scheduled',
		publishDateIso: '2026-06-20T08:00:00.000Z',
		note: 'Approved in review',
		channelSlots: [youtubeChannelSlot],
		hiddenChannelCount: 0,
		primaryChannelName: YOUTUBE_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: true,
		isReviewed: true,
		tagNames: ['kol-1']
	}
];
