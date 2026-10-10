import type {
	PostKanbanCardViewModel,
	PostKanbanChannelSlotViewModel
} from '$lib/posts/postKanbanBoard.types';

import { applyLandingKanbanMockSchedule } from '$lib/ui/templates/bento/minor-templates/landing/landingKanbanMockSchedule';
import { SKOOL_LANDING_MOCK_CHANNEL } from './skoolLandingMock';

const skoolChannelSlot: PostKanbanChannelSlotViewModel = {
	integrationId: SKOOL_LANDING_MOCK_CHANNEL.id,
	picture: SKOOL_LANDING_MOCK_CHANNEL.picture,
	name: SKOOL_LANDING_MOCK_CHANNEL.name,
	identifier: SKOOL_LANDING_MOCK_CHANNEL.identifier
};

/** Sample kanban cards for the Skool bulk-scheduling landing bento. */
export function getSkoolLandingKanbanCards(): PostKanbanCardViewModel[] {
	return [
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-skool-kanban-draft',
				postGroup: 'landing-skool-kanban-group-1',
				column: 'draft',
				contentPreview: 'Agent draft — Skool post with title and group ready for review.',
				note: 'Pick a category before scheduling',
				channelSlots: [skoolChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: SKOOL_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: true,
				isReviewed: false,
				tagNames: ['community']
			},
			2,
			{ hour: 9 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-skool-kanban-scheduled',
				postGroup: 'landing-skool-kanban-group-2',
				column: 'scheduled',
				contentPreview: 'Week 12 update queued for your OpenQuok Community group.',
				note: null,
				channelSlots: [skoolChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: SKOOL_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: false,
				isReviewed: true,
				tagNames: ['weekly']
			},
			4,
			{ hour: 11, minute: 30 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-skool-kanban-published',
				postGroup: 'landing-skool-kanban-group-3',
				column: 'published',
				contentPreview: 'Last week’s wins thread — thanks for all the replies.',
				note: null,
				channelSlots: [skoolChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: SKOOL_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: false,
				isReviewed: true,
				tagNames: []
			},
			-2,
			{ hour: 15 }
		)
	];
}
