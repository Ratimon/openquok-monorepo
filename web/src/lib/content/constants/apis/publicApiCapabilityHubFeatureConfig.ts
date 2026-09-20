import { PUBLIC_LANDING_GETTING_STARTED_GUIDE_CTA } from '$lib/content/constants/publicLandingHeroCopy';

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
