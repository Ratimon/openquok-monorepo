import { icons } from '$data/icons';

import type { McpLandingSeed } from '$lib/content/constants/mcps/types';
import {
	faqExternalLink,
	faqHrefAgent,
	faqLink,
	publicFaqHref
} from '$lib/content/utils/publicFaqLinks';

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
		faqItemsAfterFirst: [
			{
				title: 'How do legacy Cursor plans affect Claude and GPT in Agent?',
				description: `New customers start on The X Subscription (for example Premium at $30/mo). That plan includes a weekly pool for Cursor models. Third-party models such as Claude, GPT, and Gemini are not in the pool. You pay API list price from prepaid credit when you pick them. Legacy plans (Pro, Pro+, Ultra, and Teams Standard or Premium) keep two monthly pools: Cursor Models and Other Models. Pro and above include third-party usage in the Other Models pool. That helps a model-agnostic workflow in the editor. You can route Agent to Claude or GPT without a separate API prepay line on legacy Pro. Staying on legacy is optional. Switching to The X Subscription is permanent. Read ${faqExternalLink('https://cursor.com/docs/account/pricing/legacy-cursor-plans', 'legacy Cursor plans')} and ${faqExternalLink('https://cursor.com/docs/models-and-pricing', 'models and pricing')} before you unify. OpenQuok MCP needs only your programmatic token—see ${faqLink(publicFaqHref.oauthApps, 'OAuth2 for apps')}.`
			},
			{
				title: 'Should I switch from legacy Pro ($20) to Premium ($30)?',
				description: `Compare both plans on Cursor’s site before you move. Premium adds more Cursor-model usage and Grok app benefits. It drops the included Other Models allowance. Legacy Pro keeps monthly third-party inclusion that many teams use for Claude and GPT in Agent. If you schedule with OpenQuok MCP and still want cheap third-party routing in Cursor, legacy Pro may fit longer. If you only use Cursor’s own models, Premium may fit. OpenQuok billing stays on ${faqLink(publicFaqHref.pricing, 'Pricing')} either way.`
			}
		],
		faqPatchesByTitle: {
			'What is OpenQuok MCP for Cursor?': {
				description: `OpenQuok exposes scheduling tools over MCP. Cursor Agent and Composer can list channels and schedule posts. You approve in your workspace. Third-party model access in Cursor depends on your Cursor plan—not on OpenQuok. See ${faqLink(publicFaqHref.mcpGettingStarted, 'MCP getting started')} or the ${faqLink(publicFaqHref.cursorMcpGuide, 'Cursor MCP setup guide')}.`
			},
			'Why use Cursor MCP instead of an agent host?': {
				description: `${faqLink(publicFaqHref.grokBotLanding, 'Grok Bot')}, ${faqLink(publicFaqHref.thinkrailLanding, 'ThinkRail')}, ${faqLink(faqHrefAgent('openclaw'), 'OpenClaw')}, ${faqLink(publicFaqHref.openbotLanding, 'OpenBot')}, and ${faqLink(faqHrefAgent('hermes'), 'Hermes')} fit always-on chat, messaging, or desktop multi-agent rooms. Cursor fits in-repo MCP tool calls. Pick Cursor when you already ship in the repo. Pick an agent host when you want BYO models outside Cursor billing. Many teams use both.`
			}
		}
	}
} satisfies McpLandingSeed;
