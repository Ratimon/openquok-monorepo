import { icons } from '$data/icons';

import type { McpLandingSeed } from '$lib/content/constants/mcps/types';
import { faqHrefAgent, faqHrefDocs, faqLink, publicFaqHref } from '$lib/content/utils/publicFaqLinks';

export const warpMcpSeed = {
	slug: 'warp',
	label: 'Warp',
	mcpClient: 'Warp',
	icon: icons.Warp.name,
	hubDescription:
		'Warp is an AI-native terminal with built-in MCP. Ship code, debug deploys, and schedule social from one window.',
	heroDescription:
		'Warp is an AI-native terminal. Run builds, fix errors in context, and schedule social posts without switching apps. Connect OpenQuok over MCP. Warp AI drafts and queues posts. You review and approve on the calendar or kanban.',
	metaDescription:
		'Connect OpenQuok MCP to Warp. Use an AI-native terminal to ship code and schedule social posts. Debug in place. Approve every publish on the calendar or kanban.',
	workflowPhrase: 'your terminal',
	setupSteps: [
		'Download and install Warp from warp.dev',
		'Generate an opo_ programmatic token under Developers → Access.',
		'Open Settings → MCP Servers → + Add in Warp and paste the openquok config from the section.',
		'Start a new Warp AI session and ask: List my connected social media accounts.'
	],
	overrides: {
		audienceCards: [
			{
				iconName: icons.CustomizedDrawnLaptop.name,
				iconClass: 'text-violet-400',
				title: 'Vibecoders & shippers',
				description:
					'Ask Warp AI about build errors in the terminal. You do not copy stack traces into another chat.',
				containerClass: 'h-full min-h-[18rem]'
			},
			{
				iconName: icons.CustomizedDrawnRobot.name,
				iconClass: 'text-fuchsia-400',
				title: 'Terminal-first developers',
				description:
					'Fix code and run OpenQuok MCP tools in one window. You do not need a separate IDE.',
				containerClass: 'h-full min-h-[18rem]'
			},
			{
				iconName: icons.CustomizedDrawnHouse.name,
				iconClass: 'text-teal-400',
				title: 'Startup founders',
				description:
					'Schedule across channels from the same terminal where you ship. Approve on the calendar before publish.',
				containerClass: 'h-full min-h-[18rem]'
			}
		],
		firstFeatureSection: {
			subtitle: 'AI-native terminal',
			title: 'debug in place, edit inline, schedule without leaving the shell',
			description:
				'Classic terminals dump scrolling text. When a deploy fails, you copy errors into another AI tab and lose momentum. Warp keeps AI in the terminal. Ask why a command failed. Get a fix in context. Tweak code in the built-in editor. Queue OpenQuok drafts from the same session. Commands render as blocks you can copy or share. Describe what you want in plain language when you do not remember the exact flags.',
			parallelMocks: [
				{
					deviceMock: 'settings-panel',
					deviceMockContent: 'programmatic-access-token',
					imageAlt: 'Generate a programmatic OpenQuok access token'
				},
				{
					deviceMock: 'desktop',
					deviceMockContent: 'mcp-verify-warp',
					imageAlt: 'Verify OpenQuok MCP connection inside Warp'
				}
			],
			imageAlt: 'Connect OpenQuok to Warp with a token and in-terminal verification',
			mediaOnRight: true,
			cliCommandsTitle: 'First prompt to try',
			cliCommands: `List my connected social media accounts`
		},
		faqItems: [
			{
				title: 'What is Warp?',
				description: `Warp is an AI-native terminal. Run commands, debug output, and schedule social posts in one window. Add OpenQuok MCP to list channels and queue drafts from the same session. See ${faqLink(faqHrefDocs('mcp-setup-guides/warp'), 'Warp MCP setup')}.`
			},
			{
				title: 'How is Warp different from Cursor, Claude Code, and other MCP clients?',
				description: `Most MCP clients are editor-first. ${faqLink(publicFaqHref.cursorLanding, 'Cursor')}, Claude Code, and Codex live in your IDE. Warp is terminal-first. Ship builds, debug deploys, and schedule posts without leaving the shell. Pick Warp when the terminal is home base. Pick an IDE client for deep repo work. Browse ${faqLink(publicFaqHref.agents, 'agent hosts and MCP clients')}.`
			},
			{
				title: 'Do I need the CLI or openquok-core skill?',
				description: `No. Warp connects over MCP with an opo_ token. Use openquok-core on ${faqLink(faqHrefAgent('openclaw'), 'OpenClaw')} or ${faqLink(faqHrefAgent('hermes'), 'Hermes')} when you need shell scripts, parallel sessions, or richer skill workflows. See ${faqLink(publicFaqHref.agentSetupGuides, 'agent setup guides')}.`
			},
			{
				title: 'Why use Warp instead of an agent host like OpenClaw?',
				description: `${faqLink(faqHrefAgent('openclaw'), 'OpenClaw')} and ${faqLink(faqHrefAgent('hermes'), 'Hermes')} fit always-on chat from Telegram, Discord, or Slack. Warp fits when OpenQuok should live where you run commands. Pick Warp for terminal workflows. Pick an agent host for messaging and scale. Many teams use both.`
			},
			{
				title: 'How do I authenticate?',
				description: `Create an OAuth app. Generate an opo_ token. Paste the MCP config. See ${faqLink(publicFaqHref.oauthApps, 'OAuth2 for apps')} and ${faqLink(faqHrefDocs('mcp-setup-guides/warp'), 'Warp MCP setup')}.`
			},
			{
				title: 'How do I verify the connection?',
				description: `Start a fresh Warp AI session. Ask: List my connected social media accounts. See the ${faqLink(faqHrefDocs('mcp-setup-guides/warp'), 'Warp MCP setup guide')}.`
			},
			{
				title: 'Is Warp free?',
				description: `Warp is free to download at warp.dev. You get AI credits to start. OpenQuok MCP needs only your programmatic token. Billing stays separate. Plan limits are on ${faqLink(publicFaqHref.pricing, 'Pricing')}.`
			},
			{
				title: 'Which social platforms are supported?',
				description: `Facebook, Instagram, Threads, YouTube, TikTok, LinkedIn, and X are supported today. See ${faqLink(publicFaqHref.channels, 'Supported channels')} and the ${faqLink(publicFaqHref.socialIntegration, 'channel setup guides')}.`
			}
		]
	}
} satisfies McpLandingSeed;
