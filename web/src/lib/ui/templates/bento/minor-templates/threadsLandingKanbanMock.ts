import type {
	PostKanbanCardViewModel,
	PostKanbanChannelSlotViewModel
} from '$lib/posts/postKanbanBoard.types';

import { THREADS_LANDING_MOCK_CHANNEL } from './threadsLandingMock';

const threadsChannelSlot: PostKanbanChannelSlotViewModel = {
	integrationId: THREADS_LANDING_MOCK_CHANNEL.id,
	picture: THREADS_LANDING_MOCK_CHANNEL.picture,
	name: THREADS_LANDING_MOCK_CHANNEL.name,
	identifier: THREADS_LANDING_MOCK_CHANNEL.identifier
};

/** Static kanban cards for the Threads bulk-scheduling landing bento. */
export const THREADS_LANDING_KANBAN_CARDS: PostKanbanCardViewModel[] = [
	{
		postId: 'landing-threads-kanban-draft-agent',
		postGroup: 'landing-threads-kanban-group-1',
		column: 'draft',
		contentPreview: 'Agent draft — launch thread with two scheduled follow-up replies.',
		publishLabel: 'Jun 12, 2026',
		publishTimeLabel: '9:00 AM',
		relativePublishLabel: '(in 4 days)',
		statusLabel: 'Draft',
		publishDateIso: '2026-06-12T09:00:00.000Z',
		note: 'Review reply chain before scheduling',
		channelSlots: [threadsChannelSlot],
		hiddenChannelCount: 0,
		primaryChannelName: THREADS_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: true,
		isReviewed: false,
		tagNames: ['launch']
	},
	{
		postId: 'landing-threads-kanban-scheduled-human',
		postGroup: 'landing-threads-kanban-group-2',
		column: 'scheduled',
		contentPreview: 'Weekly roundup scheduled with image attachment.',
		publishLabel: 'Jun 14, 2026',
		publishTimeLabel: '10:30 AM',
		relativePublishLabel: '(in 6 days)',
		statusLabel: 'Scheduled',
		publishDateIso: '2026-06-14T10:30:00.000Z',
		note: null,
		channelSlots: [threadsChannelSlot],
		hiddenChannelCount: 0,
		primaryChannelName: THREADS_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: false,
		isReviewed: true,
		tagNames: ['weekly']
	},
	{
		postId: 'landing-threads-kanban-draft-human',
		postGroup: 'landing-threads-kanban-group-3',
		column: 'draft',
		contentPreview: 'Text-only post — 500-character preview enforced in composer.',
		publishLabel: 'Jun 18, 2026',
		publishTimeLabel: '2:00 PM',
		relativePublishLabel: '(in 10 days)',
		statusLabel: 'Draft',
		publishDateIso: '2026-06-18T14:00:00.000Z',
		note: 'Trim hook to fit limit',
		channelSlots: [threadsChannelSlot],
		hiddenChannelCount: 0,
		primaryChannelName: THREADS_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: false,
		isReviewed: false,
		tagNames: []
	},
	{
		postId: 'landing-threads-kanban-scheduled-agent',
		postGroup: 'landing-threads-kanban-group-4',
		column: 'scheduled',
		contentPreview: 'Agent batch — four Threads posts queued for next week.',
		publishLabel: 'Jun 20, 2026',
		publishTimeLabel: '8:00 AM',
		relativePublishLabel: '(in 12 days)',
		statusLabel: 'Scheduled',
		publishDateIso: '2026-06-20T08:00:00.000Z',
		note: 'Approved in review',
		channelSlots: [threadsChannelSlot],
		hiddenChannelCount: 0,
		primaryChannelName: THREADS_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: true,
		isReviewed: true,
		tagNames: ['agent-batch']
	}
];
