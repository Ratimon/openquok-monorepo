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
			title: 'TypeScript client, typed payloads, same REST surface',
			description:
				'Install @openquok/node-sdk in your backend or automation repo. Call post() with the same JSON you would send to POST /public/posts — integrations, media, provider settings, and scheduling fields included.',
			mediaOnRight: true,
			docsPath: '/docs/getting-started-for-public-api',
			docsCtaLabel: 'Public API docs',
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
			title: 'Agents schedule posts, list channels, read analytics',
			description:
				'Connect Cursor, Claude Code, Codex, or any MCP client with your opo_ token. Tools such as schedulePostTool and integrationList mirror the public API so agents can draft and queue posts in chat.',
			mediaOnRight: false,
			docsPath: '/docs/getting-started-for-mcp',
			docsCtaLabel: 'MCP getting started',
			terminalCode: `# After you add OpenQuok in your MCP client config:
# Ask your agent to schedule from connected channels.

> Schedule a post to Threads for tomorrow at 10am UTC:
> Launch day recap with a link to our pricing page.`,
			terminalAriaLabel: 'MCP agent prompt example for scheduling a post'
		},
		{
			subtitle: 'OAuth2 for apps',
			title: 'Third-party apps, user consent, workspace-scoped tokens',
			description:
				'Register an app under Developers → Apps, run the Authorization Code flow, and receive an opo_ access token for the organization the user approves. Ship embedded schedulers without asking users to paste workspace keys.',
			mediaOnRight: true,
			docsPath: '/docs/oauth2-for-apps',
			docsCtaLabel: 'OAuth for apps',
			terminalCode: `# Redirect the user to approve your app
https://www.openquok.com/oauth/authorize?client_id=oqc_your_client_id&response_type=code&state=random123

# Exchange the code for an opo_ access token, then call:
curl -H "Authorization: Bearer opo_oauth_access_token" \\
  https://api.openquok.com/api/v1/public/integrations`,
			terminalAriaLabel: 'OAuth2 authorization and API call example'
		}
	];
