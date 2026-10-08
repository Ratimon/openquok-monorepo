import { icons } from '$data/icons';

import type { McpLandingSeed } from '$lib/content/constants/mcps/types';
import { faqHrefAgent, faqLink, publicFaqHref } from '$lib/content/utils/publicFaqLinks';

export const grok_buildMcpSeed = {
	slug: 'grok-build',
	label: 'Grok Build',
	mcpClient: 'Grok Build',
	icon: icons.GrokBuild.name,
	hubDescription:
		'Add OpenQuok with grok mcp add. Schedule social posts from the Grok Build terminal.',
	heroDescription:
		'Grok Build is xAI\'s coding agent CLI. It runs in your terminal with plugins, skills, and MCP. Connect OpenQuok over HTTP. Draft and schedule social posts beside your code. You approve on the calendar or kanban.',
	metaDescription:
		'Connect OpenQuok MCP to Grok Build. Run grok mcp add, then schedule social posts from your terminal. You approve drafts on the calendar or kanban.',
	workflowPhrase: 'your terminal',
	setupSteps: [
		'Install the grok CLI from grok.com/build',
		'Generate an opo_ programmatic token under Developers → Access.',
		'Run grok mcp add --transport http openquok with the OpenQuok MCP URL from the configuration section.',
		'Start grok and ask: List my connected social media accounts.'
	],
	overrides: {
		faqItemsPrepend: [
			{
				title: 'What is Grok Build?',
				description: `Grok Build is xAI's coding agent CLI. It is not the Grok chatbot and not ${faqLink(publicFaqHref.grokBotLanding, 'Grok Bot')} cloud teammates. Add OpenQuok MCP, then schedule posts from the terminal. See ${faqLink(publicFaqHref.grokBuildAgentGuide, 'Grok Build MCP setup')}.`
			}
		],
		faqPatchesByTitle: {
			'Why use Grok Build MCP instead of an agent host?': {
				description: `${faqLink(publicFaqHref.grokBotLanding, 'Grok Bot')} fits always-on cloud teammates. ${faqLink(faqHrefAgent('openclaw'), 'OpenClaw')} and ${faqLink(faqHrefAgent('hermes'), 'Hermes')} fit chat gateways. Grok Build fits when OpenQuok should live in your terminal next to code. Many teams use both.`
			},
			'How do I verify the connection?': {
				description: `Start a fresh grok session. Ask: List my connected social media accounts. See the ${faqLink(publicFaqHref.grokBuildAgentGuide, 'Grok Build MCP setup guide')}.`
			}
		}
	}
} satisfies McpLandingSeed;
