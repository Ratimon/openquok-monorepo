import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

import type { PublicApiCapability } from '$lib/content/constants/apis/types';
import { getRootPathSocialMediaSchedulingApi } from '$lib/area-public/constants/getRootPathPublicApiMarketing';

export type PublicApiHubWorkflowCard = {
	id: string;
	title: string;
	description: string;
	href: string;
	ctaLabel: string;
	iconName: IconName;
};

export type PublicApiHubWorkflowSection = {
	sectionTitle: string;
	sectionDescription: string;
	cards: readonly PublicApiHubWorkflowCard[];
};

const WORKFLOW_CARDS: readonly [PublicApiHubWorkflowCard, PublicApiHubWorkflowCard] = [
	{
		id: 'scheduling',
		title: 'Scheduling API',
		description:
			'Schedule, reschedule, or cancel content across connected channels with scheduledAt and repeatInterval.',
		href: getRootPathSocialMediaSchedulingApi(),
		ctaLabel: 'Explore the Scheduling API',
		iconName: icons.CalendarClock.name
	},
	{
		id: 'analytics',
		title: 'Analytics API',
		description:
			'Retrieve platform and post metrics for dashboards, reports, and automated workflows.',
		href: '/docs/apis-analytics',
		ctaLabel: 'Explore the Analytics API',
		iconName: icons.ChartBar.name
	}
];

const POSTING_HUB_WORKFLOW_SECTION: PublicApiHubWorkflowSection = {
	sectionTitle: 'Go beyond posting,build the complete workflow',
	sectionDescription:
		'Give your users scheduling and analytics through one OpenQuok integration.',
	cards: WORKFLOW_CARDS
};

const SCHEDULING_HUB_WORKFLOW_SECTION: PublicApiHubWorkflowSection = {
	sectionTitle: 'Go beyond scheduling,build the complete workflow',
	sectionDescription:
		'Give your users scheduling and analytics through one OpenQuok integration.',
	cards: WORKFLOW_CARDS
};

const WORKFLOW_SECTION_BY_CAPABILITY: Record<PublicApiCapability, PublicApiHubWorkflowSection> = {
	posting: POSTING_HUB_WORKFLOW_SECTION,
	scheduling: SCHEDULING_HUB_WORKFLOW_SECTION
};

export function getPublicApiHubWorkflowSection(
	capability: PublicApiCapability
): PublicApiHubWorkflowSection {
	return WORKFLOW_SECTION_BY_CAPABILITY[capability];
}
