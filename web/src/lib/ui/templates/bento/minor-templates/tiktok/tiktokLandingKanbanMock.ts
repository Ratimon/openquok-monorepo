import type {
	PostKanbanCardViewModel,
	PostKanbanChannelSlotViewModel
} from '$lib/posts/postKanbanBoard.types';

import { applyLandingKanbanMockSchedule } from '$lib/ui/templates/bento/minor-templates/landing/landingKanbanMockSchedule';
import { TIKTOK_LANDING_MOCK_CHANNEL } from './tiktokLandingMock';

const tiktokChannelSlot: PostKanbanChannelSlotViewModel = {
	integrationId: TIKTOK_LANDING_MOCK_CHANNEL.id,
	picture: TIKTOK_LANDING_MOCK_CHANNEL.picture,
	name: TIKTOK_LANDING_MOCK_CHANNEL.name,
	identifier: TIKTOK_LANDING_MOCK_CHANNEL.identifier
};

/** Sample kanban cards for the TikTok bulk-scheduling landing bento. */
export function getTiktokLandingKanbanCards(): PostKanbanCardViewModel[] {
	return [
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-tiktok-kanban-draft-agent',
				postGroup: 'landing-tiktok-kanban-group-1',
				column: 'draft',
				contentPreview: 'Agent draft — vertical MP4 ready to queue on your TikTok profile.',
				note: 'Review privacy and posting method before scheduling',
				channelSlots: [tiktokChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: TIKTOK_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: true,
				isReviewed: false,
				tagNames: ['launch']
			},
			2,
			{ hour: 9 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-tiktok-kanban-scheduled-human',
				postGroup: 'landing-tiktok-kanban-group-2',
				column: 'scheduled',
				contentPreview: 'Friday clip — MP4 scheduled with public privacy and comments enabled.',
				note: null,
				channelSlots: [tiktokChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: TIKTOK_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: false,
				isReviewed: true,
				tagNames: ['product']
			},
			4,
			{ hour: 10, minute: 30 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-tiktok-kanban-draft-human',
				postGroup: 'landing-tiktok-kanban-group-3',
				column: 'draft',
				contentPreview: 'Photo carousel — inbox upload mode set in TikTok settings.',
				note: 'Add photo title before scheduling',
				channelSlots: [tiktokChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: TIKTOK_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: false,
				isReviewed: false,
				tagNames: []
			},
			10,
			{ hour: 14 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-tiktok-kanban-scheduled-agent',
				postGroup: 'landing-tiktok-kanban-group-4',
				column: 'scheduled',
				contentPreview: 'Agent-drafted clip — batch queued for next week.',
				note: 'Approved in review',
				channelSlots: [tiktokChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: TIKTOK_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: true,
				isReviewed: true,
				tagNames: ['kol-1']
			},
			12,
			{ hour: 8 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-tiktok-kanban-published',
				postGroup: 'landing-tiktok-kanban-group-5',
				column: 'published',
				contentPreview: 'Vertical clip that already published to your profile.',
				note: null,
				channelSlots: [tiktokChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: TIKTOK_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: false,
				isReviewed: true,
				tagNames: ['product']
			},
			-3,
			{ hour: 16 }
		)
	];
}
