import type {
	PostKanbanCardViewModel,
	PostKanbanChannelSlotViewModel
} from '$lib/posts/postKanbanBoard.types';

import { INSTAGRAM_LANDING_MOCK_CHANNEL } from './instagramLandingMock';

const instagramChannelSlot: PostKanbanChannelSlotViewModel = {
	integrationId: INSTAGRAM_LANDING_MOCK_CHANNEL.id,
	picture: INSTAGRAM_LANDING_MOCK_CHANNEL.picture,
	name: INSTAGRAM_LANDING_MOCK_CHANNEL.name,
	identifier: INSTAGRAM_LANDING_MOCK_CHANNEL.identifier
};

/** Static kanban cards for the Instagram bulk-scheduling landing bento. */
export const INSTAGRAM_LANDING_KANBAN_CARDS: PostKanbanCardViewModel[] = [
	{
		postId: 'landing-instagram-kanban-draft-agent',
		postGroup: 'landing-instagram-kanban-group-1',
		column: 'draft',
		contentPreview: 'Agent draft — carousel queued with caption and collaborator tags.',
		publishLabel: 'Jun 12, 2026',
		publishTimeLabel: '9:00 AM',
		relativePublishLabel: '(in 4 days)',
		statusLabel: 'Draft',
		publishDateIso: '2026-06-12T09:00:00.000Z',
		note: 'Review Instagram settings before scheduling',
		channelSlots: [instagramChannelSlot],
		hiddenChannelCount: 0,
		primaryChannelName: INSTAGRAM_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: true,
		isReviewed: false,
		tagNames: ['carousel']
	},
	{
		postId: 'landing-instagram-kanban-scheduled-human',
		postGroup: 'landing-instagram-kanban-group-2',
		column: 'scheduled',
		contentPreview: 'Friday Reel — single MP4 scheduled for the feed.',
		publishLabel: 'Jun 14, 2026',
		publishTimeLabel: '10:30 AM',
		relativePublishLabel: '(in 6 days)',
		statusLabel: 'Scheduled',
		publishDateIso: '2026-06-14T10:30:00.000Z',
		note: null,
		channelSlots: [instagramChannelSlot],
		hiddenChannelCount: 0,
		primaryChannelName: INSTAGRAM_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: false,
		isReviewed: true,
		tagNames: ['reels']
	},
	{
		postId: 'landing-instagram-kanban-draft-human',
		postGroup: 'landing-instagram-kanban-group-3',
		column: 'draft',
		contentPreview: 'Story draft — one image attachment, post type set to Story.',
		publishLabel: 'Jun 18, 2026',
		publishTimeLabel: '2:00 PM',
		relativePublishLabel: '(in 10 days)',
		statusLabel: 'Draft',
		publishDateIso: '2026-06-18T14:00:00.000Z',
		note: 'Confirm Story duration under 60s',
		channelSlots: [instagramChannelSlot],
		hiddenChannelCount: 0,
		primaryChannelName: INSTAGRAM_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: false,
		isReviewed: false,
		tagNames: []
	},
	{
		postId: 'landing-instagram-kanban-scheduled-agent',
		postGroup: 'landing-instagram-kanban-group-4',
		column: 'scheduled',
		contentPreview: 'Agent batch — four Instagram posts queued for next week.',
		publishLabel: 'Jun 20, 2026',
		publishTimeLabel: '8:00 AM',
		relativePublishLabel: '(in 12 days)',
		statusLabel: 'Scheduled',
		publishDateIso: '2026-06-20T08:00:00.000Z',
		note: 'Approved in review',
		channelSlots: [instagramChannelSlot],
		hiddenChannelCount: 0,
		primaryChannelName: INSTAGRAM_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: true,
		isReviewed: true,
		tagNames: ['shop-1']
	}
];
