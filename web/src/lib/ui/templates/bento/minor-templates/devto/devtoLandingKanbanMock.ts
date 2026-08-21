import type {
	PostKanbanCardViewModel,
	PostKanbanChannelSlotViewModel
} from '$lib/posts/postKanbanBoard.types';

import { DEVTO_LANDING_MOCK_CHANNEL } from './devtoLandingMock';

const devtoChannelSlot: PostKanbanChannelSlotViewModel = {
	integrationId: DEVTO_LANDING_MOCK_CHANNEL.id,
	picture: DEVTO_LANDING_MOCK_CHANNEL.picture,
	name: DEVTO_LANDING_MOCK_CHANNEL.name,
	identifier: DEVTO_LANDING_MOCK_CHANNEL.identifier
};

/** Static kanban cards for the Dev.to bulk-scheduling landing bento. */
export const DEVTO_LANDING_KANBAN_CARDS: PostKanbanCardViewModel[] = [
	{
		postId: 'landing-devto-kanban-draft-agent',
		postGroup: 'landing-devto-kanban-group-1',
		column: 'draft',
		contentPreview: 'Agent draft — markdown tutorial ready to queue on Dev.to.',
		publishLabel: 'Jun 16, 2026',
		publishTimeLabel: '9:00 AM',
		relativePublishLabel: '(in 4 days)',
		statusLabel: 'Draft',
		publishDateIso: '2026-06-16T09:00:00.000Z',
		note: 'Review title and tags before scheduling',
		channelSlots: [devtoChannelSlot],
		hiddenChannelCount: 0,
		primaryChannelName: DEVTO_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: true,
		isReviewed: false,
		tagNames: ['webdev']
	},
	{
		postId: 'landing-devto-kanban-scheduled-human',
		postGroup: 'landing-devto-kanban-group-2',
		column: 'scheduled',
		contentPreview: 'Changelog article — four tags and cover set.',
		publishLabel: 'Jun 18, 2026',
		publishTimeLabel: '10:30 AM',
		relativePublishLabel: '(in 6 days)',
		statusLabel: 'Scheduled',
		publishDateIso: '2026-06-18T10:30:00.000Z',
		note: null,
		channelSlots: [devtoChannelSlot],
		hiddenChannelCount: 0,
		primaryChannelName: DEVTO_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: false,
		isReviewed: true,
		tagNames: ['changelog']
	},
	{
		postId: 'landing-devto-kanban-draft-human',
		postGroup: 'landing-devto-kanban-group-3',
		column: 'draft',
		contentPreview: 'How-to — canonical URL points at the original docs page.',
		publishLabel: 'Jun 22, 2026',
		publishTimeLabel: '2:00 PM',
		relativePublishLabel: '(in 10 days)',
		statusLabel: 'Draft',
		publishDateIso: '2026-06-22T14:00:00.000Z',
		note: 'Confirm canonical URL',
		channelSlots: [devtoChannelSlot],
		hiddenChannelCount: 0,
		primaryChannelName: DEVTO_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: false,
		isReviewed: false,
		tagNames: []
	},
	{
		postId: 'landing-devto-kanban-scheduled-agent',
		postGroup: 'landing-devto-kanban-group-4',
		column: 'scheduled',
		contentPreview: 'Agent-drafted article — queued for next week.',
		publishLabel: 'Jun 24, 2026',
		publishTimeLabel: '8:00 AM',
		relativePublishLabel: '(in 12 days)',
		statusLabel: 'Scheduled',
		publishDateIso: '2026-06-24T08:00:00.000Z',
		note: 'Approved in review',
		channelSlots: [devtoChannelSlot],
		hiddenChannelCount: 0,
		primaryChannelName: DEVTO_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: true,
		isReviewed: true,
		tagNames: ['tutorial']
	}
];
