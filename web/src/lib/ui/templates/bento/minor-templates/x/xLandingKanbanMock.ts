import type {
	PostKanbanCardViewModel,
	PostKanbanChannelSlotViewModel
} from '$lib/posts/postKanbanBoard.types';

import { X_LANDING_MOCK_CHANNEL } from './xLandingMock';

const xChannelSlot: PostKanbanChannelSlotViewModel = {
	integrationId: X_LANDING_MOCK_CHANNEL.id,
	picture: X_LANDING_MOCK_CHANNEL.picture,
	name: X_LANDING_MOCK_CHANNEL.name,
	identifier: X_LANDING_MOCK_CHANNEL.identifier
};

export const X_LANDING_KANBAN_CARDS: PostKanbanCardViewModel[] = [
	{
		postId: 'landing-x-kanban-draft-agent',
		postGroup: 'landing-x-kanban-group-1',
		column: 'draft',
		contentPreview: 'Agent draft — launch tweet with scheduled thread reply.',
		publishLabel: 'Jun 12, 2026',
		publishTimeLabel: '9:00 AM',
		relativePublishLabel: '(in 4 days)',
		statusLabel: 'Draft',
		publishDateIso: '2026-06-12T09:00:00.000Z',
		note: 'Review reply chain before scheduling',
		channelSlots: [xChannelSlot],
		hiddenChannelCount: 0,
		primaryChannelName: X_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: true,
		isReviewed: false,
		tagNames: ['launch']
	},
	{
		postId: 'landing-x-kanban-scheduled-human',
		postGroup: 'landing-x-kanban-group-2',
		column: 'scheduled',
		contentPreview: 'Weekly product update with image attachment.',
		publishLabel: 'Jun 14, 2026',
		publishTimeLabel: '2:00 PM',
		relativePublishLabel: '(in 6 days)',
		statusLabel: 'Scheduled',
		publishDateIso: '2026-06-14T14:00:00.000Z',
		note: '',
		channelSlots: [xChannelSlot],
		hiddenChannelCount: 0,
		primaryChannelName: X_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: false,
		isReviewed: true,
		tagNames: ['product']
	}
];
