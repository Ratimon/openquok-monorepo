import type {
	PostKanbanCardViewModel,
	PostKanbanChannelSlotViewModel
} from '$lib/posts/postKanbanBoard.types';

import { FACEBOOK_LANDING_MOCK_CHANNEL } from './facebookLandingMock';

const facebookChannelSlot: PostKanbanChannelSlotViewModel = {
	integrationId: FACEBOOK_LANDING_MOCK_CHANNEL.id,
	picture: FACEBOOK_LANDING_MOCK_CHANNEL.picture,
	name: FACEBOOK_LANDING_MOCK_CHANNEL.name,
	identifier: FACEBOOK_LANDING_MOCK_CHANNEL.identifier
};

/** Static kanban cards for the Facebook bulk-scheduling landing bento. */
export const FACEBOOK_LANDING_KANBAN_CARDS: PostKanbanCardViewModel[] = [
	{
		postId: 'landing-kanban-draft-agent',
		postGroup: 'landing-kanban-group-1',
		column: 'draft',
		contentPreview: 'Friday Reel — MP4 ready to queue on your Facebook Page.',
		publishLabel: 'Jun 12, 2026',
		publishTimeLabel: '9:00 AM',
		relativePublishLabel: '(in 4 days)',
		statusLabel: 'Draft',
		publishDateIso: '2026-06-12T09:00:00.000Z',
		note: 'Review agent caption before scheduling',
		channelSlots: [facebookChannelSlot],
		hiddenChannelCount: 0,
		primaryChannelName: FACEBOOK_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: true,
		isReviewed: false,
		tagNames: ['reels']
	},
	{
		postId: 'landing-kanban-scheduled-human',
		postGroup: 'landing-kanban-group-2',
		column: 'scheduled',
		contentPreview: 'Weekend carousel scheduled for OpenQuok Brand Page.',
		publishLabel: 'Jun 14, 2026',
		publishTimeLabel: '10:30 AM',
		relativePublishLabel: '(in 6 days)',
		statusLabel: 'Scheduled',
		publishDateIso: '2026-06-14T10:30:00.000Z',
		note: null,
		channelSlots: [facebookChannelSlot],
		hiddenChannelCount: 0,
		primaryChannelName: FACEBOOK_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: false,
		isReviewed: true,
		tagNames: ['carousel']
	},
	{
		postId: 'landing-kanban-draft-human',
		postGroup: 'landing-kanban-group-3',
		column: 'draft',
		contentPreview: 'Text post with link preview — docs URL added in Facebook settings.',
		publishLabel: 'Jun 18, 2026',
		publishTimeLabel: '2:00 PM',
		relativePublishLabel: '(in 10 days)',
		statusLabel: 'Draft',
		publishDateIso: '2026-06-18T14:00:00.000Z',
		note: 'Double-check embedded URL',
		channelSlots: [facebookChannelSlot],
		hiddenChannelCount: 0,
		primaryChannelName: FACEBOOK_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: false,
		isReviewed: false,
		tagNames: []
	},
	{
		postId: 'landing-kanban-scheduled-agent',
		postGroup: 'landing-kanban-group-4',
		column: 'scheduled',
		contentPreview: 'Agent-drafted Page post — batch queued for next week.',
		publishLabel: 'Jun 20, 2026',
		publishTimeLabel: '8:00 AM',
		relativePublishLabel: '(in 12 days)',
		statusLabel: 'Scheduled',
		publishDateIso: '2026-06-20T08:00:00.000Z',
		note: 'Approved in review',
		channelSlots: [facebookChannelSlot],
		hiddenChannelCount: 0,
		primaryChannelName: FACEBOOK_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: true,
		isReviewed: true,
		tagNames: ['agent-batch']
	}
];
