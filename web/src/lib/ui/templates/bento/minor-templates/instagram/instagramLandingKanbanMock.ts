import type {
	PostKanbanCardViewModel,
	PostKanbanChannelSlotViewModel
} from '$lib/posts/postKanbanBoard.types';

import { applyLandingKanbanMockSchedule } from '$lib/ui/templates/bento/minor-templates/landing/landingKanbanMockSchedule';
import { INSTAGRAM_LANDING_MOCK_CHANNEL } from './instagramLandingMock';

const instagramChannelSlot: PostKanbanChannelSlotViewModel = {
	integrationId: INSTAGRAM_LANDING_MOCK_CHANNEL.id,
	picture: INSTAGRAM_LANDING_MOCK_CHANNEL.picture,
	name: INSTAGRAM_LANDING_MOCK_CHANNEL.name,
	identifier: INSTAGRAM_LANDING_MOCK_CHANNEL.identifier
};

/** Sample kanban cards for the Instagram bulk-scheduling landing bento. */
export function getInstagramLandingKanbanCards(): PostKanbanCardViewModel[] {
	return [
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-instagram-kanban-draft-agent',
				postGroup: 'landing-instagram-kanban-group-1',
				column: 'draft',
				contentPreview: 'Agent draft — carousel queued with caption and collaborator tags.',
				note: 'Review Instagram settings before scheduling',
				channelSlots: [instagramChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: INSTAGRAM_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: true,
				isReviewed: false,
				tagNames: ['carousel']
			},
			2,
			{ hour: 9 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-instagram-kanban-scheduled-human',
				postGroup: 'landing-instagram-kanban-group-2',
				column: 'scheduled',
				contentPreview: 'Friday Reel — single MP4 scheduled for the feed.',
				note: null,
				channelSlots: [instagramChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: INSTAGRAM_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: false,
				isReviewed: true,
				tagNames: ['reels']
			},
			4,
			{ hour: 10, minute: 30 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-instagram-kanban-draft-human',
				postGroup: 'landing-instagram-kanban-group-3',
				column: 'draft',
				contentPreview: 'Story draft — one image attachment, post type set to Story.',
				note: 'Confirm Story duration under 60s',
				channelSlots: [instagramChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: INSTAGRAM_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: false,
				isReviewed: false,
				tagNames: []
			},
			10,
			{ hour: 14 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-instagram-kanban-scheduled-agent',
				postGroup: 'landing-instagram-kanban-group-4',
				column: 'scheduled',
				contentPreview: 'Agent batch — four Instagram posts queued for next week.',
				note: 'Approved in review',
				channelSlots: [instagramChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: INSTAGRAM_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: true,
				isReviewed: true,
				tagNames: ['shop-1']
			},
			12,
			{ hour: 8 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-instagram-kanban-published',
				postGroup: 'landing-instagram-kanban-group-5',
				column: 'published',
				contentPreview: 'Carousel that already published to the feed this week.',
				note: null,
				channelSlots: [instagramChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: INSTAGRAM_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: false,
				isReviewed: true,
				tagNames: ['carousel']
			},
			-3,
			{ hour: 16 }
		)
	];
}
