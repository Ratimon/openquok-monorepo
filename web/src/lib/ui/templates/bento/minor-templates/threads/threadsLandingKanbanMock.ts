import type {
	PostKanbanCardViewModel,
	PostKanbanChannelSlotViewModel
} from '$lib/posts/postKanbanBoard.types';

import { applyLandingKanbanMockSchedule } from '$lib/ui/templates/bento/minor-templates/landing/landingKanbanMockSchedule';
import { THREADS_LANDING_MOCK_CHANNEL } from './threadsLandingMock';

const threadsChannelSlot: PostKanbanChannelSlotViewModel = {
	integrationId: THREADS_LANDING_MOCK_CHANNEL.id,
	picture: THREADS_LANDING_MOCK_CHANNEL.picture,
	name: THREADS_LANDING_MOCK_CHANNEL.name,
	identifier: THREADS_LANDING_MOCK_CHANNEL.identifier
};

/** Sample kanban cards for the Threads bulk-scheduling landing bento. */
export function getThreadsLandingKanbanCards(): PostKanbanCardViewModel[] {
	return [
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-threads-kanban-draft-agent',
				postGroup: 'landing-threads-kanban-group-1',
				column: 'draft',
				contentPreview: 'Agent draft — launch thread with two scheduled follow-up replies.',
				note: 'Review reply chain before scheduling',
				channelSlots: [threadsChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: THREADS_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: true,
				isReviewed: false,
				tagNames: ['launch']
			},
			2,
			{ hour: 9 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-threads-kanban-scheduled-human',
				postGroup: 'landing-threads-kanban-group-2',
				column: 'scheduled',
				contentPreview: 'Weekly roundup scheduled with image attachment.',
				note: null,
				channelSlots: [threadsChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: THREADS_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: false,
				isReviewed: true,
				tagNames: ['weekly']
			},
			4,
			{ hour: 10, minute: 30 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-threads-kanban-draft-human',
				postGroup: 'landing-threads-kanban-group-3',
				column: 'draft',
				contentPreview: 'Text-only post — 500-character preview enforced in composer.',
				note: 'Trim hook to fit limit',
				channelSlots: [threadsChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: THREADS_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: false,
				isReviewed: false,
				tagNames: []
			},
			10,
			{ hour: 14 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-threads-kanban-scheduled-agent',
				postGroup: 'landing-threads-kanban-group-4',
				column: 'scheduled',
				contentPreview: 'Agent batch — four Threads posts queued for next week.',
				note: 'Approved in review',
				channelSlots: [threadsChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: THREADS_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: true,
				isReviewed: true,
				tagNames: ['kol-1']
			},
			12,
			{ hour: 8 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-threads-kanban-published',
				postGroup: 'landing-threads-kanban-group-5',
				column: 'published',
				contentPreview: 'Launch thread that already published with follow-up replies.',
				note: null,
				channelSlots: [threadsChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: THREADS_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: true,
				isReviewed: true,
				tagNames: ['launch']
			},
			-3,
			{ hour: 16 }
		)
	];
}
