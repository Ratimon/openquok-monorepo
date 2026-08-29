import { icons } from '$data/icons';

import type { McpLandingSeed } from '$lib/content/constants/mcps/types';

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
				description:
					'OpenQuok exposes social scheduling tools over MCP so Cursor Agent and Composer can list connected channels, read platform limits, and draft or schedule posts in natural language — you approve what publishes in your OpenQuok workspace.'
			},
			{
				title: 'What is Grok Bot and how does it relate to Cursor?',
				description:
					'Grok Bot is Cursor’s always-on AI teammate — message it from the desktop or iOS app, run skills on a shared cloud computer, and set routines while you are away. OpenQuok connects to Grok Bot through the openquok-core CLI skill, not the editor MCP socket. Use <a href="/agents/grok-bot">OpenQuok for Grok Bot</a> when messaging-first scheduling matters; use this page when OpenQuok should live inside Agent and Composer. See the <a href="/blog/schedule-social-posts-from-grok-bot-with-openquok">Grok Bot scheduling walkthrough</a> for install and auth steps.'
			},
			{
				title: 'Do I need the CLI or openquok-core skill?',
				description:
					'No — Cursor connects over MCP with an opo_ token and built-in tools, which is the fastest path for editor workflows. The openquok-core skill on <a href="/agents/grok-bot">Grok Bot</a>, <a href="/agents/thinkrail">ThinkRail</a>, OpenClaw, and Hermes is worth it when you want deeper customization: compose OpenQuok with other skills, run parallel sessions, automate from shell scripts, and scale into workflows MCP alone does not cover yet.'
			},
			{
				title: 'Why use Cursor MCP instead of an agent host?',
				description:
					'<a href="/agents/grok-bot">Grok Bot</a>, <a href="/agents/thinkrail">ThinkRail</a>, OpenClaw, and Hermes fit always-on scheduling from desktop chat, a worktree IDE, Telegram, Discord, or Slack — persistent memory and parallel sessions across channels. Cursor fits when OpenQuok should live inside your editor: native MCP tool calls, focused sessions, and async tasks with clear specs. Choose Cursor when you already ship there; choose an agent host when messaging-first scale matters. Many teams use both.'
			},
			{
				title: 'How do I authenticate?',
				description:
					'Create an OAuth app in Developers → Apps, generate an opo_ token under Developers → Access, then paste the MCP config with either an Authorization header or the API key in the URL path.'
			},
			{
				title: 'How do I verify the connection?',
				description:
					'Start a fresh session in your client and ask: List my connected social media accounts. The agent should call integrationList and return your workspace channels.'
			},
			{
				title: 'Which social platforms are supported?',
				description:
					'YouTube, TikTok, LinkedIn, and X are available today. Facebook, Instagram, and Threads are coming soon. Connect channels in the OpenQuok web app first.'
			}
		]
	}
} satisfies McpLandingSeed;
