import { icons } from '$data/icons';

import type { McpLandingSeed } from '$lib/content/constants/mcps/types';
import { faqHrefAgent, faqLink, publicFaqHref } from '$lib/content/utils/publicFaqLinks';

export const cursorMcpSeed = {
	slug: 'cursor',
	label: 'Cursor',
	mcpClient: 'Cursor',
	icon: icons.Cursor.name,
	hubDescription: 'Project-level .cursor/mcp.json for Agent and Composer',
	heroDescription:
		'Cursor is an AI-native code editor with Agent and Composer built in. Connect OpenQuok over MCP so you draft and schedule social posts from your editor while you review and approve on the calendar or kanban.',
	metaDescription:
		'Connect OpenQuok MCP to Cursor — schedule social posts from Agent and Composer. Approve every publish on the calendar or kanban.',
	workflowPhrase: 'your editor',
	setupSteps: [
		'Download and install Cursor from cursor.com',
		'Create an opo_ programmatic token under Account → Settings → Developers → Access.',
		'Create or open .cursor/mcp.json at your project root and add the openquok server entry from the configuration section.',
		'Reload Cursor, start a new Agent session, and ask: List my connected social media accounts.'
	],
	overrides: {
		faqItems: [
			{
				title: 'What is OpenQuok MCP for Cursor?',
				description: `OpenQuok exposes scheduling tools over MCP so Cursor Agent and Composer can list channels and schedule posts — you approve in your workspace. See ${faqLink(publicFaqHref.mcpGettingStarted, 'MCP getting started')} or the ${faqLink(publicFaqHref.cursorMcpGuide, 'Cursor MCP setup guide')}.`
			},
			{
				title: 'What is Grok Bot and how does it relate to Cursor?',
				description: `${faqLink(publicFaqHref.grokBotLanding, 'Grok Bot')} is the always-on teammate; this page is OpenQuok inside Agent and Composer. Pick Grok Bot for messaging-first volume; pick Cursor when you stay in the repo. See the ${faqLink(publicFaqHref.blogGrokBot, 'Grok Bot scheduling walkthrough')}.`
			},
			{
				title: 'Do I need the CLI or openquok-core skill?',
				description: `No — Cursor connects over MCP with an opo_ token. Use openquok-core on ${faqLink(publicFaqHref.grokBotLanding, 'Grok Bot')}, ${faqLink(publicFaqHref.thinkrailLanding, 'ThinkRail')}, ${faqLink(faqHrefAgent('openclaw'), 'OpenClaw')}, or ${faqLink(faqHrefAgent('hermes'), 'Hermes')} for deeper skill workflows. See ${faqLink(publicFaqHref.agentSetupGuides, 'agent setup guides')}.`
			},
			{
				title: 'Why use Cursor MCP instead of an agent host?',
				description: `${faqLink(publicFaqHref.grokBotLanding, 'Grok Bot')}, ${faqLink(publicFaqHref.thinkrailLanding, 'ThinkRail')}, ${faqLink(faqHrefAgent('openclaw'), 'OpenClaw')}, and ${faqLink(faqHrefAgent('hermes'), 'Hermes')} fit always-on chat and messaging. Cursor fits in-repo MCP tool calls. Pick Cursor when you already ship there; pick an agent host for messaging and scale. Many teams use both.`
			},
			{
				title: 'How do I authenticate?',
				description: `Create an OAuth app, generate an opo_ token, then paste the MCP config. See ${faqLink(publicFaqHref.oauthApps, 'OAuth2 for apps')} and the ${faqLink(publicFaqHref.cursorMcpGuide, 'Cursor MCP setup')}.`
			},
			{
				title: 'How do I verify the connection?',
				description: `Start a fresh Agent session and ask: List my connected social media accounts. See the ${faqLink(publicFaqHref.cursorMcpGuide, 'Cursor MCP setup guide')}.`
			},
			{
				title: 'Which social platforms are supported?',
				description: `YouTube, TikTok, LinkedIn, and X are available today. Facebook, Instagram, and Threads are coming soon. See ${faqLink(publicFaqHref.channels, 'Supported channels')} and the ${faqLink(publicFaqHref.socialIntegration, 'channel setup guides')}.`
			}
		]
	}
} satisfies McpLandingSeed;
