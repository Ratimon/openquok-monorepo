import { icons } from '$data/icons';

import type { McpLandingSeed } from '$lib/content/constants/mcps/types';
import { faqHrefAgent, faqLink, publicFaqHref } from '$lib/content/utils/publicFaqLinks';

export const cursorMcpSeed = {
	slug: 'cursor',
	label: 'Cursor',
	mcpClient: 'Cursor',
	icon: icons.Cursor.name,
	hubDescription: 'Add OpenQuok in .cursor/mcp.json. Use Agent and Composer.',
	heroDescription:
		'Cursor is an AI-native code editor with Agent and Composer built in. Connect OpenQuok over MCP. Draft and schedule social posts from your editor. Publish now, schedule for later, or approve drafts on the calendar or kanban.',
	metaDescription:
		'Connect OpenQuok MCP to Cursor. Schedule social posts from Agent and Composer. Publish now, schedule for later, or approve drafts on the calendar or kanban.',
	workflowPhrase: 'your editor',
	setupSteps: [
		'Download and install Cursor from cursor.com',
		'Create an opo_ programmatic token under Account → Settings → Developers → Access.',
		'Create or open .cursor/mcp.json at your project root and add the openquok server entry from the configuration section.',
		'Reload Cursor, start a new Agent session, and ask: List my connected social media accounts.'
	],
	overrides: {
		faqPatchesByTitle: {
			'What is OpenQuok MCP for Cursor?': {
				description: `OpenQuok exposes scheduling tools over MCP. Cursor Agent and Composer can list channels and schedule posts. You approve in your workspace. See ${faqLink(publicFaqHref.mcpGettingStarted, 'MCP getting started')} or the ${faqLink(publicFaqHref.cursorMcpGuide, 'Cursor MCP setup guide')}.`
			},
			'Why use Cursor MCP instead of an agent host?': {
				description: `${faqLink(publicFaqHref.grokBotLanding, 'Grok Bot')}, ${faqLink(publicFaqHref.thinkrailLanding, 'ThinkRail')}, ${faqLink(faqHrefAgent('openclaw'), 'OpenClaw')}, and ${faqLink(faqHrefAgent('hermes'), 'Hermes')} fit always-on chat and messaging. Cursor fits in-repo MCP tool calls. Pick Cursor when you already ship there. Pick an agent host for messaging and scale. Many teams use both.`
			}
		}
	}
} satisfies McpLandingSeed;
