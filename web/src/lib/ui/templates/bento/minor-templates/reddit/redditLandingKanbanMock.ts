import type {
	PostKanbanCardViewModel,
	PostKanbanChannelSlotViewModel
} from '$lib/posts/postKanbanBoard.types';

import { applyLandingKanbanMockSchedule } from '$lib/ui/templates/bento/minor-templates/landing/landingKanbanMockSchedule';
import { REDDIT_LANDING_MOCK_CHANNEL } from './redditLandingMock';

const redditChannelSlot: PostKanbanChannelSlotViewModel = {
	integrationId: REDDIT_LANDING_MOCK_CHANNEL.id,
	picture: REDDIT_LANDING_MOCK_CHANNEL.picture,
	name: REDDIT_LANDING_MOCK_CHANNEL.name,
	identifier: REDDIT_LANDING_MOCK_CHANNEL.identifier
};

/** Sample kanban cards for the Reddit bulk-scheduling landing bento. */
export function getRedditLandingKanbanCards(): PostKanbanCardViewModel[] {
	return [
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-reddit-kanban-draft-agent',
				postGroup: 'landing-reddit-kanban-group-1',
				column: 'draft',
				contentPreview: 'Agent draft — markdown AMA reminder for r/buildinpublic.',
				note: 'Review subreddit and title before scheduling',
				channelSlots: [redditChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: REDDIT_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: true,
				isReviewed: false,
				tagNames: []
			},
			2,
			{ hour: 9 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-reddit-kanban-scheduled-human',
				postGroup: 'landing-reddit-kanban-group-2',
				column: 'scheduled',
				contentPreview: 'Weekly changelog — subreddit and title set in Settings.',
				note: 'Due today — finish on reddit.com',
				channelSlots: [redditChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: REDDIT_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: false,
				isReviewed: true,
				tagNames: []
			},
			0,
			{ hour: 10, minute: 30 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-reddit-kanban-draft-human',
				postGroup: 'landing-reddit-kanban-group-3',
				column: 'draft',
				contentPreview: 'Discussion post — links and markdown ready to queue.',
				note: 'Confirm community rules',
				channelSlots: [redditChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: REDDIT_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: false,
				isReviewed: false,
				tagNames: []
			},
			10,
			{ hour: 14 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-reddit-kanban-scheduled-agent',
				postGroup: 'landing-reddit-kanban-group-4',
				column: 'scheduled',
				contentPreview: 'Agent-drafted thread — queued for next week.',
				note: 'Approved in review',
				channelSlots: [redditChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: REDDIT_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: true,
				isReviewed: true,
				tagNames: []
			},
			12,
			{ hour: 8 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-reddit-kanban-published',
				postGroup: 'landing-reddit-kanban-group-5',
				column: 'published',
				contentPreview: 'Launch post you marked complete after submitting on reddit.com.',
				note: null,
				channelSlots: [redditChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: REDDIT_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: false,
				isReviewed: true,
				tagNames: []
			},
			-3,
			{ hour: 16 }
		)
	];
}
