import type {
	PostKanbanCardViewModel,
	PostKanbanChannelSlotViewModel
} from '$lib/posts/postKanbanBoard.types';

import { applyLandingKanbanMockSchedule } from '$lib/ui/templates/bento/minor-templates/landing/landingKanbanMockSchedule';
import { YOUTUBE_LANDING_MOCK_CHANNEL } from './youtubeLandingMock';

const youtubeChannelSlot: PostKanbanChannelSlotViewModel = {
	integrationId: YOUTUBE_LANDING_MOCK_CHANNEL.id,
	picture: YOUTUBE_LANDING_MOCK_CHANNEL.picture,
	name: YOUTUBE_LANDING_MOCK_CHANNEL.name,
	identifier: YOUTUBE_LANDING_MOCK_CHANNEL.identifier
};

/** Sample kanban cards for the YouTube bulk-scheduling landing bento. */
export function getYoutubeLandingKanbanCards(): PostKanbanCardViewModel[] {
	return [
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-youtube-kanban-draft-agent',
				postGroup: 'landing-youtube-kanban-group-1',
				column: 'draft',
				contentPreview: 'Agent draft — MP4 walkthrough ready to queue on your YouTube channel.',
				note: 'Review title and privacy before scheduling',
				channelSlots: [youtubeChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: YOUTUBE_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: true,
				isReviewed: false,
				tagNames: ['walkthrough']
			},
			2,
			{ hour: 9 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-youtube-kanban-scheduled-human',
				postGroup: 'landing-youtube-kanban-group-2',
				column: 'scheduled',
				contentPreview: 'Friday upload — MP4 scheduled with public privacy and tags.',
				note: null,
				channelSlots: [youtubeChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: YOUTUBE_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: false,
				isReviewed: true,
				tagNames: ['product']
			},
			4,
			{ hour: 10, minute: 30 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-youtube-kanban-draft-human',
				postGroup: 'landing-youtube-kanban-group-3',
				column: 'draft',
				contentPreview: 'Tutorial clip — unlisted privacy set in YouTube settings.',
				note: 'Attach custom thumbnail',
				channelSlots: [youtubeChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: YOUTUBE_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: false,
				isReviewed: false,
				tagNames: []
			},
			10,
			{ hour: 14 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-youtube-kanban-scheduled-agent',
				postGroup: 'landing-youtube-kanban-group-4',
				column: 'scheduled',
				contentPreview: 'Agent-drafted upload — batch queued for next week.',
				note: 'Approved in review',
				channelSlots: [youtubeChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: YOUTUBE_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: true,
				isReviewed: true,
				tagNames: ['kol-1']
			},
			12,
			{ hour: 8 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-youtube-kanban-published',
				postGroup: 'landing-youtube-kanban-group-5',
				column: 'published',
				contentPreview: 'Walkthrough that already published to your channel.',
				note: null,
				channelSlots: [youtubeChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: YOUTUBE_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: true,
				isReviewed: true,
				tagNames: ['walkthrough']
			},
			-3,
			{ hour: 16 }
		)
	];
}
