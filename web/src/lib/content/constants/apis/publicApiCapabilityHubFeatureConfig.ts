import type { PublicApiCapability, PublicApiPlatformSlug } from '$lib/content/constants/apis/types';
import {
	buildPublicApiIntegrationsListTerminalCode,
	getPublicApiProviderIdentifier,
	prettyPublicApiJson
} from '$lib/content/constants/apis/shared';
import { PUBLIC_LANDING_GETTING_STARTED_GUIDE_CTA } from '$lib/content/constants/publicLandingHeroCopy';

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

function buildPlatformSdkTerminalCode(requestJson: string): string {
	const trimmed = requestJson.trim();
	let inner: string;
	try {
		inner = JSON.stringify(JSON.parse(trimmed), null, 2);
	} catch {
		inner = trimmed;
	}
	const indented = inner
		.split('\n')
		.map((line) => `  ${line}`)
		.join('\n');

	return `npm install @openquok/node-sdk

import Openquok from '@openquok/node-sdk';

const openquok = new Openquok('opo_your_programmatic_token');

await openquok.post({
${indented}
});`;
}

function buildPlatformMcpTerminalCode(
	capability: PublicApiCapability,
	platformLabel: string
): string {
	const actionHint =
		capability === 'posting'
			? `# Ask your agent to publish to ${platformLabel}.`
			: `# Ask your agent to schedule on ${platformLabel}.`;

	const prompt =
		capability === 'posting'
			? `> Publish to ${platformLabel} now:\n> Product launch recap with a link to our pricing page.`
			: `> Schedule on ${platformLabel} for tomorrow at 10am UTC:\n> Product launch recap with a link to our pricing page.`;

	return `# After you add OpenQuok in your MCP client config:
${actionHint}

${prompt}`;
}

function buildPlatformOAuthTerminalCode(providerIdentifier: string): string {
	const integrationsCurl = buildPublicApiIntegrationsListTerminalCode({ providerIdentifier }).replace(
		'Bearer opo_your_programmatic_token',
		'Bearer opo_oauth_access_token'
	);

	return `# Redirect the user to approve your app
https://www.openquok.com/oauth/authorize?client_id=oqc_your_client_id&response_type=code&state=random123

# Exchange the code for an opo_ access token, then call:
${integrationsCurl}`;
}

export type PublicApiMarketingFeatureSection = {
	subtitle: string;
	title: string;
	description: string;
	mediaOnRight?: boolean;
	docsPath: string;
	docsCtaLabel: string;
	terminalCode: string;
	terminalAriaLabel: string;
};

export const PUBLIC_API_MARKETING_HUB_FEATURE_SECTIONS: readonly PublicApiMarketingFeatureSection[] =
	[
		{
			subtitle: 'Node SDK',
			title: 'TypeScript SDK,for Node.js backends,typed REST calls',
			description:
				'Install @openquok/node-sdk in your Next.js or TypeScript backend. Call post() with the same JSON you send to POST /public/posts. Media, integrations, and schedule fields stay typed.',
			mediaOnRight: true,
			docsPath: '/docs/getting-started-for-public-api',
			docsCtaLabel: PUBLIC_LANDING_GETTING_STARTED_GUIDE_CTA,
			terminalCode: `npm install @openquok/node-sdk

import Openquok from '@openquok/node-sdk';

const openquok = new Openquok('opo_your_programmatic_token');

await openquok.post({
  scheduledAt: '2026-06-18T14:30:00.000Z',
  status: 'scheduled',
  body: 'Hello from the Node SDK',
  integrationIds: ['<integration-id>']
});`,
			terminalAriaLabel: 'Node SDK example for scheduling a post'
		},
		{
			subtitle: 'MCP server',
			title: 'MCP tools,for Cursor and Claude Code,same public API',
			description:
				'Connect your MCP client with an opo_ token. Use schedulePostTool, integrationList, and postsList from chat. Agents draft and queue posts through the same REST API.',
			mediaOnRight: false,
			docsPath: '/docs/getting-started-for-mcp',
			docsCtaLabel: 'The MCP Setup Guide',
			terminalCode: `# After you add OpenQuok in your MCP client config:
# Ask your agent to schedule from connected channels.

> Schedule a post to Threads for tomorrow at 10am UTC:
> Launch day recap with a link to our pricing page.`,
			terminalAriaLabel: 'MCP agent prompt example for scheduling a post'
		},
		{
			subtitle: 'OAuth2 for apps',
			title: 'OAuth2 apps,user consent,workspace tokens',
			description:
				'Register your app under Developers → Apps. Run the Authorization Code flow. Receive an opo_ token for the organization the user approves. Embed scheduling without pasted workspace keys.',
			mediaOnRight: true,
			docsPath: '/docs/oauth2-for-apps',
			docsCtaLabel: 'The OAuth for Apps Guide',
			terminalCode: `# Redirect the user to approve your app
https://www.openquok.com/oauth/authorize?client_id=oqc_your_client_id&response_type=code&state=random123

# Exchange the code for an opo_ access token, then call:
curl -H "Authorization: Bearer opo_oauth_access_token" \\
  https://api.openquok.com/api/v1/public/integrations`,
			terminalAriaLabel: 'OAuth2 authorization and API call example'
		}
	];

export function getPublicApiHubFeatureSections(): readonly PublicApiMarketingFeatureSection[] {
	return PUBLIC_API_MARKETING_HUB_FEATURE_SECTIONS;
}

export function getPublicApiPlatformFeatureSections(
	capability: PublicApiCapability,
	platformLabel: string,
	platformSlug: PublicApiPlatformSlug,
	platformRequestJson?: string | null
): readonly PublicApiMarketingFeatureSection[] {
	const providerIdentifier = getPublicApiProviderIdentifier(platformSlug);
	const resolvedRequestJson =
		platformRequestJson?.trim() ||
		(capability === 'posting' ? HUB_POSTING_REQUEST_JSON : HUB_SCHEDULING_REQUEST_JSON);
	const [sdkSection, mcpSection, oauthSection] = PUBLIC_API_MARKETING_HUB_FEATURE_SECTIONS;

	return [
		{
			...sdkSection,
			description:
				capability === 'posting'
					? `Install @openquok/node-sdk in your Next.js or TypeScript backend. Call post() to publish to ${platformLabel} with the same JSON you send to POST /public/posts. Media, integrations, and provider settings stay typed.`
					: `Install @openquok/node-sdk in your Next.js or TypeScript backend. Call post() to schedule on ${platformLabel} with the same JSON you send to POST /public/posts. scheduledAt, repeatInterval, and provider settings stay typed.`,
			terminalCode: buildPlatformSdkTerminalCode(resolvedRequestJson),
			terminalAriaLabel:
				capability === 'posting'
					? `Node SDK example for publishing to ${platformLabel}`
					: `Node SDK example for scheduling on ${platformLabel}`
		},
		{
			...mcpSection,
			description:
				capability === 'posting'
					? `Connect your MCP client with an opo_ token. Publish ${platformLabel} posts from chat with schedulePostTool and integrationList. Agents use the same REST API as curl and the SDK.`
					: `Connect your MCP client with an opo_ token. Schedule ${platformLabel} posts from chat with schedulePostTool and integrationList. Agents use the same REST API as curl and the SDK.`,
			terminalCode: buildPlatformMcpTerminalCode(capability, platformLabel),
			terminalAriaLabel: `MCP agent prompt example for ${platformLabel}`
		},
		{
			...oauthSection,
			description:
				capability === 'posting'
					? `Register your app under Developers → Apps. Users approve access to their workspace, then your app calls the public API for ${platformLabel} publishing without pasted workspace keys.`
					: `Register your app under Developers → Apps. Users approve access to their workspace, then your app calls the public API for ${platformLabel} scheduling without pasted workspace keys.`,
			terminalCode: buildPlatformOAuthTerminalCode(providerIdentifier),
			terminalAriaLabel: `OAuth2 authorization and ${platformLabel} integration lookup example`
		}
	];
}
