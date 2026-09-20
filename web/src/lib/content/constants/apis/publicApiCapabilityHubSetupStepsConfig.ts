import type { FeaturesOrderedStep } from '$lib/content/constants/agents/types';
import type { PublicApiCapability } from '$lib/content/constants/apis/types';
import { PUBLIC_API_CREATE_POST_ENDPOINT } from '$lib/content/constants/apis/shared';
import { icons } from '$data/icons';

export type PublicApiHubSetupStepsSection = {
	setupStepsSubtitle: string;
	setupStepsTitle: string;
	setupStepsDescription: string;
	setupSteps: readonly FeaturesOrderedStep[];
	setupStepsFooterPrompt: string;
	setupStepsFooterLinkLabel: string;
};

const CONNECT_CHANNELS_TERMINAL = `curl -H "Authorization: opo_your_workspace_token" \\
  https://api.openquok.com/api/v1/public/integrations`;

const POSTING_REQUEST_TERMINAL = `curl -X POST 'https://api.openquok.com/api/v1/public/posts' \\
  -H 'Authorization: opo_your_workspace_token' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "scheduledAt": "2026-05-14T10:00:00.000Z",
    "status": "scheduled",
    "body": "Hello from the public API!",
    "integrationIds": ["<integration-id>"]
  }'`;

const SCHEDULING_REQUEST_TERMINAL = `curl -X POST 'https://api.openquok.com/api/v1/public/posts' \\
  -H 'Authorization: opo_your_workspace_token' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "scheduledAt": "2026-06-18T14:30:00.000Z",
    "status": "scheduled",
    "body": "Queue this post for next Tuesday.",
    "integrationIds": ["<integration-id>"],
    "repeatInterval": "week"
  }'`;

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
			'Connect TikTok, Instagram, X, LinkedIn, Facebook, Threads, and YouTube once in the dashboard. OpenQuok Cloud handles OAuth for you.',
		deviceMock: 'terminal',
		terminalCode: CONNECT_CHANNELS_TERMINAL,
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
			terminalCode: POSTING_REQUEST_TERMINAL,
			mediaAlt: 'Publish a post with POST /public/posts',
			iconName: icons.Send.name
		}
	],
	setupStepsFooterPrompt: 'New to OpenQuok?',
	setupStepsFooterLinkLabel: 'Read the getting started guide'
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
			terminalCode: SCHEDULING_REQUEST_TERMINAL,
			mediaAlt: 'Schedule a post with scheduledAt on POST /public/posts',
			iconName: icons.CalendarClock.name
		}
	],
	setupStepsFooterPrompt: 'New to OpenQuok?',
	setupStepsFooterLinkLabel: 'Read the getting started guide'
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
