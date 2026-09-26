import type {
	PostKanbanCardViewModel,
	PostKanbanChannelSlotViewModel
} from '$lib/posts/postKanbanBoard.types';

import { applyLandingKanbanMockSchedule } from '$lib/ui/templates/bento/minor-templates/landing/landingKanbanMockSchedule';
import { BLUESKY_LANDING_MOCK_CHANNEL } from './blueskyLandingMock';

const blueskyChannelSlot: PostKanbanChannelSlotViewModel = {
	integrationId: BLUESKY_LANDING_MOCK_CHANNEL.id,
	picture: BLUESKY_LANDING_MOCK_CHANNEL.picture,
	name: BLUESKY_LANDING_MOCK_CHANNEL.name,
	identifier: BLUESKY_LANDING_MOCK_CHANNEL.identifier
};

/** Sample kanban cards for the Bluesky bulk-scheduling landing bento. */
export function getBlueskyLandingKanbanCards(): PostKanbanCardViewModel[] {
	return [
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-bluesky-kanban-draft',
				postGroup: 'landing-bluesky-kanban-group-1',
				column: 'draft',
				contentPreview: 'Agent draft — Bluesky post with two images ready for review.',
				note: 'Check alt text before scheduling',
				channelSlots: [blueskyChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: BLUESKY_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: true,
				isReviewed: false,
				tagNames: ['product']
			},
			2,
			{ hour: 9 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-bluesky-kanban-scheduled',
				postGroup: 'landing-bluesky-kanban-group-2',
				column: 'scheduled',
				contentPreview: 'Launch post with one scheduled follow-up reply.',
				note: null,
				channelSlots: [blueskyChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: BLUESKY_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: false,
				isReviewed: true,
				tagNames: ['launch']
			},
			4,
			{ hour: 11, minute: 30 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-bluesky-kanban-published',
				postGroup: 'landing-bluesky-kanban-group-3',
				column: 'published',
				contentPreview: 'Text-only post that already went live this week.',
				note: null,
				channelSlots: [blueskyChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: BLUESKY_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: false,
				isReviewed: true,
				tagNames: []
			},
			-2,
			{ hour: 15 }
		)
	];
}
