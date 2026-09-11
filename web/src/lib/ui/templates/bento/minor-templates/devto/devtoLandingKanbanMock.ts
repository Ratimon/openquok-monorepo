import type {
	PostKanbanCardViewModel,
	PostKanbanChannelSlotViewModel
} from '$lib/posts/postKanbanBoard.types';

import { applyLandingKanbanMockSchedule } from '$lib/ui/templates/bento/minor-templates/landing/landingKanbanMockSchedule';
import { DEVTO_LANDING_MOCK_CHANNEL } from './devtoLandingMock';

const devtoChannelSlot: PostKanbanChannelSlotViewModel = {
	integrationId: DEVTO_LANDING_MOCK_CHANNEL.id,
	picture: DEVTO_LANDING_MOCK_CHANNEL.picture,
	name: DEVTO_LANDING_MOCK_CHANNEL.name,
	identifier: DEVTO_LANDING_MOCK_CHANNEL.identifier
};

/** Sample kanban cards for the Dev.to bulk-scheduling landing bento. */
export function getDevtoLandingKanbanCards(): PostKanbanCardViewModel[] {
	return [
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-devto-kanban-draft-agent',
				postGroup: 'landing-devto-kanban-group-1',
				column: 'draft',
				contentPreview: 'Agent draft — markdown tutorial ready to queue on Dev.to.',
				note: 'Review title and tags before scheduling',
				channelSlots: [devtoChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: DEVTO_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: true,
				isReviewed: false,
				tagNames: ['webdev']
			},
			2,
			{ hour: 9 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-devto-kanban-scheduled-human',
				postGroup: 'landing-devto-kanban-group-2',
				column: 'scheduled',
				contentPreview: 'Changelog article — four tags and cover set.',
				note: null,
				channelSlots: [devtoChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: DEVTO_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: false,
				isReviewed: true,
				tagNames: ['changelog']
			},
			4,
			{ hour: 10, minute: 30 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-devto-kanban-draft-human',
				postGroup: 'landing-devto-kanban-group-3',
				column: 'draft',
				contentPreview: 'How-to — canonical URL points at the original docs page.',
				note: 'Confirm canonical URL',
				channelSlots: [devtoChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: DEVTO_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: false,
				isReviewed: false,
				tagNames: []
			},
			10,
			{ hour: 14 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-devto-kanban-scheduled-agent',
				postGroup: 'landing-devto-kanban-group-4',
				column: 'scheduled',
				contentPreview: 'Agent-drafted article — queued for next week.',
				note: 'Approved in review',
				channelSlots: [devtoChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: DEVTO_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: true,
				isReviewed: true,
				tagNames: ['tutorial']
			},
			12,
			{ hour: 8 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-devto-kanban-published',
				postGroup: 'landing-devto-kanban-group-5',
				column: 'published',
				contentPreview: 'Tutorial that already published with tags and canonical URL.',
				note: null,
				channelSlots: [devtoChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: DEVTO_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: true,
				isReviewed: true,
				tagNames: ['webdev']
			},
			-3,
			{ hour: 16 }
		)
	];
}
