import type {
	PostKanbanCardViewModel,
	PostKanbanChannelSlotViewModel
} from '$lib/posts/postKanbanBoard.types';

import { applyLandingKanbanMockSchedule } from '$lib/ui/templates/bento/minor-templates/landing/landingKanbanMockSchedule';
import { X_LANDING_MOCK_CHANNEL } from './xLandingMock';

const xChannelSlot: PostKanbanChannelSlotViewModel = {
	integrationId: X_LANDING_MOCK_CHANNEL.id,
	picture: X_LANDING_MOCK_CHANNEL.picture,
	name: X_LANDING_MOCK_CHANNEL.name,
	identifier: X_LANDING_MOCK_CHANNEL.identifier
};

export function getXLandingKanbanCards(): PostKanbanCardViewModel[] {
	return [
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-x-kanban-draft-agent',
				postGroup: 'landing-x-kanban-group-1',
				column: 'draft',
				contentPreview: 'Agent draft — launch tweet with scheduled thread reply.',
				note: 'Review reply chain before scheduling',
				channelSlots: [xChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: X_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: true,
				isReviewed: false,
				tagNames: ['launch']
			},
			2,
			{ hour: 9 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-x-kanban-scheduled-human',
				postGroup: 'landing-x-kanban-group-2',
				column: 'scheduled',
				contentPreview: 'Weekly product update with image attachment.',
				note: null,
				channelSlots: [xChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: X_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: false,
				isReviewed: true,
				tagNames: ['product']
			},
			4,
			{ hour: 14 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-x-kanban-draft-human',
				postGroup: 'landing-x-kanban-group-3',
				column: 'draft',
				contentPreview: 'Text-only tweet — quote-less follow-up queued in composer.',
				note: 'Trim hook to 280 characters',
				channelSlots: [xChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: X_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: false,
				isReviewed: false,
				tagNames: []
			},
			6,
			{ hour: 11 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-x-kanban-scheduled-agent',
				postGroup: 'landing-x-kanban-group-4',
				column: 'scheduled',
				contentPreview: 'Agent batch — four tweets queued for next week.',
				note: 'Approved in review',
				channelSlots: [xChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: X_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: true,
				isReviewed: true,
				tagNames: ['kol-1']
			},
			10,
			{ hour: 8 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-x-kanban-published',
				postGroup: 'landing-x-kanban-group-5',
				column: 'published',
				contentPreview: 'Shipped launch tweet — thread replies already live.',
				note: null,
				channelSlots: [xChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: X_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: false,
				isReviewed: true,
				tagNames: ['launch']
			},
			-2,
			{ hour: 16 }
		)
	];
}
