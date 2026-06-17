import type {
	PostKanbanCardViewModel,
	PostKanbanChannelSlotViewModel
} from '$lib/posts/postKanbanBoard.types';

import { TIKTOK_LANDING_MOCK_CHANNEL } from './tiktokLandingMock';

const tiktokChannelSlot: PostKanbanChannelSlotViewModel = {
	integrationId: TIKTOK_LANDING_MOCK_CHANNEL.id,
	picture: TIKTOK_LANDING_MOCK_CHANNEL.picture,
	name: TIKTOK_LANDING_MOCK_CHANNEL.name,
	identifier: TIKTOK_LANDING_MOCK_CHANNEL.identifier
};

/** Static kanban cards for the TikTok bulk-scheduling landing bento. */
export const TIKTOK_LANDING_KANBAN_CARDS: PostKanbanCardViewModel[] = [
	{
		postId: 'landing-tiktok-kanban-draft-agent',
		postGroup: 'landing-tiktok-kanban-group-1',
		column: 'draft',
		contentPreview: 'Agent draft — vertical MP4 ready to queue on your TikTok profile.',
		publishLabel: 'Jun 12, 2026',
		publishTimeLabel: '9:00 AM',
		relativePublishLabel: '(in 4 days)',
		statusLabel: 'Draft',
		publishDateIso: '2026-06-12T09:00:00.000Z',
		note: 'Review privacy and posting method before scheduling',
		channelSlots: [tiktokChannelSlot],
		hiddenChannelCount: 0,
		primaryChannelName: TIKTOK_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: true,
		isReviewed: false,
		tagNames: ['launch']
	},
	{
		postId: 'landing-tiktok-kanban-scheduled-human',
		postGroup: 'landing-tiktok-kanban-group-2',
		column: 'scheduled',
		contentPreview: 'Friday clip — MP4 scheduled with public privacy and comments enabled.',
		publishLabel: 'Jun 14, 2026',
		publishTimeLabel: '10:30 AM',
		relativePublishLabel: '(in 6 days)',
		statusLabel: 'Scheduled',
		publishDateIso: '2026-06-14T10:30:00.000Z',
		note: null,
		channelSlots: [tiktokChannelSlot],
		hiddenChannelCount: 0,
		primaryChannelName: TIKTOK_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: false,
		isReviewed: true,
		tagNames: ['product']
	},
	{
		postId: 'landing-tiktok-kanban-draft-human',
		postGroup: 'landing-tiktok-kanban-group-3',
		column: 'draft',
		contentPreview: 'Photo carousel — inbox upload mode set in TikTok settings.',
		publishLabel: 'Jun 18, 2026',
		publishTimeLabel: '2:00 PM',
		relativePublishLabel: '(in 10 days)',
		statusLabel: 'Draft',
		publishDateIso: '2026-06-18T14:00:00.000Z',
		note: 'Add photo title before scheduling',
		channelSlots: [tiktokChannelSlot],
		hiddenChannelCount: 0,
		primaryChannelName: TIKTOK_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: false,
		isReviewed: false,
		tagNames: []
	},
	{
		postId: 'landing-tiktok-kanban-scheduled-agent',
		postGroup: 'landing-tiktok-kanban-group-4',
		column: 'scheduled',
		contentPreview: 'Agent-drafted clip — batch queued for next week.',
		publishLabel: 'Jun 20, 2026',
		publishTimeLabel: '8:00 AM',
		relativePublishLabel: '(in 12 days)',
		statusLabel: 'Scheduled',
		publishDateIso: '2026-06-20T08:00:00.000Z',
		note: 'Approved in review',
		channelSlots: [tiktokChannelSlot],
		hiddenChannelCount: 0,
		primaryChannelName: TIKTOK_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: true,
		isReviewed: true,
		tagNames: ['kol-1']
	}
];
