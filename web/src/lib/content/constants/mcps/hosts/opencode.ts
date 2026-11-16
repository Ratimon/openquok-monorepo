import { icons } from '$data/icons';

import type { McpLandingSeed } from '$lib/content/constants/mcps/types';
import { faqHrefAgent, faqLink, publicFaqHref } from '$lib/content/utils/publicFaqLinks';

export const opencodeMcpSeed = {
	slug: 'opencode',
	label: 'OpenCode',
	mcpClient: 'OpenCode',
	icon: icons.OpenCode.name,
	hubDescription:
		'Add OpenQuok with opencode mcp add. Schedule social posts from the OpenCode terminal, desktop, or web.',
	heroDescription:
		'OpenCode is an open-source coding agent. It runs in your terminal, on desktop, and in the browser. Connect OpenQuok over remote MCP. Draft and schedule social posts beside your code. You approve on the calendar or kanban.',
	metaDescription:
		'Connect OpenQuok MCP to OpenCode. Run opencode mcp add, then schedule social posts from your coding agent. You approve drafts on the calendar or kanban.',
	workflowPhrase: 'your terminal',
	setupSteps: [
		'Install OpenCode from opencode.ai',
		'Generate an opo_ programmatic token under Developers → Access.',
		'Run opencode mcp add openquok --global --url with the OpenQuok MCP URL from the configuration section.',
		'Start OpenCode and ask: List my connected social media accounts.'
	],
	overrides: {
		faqItemsPrepend: [
			{
				title: 'What is OpenCode?',
				description: `OpenCode is an open-source coding agent. It is not ${faqLink(publicFaqHref.cursorLanding, 'Cursor')} or ${faqLink(faqHrefAgent('openclaw'), 'OpenClaw')}. Add OpenQuok remote MCP, then schedule posts from the TUI or desktop app. See ${faqLink(publicFaqHref.opencodeAgentGuide, 'OpenCode MCP setup')}.`
			}
		],
		faqPatchesByTitle: {
			'Why use OpenCode MCP instead of an agent host?': {
				description: `${faqLink(faqHrefAgent('openclaw'), 'OpenClaw')} and ${faqLink(faqHrefAgent('hermes'), 'Hermes')} fit chat gateways. OpenCode fits when OpenQuok should live in your coding agent next to the repo. Many teams use both.`
			},
			'How do I verify the connection?': {
				description: `Run opencode mcp list and confirm openquok is connected. In a fresh session, ask: List my connected social media accounts. See the ${faqLink(publicFaqHref.opencodeAgentGuide, 'OpenCode MCP setup guide')}.`
			}
		}
	}
} satisfies McpLandingSeed;