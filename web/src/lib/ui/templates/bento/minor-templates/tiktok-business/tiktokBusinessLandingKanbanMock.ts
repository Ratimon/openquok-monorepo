import type {
	PostKanbanCardViewModel,
	PostKanbanChannelSlotViewModel
} from '$lib/posts/postKanbanBoard.types';

import { TIKTOK_BUSINESS_LANDING_MOCK_CHANNEL } from './tiktokBusinessLandingMock';

const tiktokBusinessChannelSlot: PostKanbanChannelSlotViewModel = {
	integrationId: TIKTOK_BUSINESS_LANDING_MOCK_CHANNEL.id,
	picture: TIKTOK_BUSINESS_LANDING_MOCK_CHANNEL.picture,
	name: TIKTOK_BUSINESS_LANDING_MOCK_CHANNEL.name,
	identifier: TIKTOK_BUSINESS_LANDING_MOCK_CHANNEL.identifier
};

/** Static kanban cards for the TikTok Business bulk-scheduling landing bento. */
export const TIKTOK_BUSINESS_LANDING_KANBAN_CARDS: PostKanbanCardViewModel[] = [
	{
		postId: 'landing-tiktok-business-kanban-draft-agent',
		postGroup: 'landing-tiktok-business-kanban-group-1',
		column: 'draft',
		contentPreview: 'Agent draft — vertical MP4 with a custom cover ready to queue.',
		publishLabel: 'Jun 12, 2026',
		publishTimeLabel: '9:00 AM',
		relativePublishLabel: '(in 4 days)',
		statusLabel: 'Draft',
		publishDateIso: '2026-06-12T09:00:00.000Z',
		note: 'Confirm cover image and commercial audio before scheduling',
		channelSlots: [tiktokBusinessChannelSlot],
		hiddenChannelCount: 0,
		primaryChannelName: TIKTOK_BUSINESS_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: true,
		isReviewed: false,
		tagNames: ['launch']
	},
	{
		postId: 'landing-tiktok-business-kanban-scheduled-human',
		postGroup: 'landing-tiktok-business-kanban-group-2',
		column: 'scheduled',
		contentPreview: 'Friday clip — MP4 scheduled with comments enabled and a stored poster.',
		publishLabel: 'Jun 14, 2026',
		publishTimeLabel: '10:30 AM',
		relativePublishLabel: '(in 6 days)',
		statusLabel: 'Scheduled',
		publishDateIso: '2026-06-14T10:30:00.000Z',
		note: null,
		channelSlots: [tiktokBusinessChannelSlot],
		hiddenChannelCount: 0,
		primaryChannelName: TIKTOK_BUSINESS_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: false,
		isReviewed: true,
		tagNames: ['product']
	},
	{
		postId: 'landing-tiktok-business-kanban-draft-human',
		postGroup: 'landing-tiktok-business-kanban-group-3',
		column: 'draft',
		contentPreview: 'Photo carousel — inbox upload so the team can finish in the TikTok app.',
		publishLabel: 'Jun 18, 2026',
		publishTimeLabel: '2:00 PM',
		relativePublishLabel: '(in 10 days)',
		statusLabel: 'Draft',
		publishDateIso: '2026-06-18T14:00:00.000Z',
		note: 'Add photo title before scheduling',
		channelSlots: [tiktokBusinessChannelSlot],
		hiddenChannelCount: 0,
		primaryChannelName: TIKTOK_BUSINESS_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: false,
		isReviewed: false,
		tagNames: []
	},
	{
		postId: 'landing-tiktok-business-kanban-scheduled-agent',
		postGroup: 'landing-tiktok-business-kanban-group-4',
		column: 'scheduled',
		contentPreview: 'Agent-drafted clip — commercial audio id set on the direct post.',
		publishLabel: 'Jun 20, 2026',
		publishTimeLabel: '8:00 AM',
		relativePublishLabel: '(in 12 days)',
		statusLabel: 'Scheduled',
		publishDateIso: '2026-06-20T08:00:00.000Z',
		note: 'Approved in review',
		channelSlots: [tiktokBusinessChannelSlot],
		hiddenChannelCount: 0,
		primaryChannelName: TIKTOK_BUSINESS_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: true,
		isReviewed: true,
		tagNames: ['kol-1']
	}
];
