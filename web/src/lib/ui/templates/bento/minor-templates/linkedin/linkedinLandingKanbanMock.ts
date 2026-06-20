import type {
	PostKanbanCardViewModel,
	PostKanbanChannelSlotViewModel
} from '$lib/posts/postKanbanBoard.types';

import { LINKEDIN_LANDING_MOCK_CHANNEL } from './linkedinLandingMock';

const linkedinChannelSlot: PostKanbanChannelSlotViewModel = {
	integrationId: LINKEDIN_LANDING_MOCK_CHANNEL.id,
	picture: LINKEDIN_LANDING_MOCK_CHANNEL.picture,
	name: LINKEDIN_LANDING_MOCK_CHANNEL.name,
	identifier: LINKEDIN_LANDING_MOCK_CHANNEL.identifier
};

export const LINKEDIN_LANDING_KANBAN_CARDS: PostKanbanCardViewModel[] = [
	{
		postId: 'landing-kanban-linkedin-draft',
		postGroup: 'landing-linkedin-group-1',
		column: 'draft',
		contentPreview: 'Thought-leadership post for the company Page — review before scheduling.',
		publishLabel: 'Jun 12, 2026',
		publishTimeLabel: '9:00 AM',
		relativePublishLabel: '(in 4 days)',
		statusLabel: 'Draft',
		publishDateIso: '2026-06-12T09:00:00.000Z',
		note: 'Add slide images for carousel',
		channelSlots: [linkedinChannelSlot],
		hiddenChannelCount: 0,
		primaryChannelName: LINKEDIN_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: false,
		isReviewed: false,
		tagNames: ['b2b']
	},
	{
		postId: 'landing-kanban-linkedin-scheduled',
		postGroup: 'landing-linkedin-group-2',
		column: 'scheduled',
		contentPreview: 'Weekly update queued for LinkedIn Page — multi-image carousel enabled.',
		publishLabel: 'Jun 14, 2026',
		publishTimeLabel: '10:30 AM',
		relativePublishLabel: '(in 6 days)',
		statusLabel: 'Scheduled',
		publishDateIso: '2026-06-14T10:30:00.000Z',
		note: null,
		channelSlots: [linkedinChannelSlot],
		hiddenChannelCount: 0,
		primaryChannelName: LINKEDIN_LANDING_MOCK_CHANNEL.name,
		isAgentEdited: true,
		isReviewed: true,
		tagNames: ['carousel']
	},
	{
		postId: 'landing-kanban-linkedin-draft-2',
		postGroup: 'landing-linkedin-group-3',
		column: 'draft',
		contentPreview: 'Personal profile post — text + single image for founder account.',
		publishLabel: 'Jun 18, 2026',
		publishTimeLabel: '2:00 PM',
		relativePublishLabel: '(in 10 days)',
		statusLabel: 'Draft',
		publishDateIso: '2026-06-18T14:00:00.000Z',
		note: 'Switch channel to personal profile',
		channelSlots: [
			{
				...linkedinChannelSlot,
				integrationId: 'landing-mock-linkedin-personal',
				name: 'Alex Founder',
				identifier: 'linkedin'
			}
		],
		hiddenChannelCount: 0,
		primaryChannelName: 'Alex Founder',
		isAgentEdited: false,
		isReviewed: false,
		tagNames: []
	}
];
