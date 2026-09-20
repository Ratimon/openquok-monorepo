import type { FeaturesOrderedStep } from '$lib/content/constants/agents/types';
import type { PublicApiCapability, PublicApiPlatformSlug } from '$lib/content/constants/apis/types';
import {
	buildPublicApiCreatePostTerminalCode,
	buildPublicApiIntegrationsListTerminalCode,
	getPublicApiProviderIdentifier,
	PUBLIC_API_CREATE_POST_ENDPOINT,
	prettyPublicApiJson
} from '$lib/content/constants/apis/shared';
import { icons } from '$data/icons';

export type PublicApiHubSetupStepsSection = {
	setupStepsSubtitle: string;
	setupStepsTitle: string;
	setupStepsDescription: string;
	setupSteps: readonly FeaturesOrderedStep[];
};

const HUB_POSTING_REQUEST_JSON = prettyPublicApiJson({
	scheduledAt: '2026-05-14T10:00:00.000Z',
	status: 'scheduled',
	body: 'Hello from the public API!',
	integrationIds: ['<integration-id>']
});

const HUB_SCHEDULING_REQUEST_JSON = prettyPublicApiJson({
	scheduledAt: '2026-06-18T14:30:00.000Z',
	status: 'scheduled',
	body: 'Queue this post for next Tuesday.',
	integrationIds: ['<integration-id>'],
	repeatInterval: 'week'
});

const SHARED_SETUP_STEPS: readonly [FeaturesOrderedStep, FeaturesOrderedStep] = [
	{
		id: 1,
		title: '1. Get your programmatic token',
		content:
			'Sign up for free, open a workspace, and create an opo_ token under Programmatic access. No sales calls or complicated setup.',
		deviceMock: 'settings-panel',
		deviceMockContent: 'programmatic-access-token',
		mediaAlt: 'Create a programmatic access token in the OpenQuok workspace settings',
		iconName: icons.OpenQuok.name
	},
	{
		id: 2,
		title: '2. Connect your channels',
		content:
			'Connect networks in the dashboard, then list UUIDs with GET /public/integrations. OpenQuok Cloud handles OAuth — no developer app required.',
		deviceMock: 'terminal',
		terminalCode: buildPublicApiIntegrationsListTerminalCode(),
		mediaAlt: 'List connected integrations with GET /public/integrations',
		iconName: icons.Link.name
	}
];

export const PUBLIC_API_POSTING_HUB_SETUP_STEPS: PublicApiHubSetupStepsSection = {
	setupStepsSubtitle: 'Three steps',
	setupStepsTitle: 'Add social media,to your product in three steps',
	setupStepsDescription:
		'Connect once, then publish, schedule, and read data through the same API.',
	setupSteps: [
		...SHARED_SETUP_STEPS,
		{
			id: 3,
			title: '3. Publish with one request',
			content: `Send ${PUBLIC_API_CREATE_POST_ENDPOINT} from curl, the Node SDK, CLI, or MCP. One JSON body can reach every connected channel.`,
			deviceMock: 'terminal',
			terminalCode: buildPublicApiCreatePostTerminalCode(HUB_POSTING_REQUEST_JSON),
			mediaAlt: 'Publish a post with POST /public/posts',
			iconName: icons.Send.name
		}
	]
};

export const PUBLIC_API_SCHEDULING_HUB_SETUP_STEPS: PublicApiHubSetupStepsSection = {
	setupStepsSubtitle: 'Three steps',
	setupStepsTitle: 'Add social media scheduling,to your product in three steps',
	setupStepsDescription:
		'Connect once, then schedule posts and track delivery through the same API.',
	setupSteps: [
		...SHARED_SETUP_STEPS,
		{
			id: 3,
			title: '3. Schedule with one request',
			content:
				'Set scheduledAt in UTC and optional repeatInterval on POST /public/posts. OpenQuok queues the post and publishes on time.',
			deviceMock: 'terminal',
			terminalCode: buildPublicApiCreatePostTerminalCode(HUB_SCHEDULING_REQUEST_JSON),
			mediaAlt: 'Schedule a post with scheduledAt on POST /public/posts',
			iconName: icons.CalendarClock.name
		}
	]
};

const SETUP_STEPS_BY_CAPABILITY: Record<PublicApiCapability, PublicApiHubSetupStepsSection> = {
	posting: PUBLIC_API_POSTING_HUB_SETUP_STEPS,
	scheduling: PUBLIC_API_SCHEDULING_HUB_SETUP_STEPS
};

export function getPublicApiHubSetupStepsSection(
	capability: PublicApiCapability
): PublicApiHubSetupStepsSection {
	return SETUP_STEPS_BY_CAPABILITY[capability];
}

export function getPublicApiPlatformSetupStepsSection(
	capability: PublicApiCapability,
	platformLabel: string,
	platformSlug: PublicApiPlatformSlug,
	platformRequestJson?: string | null
): PublicApiHubSetupStepsSection {
	const hub = getPublicApiHubSetupStepsSection(capability);
	const [step1, step2, step3] = hub.setupSteps;
	const providerIdentifier = getPublicApiProviderIdentifier(platformSlug);
	const resolvedRequestJson =
		platformRequestJson?.trim() ||
		(capability === 'posting' ? HUB_POSTING_REQUEST_JSON : HUB_SCHEDULING_REQUEST_JSON);

	return {
		...hub,
		setupStepsTitle:
			capability === 'posting'
				? `Add ${platformLabel} posting,to your product in three steps`
				: `Add ${platformLabel} scheduling,to your product in three steps`,
		setupStepsDescription:
			capability === 'posting'
				? `Connect ${platformLabel} once, then publish and track delivery through the same API.`
				: `Connect ${platformLabel} once, then schedule posts and track delivery through the same API.`,
		setupSteps: [
			step1,
			{
				...step2,
				title: `2. Connect ${platformLabel}`,
				content: `Connect ${platformLabel} in the dashboard, then list channels with GET /public/integrations and match identifier \`${providerIdentifier}\`.`,
				terminalCode: buildPublicApiIntegrationsListTerminalCode({ providerIdentifier }),
				mediaAlt: `List ${platformLabel} integration UUID with GET /public/integrations`
			},
			{
				...step3,
				title:
					capability === 'posting'
						? `3. Publish to ${platformLabel}`
						: `3. Schedule on ${platformLabel}`,
				content:
					capability === 'posting'
						? `Send ${PUBLIC_API_CREATE_POST_ENDPOINT} with your ${platformLabel} integration UUID and provider settings for that network.`
						: `Set scheduledAt in UTC on ${PUBLIC_API_CREATE_POST_ENDPOINT} with your ${platformLabel} integration UUID and provider settings.`,
				terminalCode: buildPublicApiCreatePostTerminalCode(resolvedRequestJson),
				mediaAlt:
					capability === 'posting'
						? `Publish to ${platformLabel} with POST /public/posts`
						: `Schedule on ${platformLabel} with scheduledAt on POST /public/posts`
			}
		]
	};
}
