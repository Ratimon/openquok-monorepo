import type {
	PostKanbanCardViewModel,
	PostKanbanChannelSlotViewModel
} from '$lib/posts/postKanbanBoard.types';

import { applyLandingKanbanMockSchedule } from '$lib/ui/templates/bento/minor-templates/landing/landingKanbanMockSchedule';
import { FACEBOOK_LANDING_MOCK_CHANNEL } from './facebookLandingMock';

const facebookChannelSlot: PostKanbanChannelSlotViewModel = {
	integrationId: FACEBOOK_LANDING_MOCK_CHANNEL.id,
	picture: FACEBOOK_LANDING_MOCK_CHANNEL.picture,
	name: FACEBOOK_LANDING_MOCK_CHANNEL.name,
	identifier: FACEBOOK_LANDING_MOCK_CHANNEL.identifier
};

/** Sample kanban cards for the Facebook bulk-scheduling landing bento. */
export function getFacebookLandingKanbanCards(): PostKanbanCardViewModel[] {
	return [
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-kanban-draft-agent',
				postGroup: 'landing-kanban-group-1',
				column: 'draft',
				contentPreview: 'Friday Reel — MP4 ready to queue on your Facebook Page.',
				note: 'Review agent caption before scheduling',
				channelSlots: [facebookChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: FACEBOOK_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: true,
				isReviewed: false,
				tagNames: ['reels']
			},
			2,
			{ hour: 9 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-kanban-scheduled-human',
				postGroup: 'landing-kanban-group-2',
				column: 'scheduled',
				contentPreview: 'Weekend carousel scheduled for OpenQuok Brand Page.',
				note: null,
				channelSlots: [facebookChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: FACEBOOK_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: false,
				isReviewed: true,
				tagNames: ['carousel']
			},
			4,
			{ hour: 10, minute: 30 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-kanban-draft-human',
				postGroup: 'landing-kanban-group-3',
				column: 'draft',
				contentPreview: 'Text post with link preview — docs URL added in Facebook settings.',
				note: 'Double-check embedded URL',
				channelSlots: [facebookChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: FACEBOOK_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: false,
				isReviewed: false,
				tagNames: []
			},
			10,
			{ hour: 14 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-kanban-scheduled-agent',
				postGroup: 'landing-kanban-group-4',
				column: 'scheduled',
				contentPreview: 'Agent-drafted Page post — batch queued for next week.',
				note: 'Approved in review',
				channelSlots: [facebookChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: FACEBOOK_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: true,
				isReviewed: true,
				tagNames: ['kol-1']
			},
			12,
			{ hour: 8 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-kanban-published',
				postGroup: 'landing-kanban-group-5',
				column: 'published',
				contentPreview: 'Page announcement that already went live this week.',
				note: null,
				channelSlots: [facebookChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: FACEBOOK_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: false,
				isReviewed: true,
				tagNames: ['reels']
			},
			-3,
			{ hour: 16 }
		)
	];
}
