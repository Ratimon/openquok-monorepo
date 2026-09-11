import type {
	PostKanbanCardViewModel,
	PostKanbanChannelSlotViewModel
} from '$lib/posts/postKanbanBoard.types';

import { applyLandingKanbanMockSchedule } from '$lib/ui/templates/bento/minor-templates/landing/landingKanbanMockSchedule';
import { LINKEDIN_LANDING_MOCK_CHANNEL } from './linkedinLandingMock';

const linkedinChannelSlot: PostKanbanChannelSlotViewModel = {
	integrationId: LINKEDIN_LANDING_MOCK_CHANNEL.id,
	picture: LINKEDIN_LANDING_MOCK_CHANNEL.picture,
	name: LINKEDIN_LANDING_MOCK_CHANNEL.name,
	identifier: LINKEDIN_LANDING_MOCK_CHANNEL.identifier
};

export function getLinkedinLandingKanbanCards(): PostKanbanCardViewModel[] {
	return [
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-kanban-linkedin-draft',
				postGroup: 'landing-linkedin-group-1',
				column: 'draft',
				contentPreview: 'Founder POV post for company Page — review before scheduling to buyers.',
				note: 'Add slide images for carousel',
				channelSlots: [linkedinChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: LINKEDIN_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: false,
				isReviewed: false,
				tagNames: ['b2b']
			},
			2,
			{ hour: 9 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-kanban-linkedin-scheduled',
				postGroup: 'landing-linkedin-group-2',
				column: 'scheduled',
				contentPreview: 'Case-study carousel queued for LinkedIn Page — PDF document enabled.',
				note: null,
				channelSlots: [linkedinChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: LINKEDIN_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: true,
				isReviewed: true,
				tagNames: ['carousel']
			},
			4,
			{ hour: 10, minute: 30 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-kanban-linkedin-draft-2',
				postGroup: 'landing-linkedin-group-3',
				column: 'draft',
				contentPreview: 'Personal profile post — sales-asset copy for founder account.',
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
			},
			10,
			{ hour: 14 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-kanban-linkedin-scheduled-agent',
				postGroup: 'landing-linkedin-group-4',
				column: 'scheduled',
				contentPreview: 'Agent-drafted Page post — batch queued for next week.',
				note: 'Approved in review',
				channelSlots: [linkedinChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: LINKEDIN_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: true,
				isReviewed: true,
				tagNames: ['b2b']
			},
			12,
			{ hour: 8 }
		),
		applyLandingKanbanMockSchedule(
			{
				postId: 'landing-kanban-linkedin-published',
				postGroup: 'landing-linkedin-group-5',
				column: 'published',
				contentPreview: 'Case-study carousel that already published on the company Page.',
				note: null,
				channelSlots: [linkedinChannelSlot],
				hiddenChannelCount: 0,
				primaryChannelName: LINKEDIN_LANDING_MOCK_CHANNEL.name,
				isAgentEdited: false,
				isReviewed: true,
				tagNames: ['carousel']
			},
			-3,
			{ hour: 16 }
		)
	];
}
