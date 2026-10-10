import type { CreateSocialPostChannelViewModel } from '$lib/channels/GetChannel.presenter.svelte';
import { LANDING_MOCK_BRAND_PROFILE } from '$lib/ui/templates/bento/minor-templates/landing/landingMockProfiles';

export const SKOOL_LANDING_MOCK_CHANNEL: CreateSocialPostChannelViewModel = {
	id: 'landing-mock-skool',
	internalId: 'landing-mock-skool-internal',
	name: 'Rati Montreewat',
	identifier: 'skool',
	picture: LANDING_MOCK_BRAND_PROFILE,
	type: 'social',
	disabled: false,
	inBetweenSteps: false,
	refreshNeeded: false,
	schedulable: true,
	unschedulableReason: null,
	group: null,
	additionalSettings: '[]',
	postingTimes: [{ time: 540 }],
	editor: 'normal'
};

export const SKOOL_LANDING_MOCK_CHANNELS = [SKOOL_LANDING_MOCK_CHANNEL];

export const SKOOL_LANDING_MOCK_BODY =
	'Share what you shipped this week and ask one question to spark replies in the group.';

export const SKOOL_LANDING_MOCK_SCHEDULED_LOCAL = '2026-06-14T09:00';

export const SKOOL_LANDING_MOCK_PROVIDER_SETTINGS: Record<string, unknown> = {
	skool: {
		title: 'Week 12 — community update',
		group: 'mock-group-1',
		groupLabel: 'OpenQuok Community',
		label: 'mock-label-announcements',
		labelLabel: 'Announcements'
	}
};

export const SKOOL_LANDING_MOCK_THREAD_REPLIES = [
	{
		id: 'landing-skool-reply-1',
		message: 'Follow-up comment publishes after your chosen delay.',
		delaySeconds: 600
	}
];
