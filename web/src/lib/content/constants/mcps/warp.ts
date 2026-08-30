import { icons } from '$data/icons';

import type { McpLandingSeed } from '$lib/content/constants/mcps/types';
import { faqHrefAgent, faqHrefDocs, faqLink, publicFaqHref } from '$lib/content/utils/publicFaqLinks';
import { getMcpVerifySafariContentId } from '$lib/ui/templates/device-mocks/safari/mcpClientVerifyMockConfig';

export const warpMcpSeed = {
	slug: 'warp',
	label: 'Warp',
	mcpClient: 'Warp',
	icon: icons.Warp.name,
	hubDescription:
		'AI-native terminal with built-in MCP — ship code, debug deploys, and schedule social from one window',
	heroDescription:
		'Warp is an AI-native terminal — run builds, fix errors in context, and schedule social posts without switching apps. Connect OpenQuok over MCP so Warp AI drafts and queues posts while you review and approve on the calendar or kanban.',
	metaDescription:
		'Connect OpenQuok MCP to Warp — an AI-native terminal for shipping code and scheduling social posts. Debug in place, approve every publish on the calendar or kanban.',
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
					'When a build or deploy fails, ask Warp AI about the error right in the terminal — no copy-pasting stack traces into another chat window.',
				containerClass: 'h-full min-h-[18rem]'
			},
			{
				iconName: icons.CustomizedDrawnRobot.name,
				iconClass: 'text-fuchsia-400',
				title: 'Terminal-first developers',
				description:
					'Block-based output, a built-in editor, and natural-language commands — fix code and run OpenQuok MCP tools without jumping to a separate IDE.',
				containerClass: 'h-full min-h-[18rem]'
			},
			{
				iconName: icons.CustomizedDrawnHouse.name,
				iconClass: 'text-teal-400',
				title: 'Startup founders',
				description:
					'Schedule across Facebook, Instagram, Threads, YouTube, and TikTok from the same terminal where you ship — approve on the calendar or kanban before anything goes live.',
				containerClass: 'h-full min-h-[18rem]'
			}
		],
		firstFeatureSection: {
			subtitle: 'AI-native terminal',
			title: 'debug in place, edit inline, schedule without leaving the shell',
			description:
				'Classic terminals dump scrolling text — when deploy fails you copy errors into another AI tab and lose momentum. Warp keeps AI in the terminal: ask why a command failed, get a fix in context, tweak code in the built-in editor, and queue OpenQuok drafts from the same session. Commands render as blocks you can copy or share; describe what you want in plain language when you do not remember the exact flags.',
			parallelMocks: [
				{
					deviceMock: 'settings-panel',
					deviceMockContent: 'programmatic-access-token',
					imageAlt: 'Generate a programmatic OpenQuok access token'
				},
				{
					deviceMock: 'desktop',
					deviceMockContent: getMcpVerifySafariContentId('Warp'),
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
				description: `Warp is an AI-native terminal — run commands, debug output, and schedule social posts in one window. Add OpenQuok MCP to list channels and queue drafts from the same session. See ${faqLink(faqHrefDocs('mcp-setup-guides/warp'), 'Warp MCP setup')}.`
			},
			{
				title: 'How is Warp different from Cursor, Claude Code, and other MCP clients?',
				description: `Most MCP clients are editor-first — ${faqLink(publicFaqHref.cursorLanding, 'Cursor')}, Claude Code, and Codex live in your IDE. Warp is terminal-first: ship builds, debug deploys, and schedule posts without leaving the shell. Pick Warp when the terminal is home base; pick an IDE client for deep repo work. Browse ${faqLink(publicFaqHref.agents, 'agent hosts and MCP clients')}.`
			},
			{
				title: 'Do I need the CLI or openquok-core skill?',
				description: `No — Warp connects over MCP with an opo_ token. Use openquok-core on ${faqLink(faqHrefAgent('openclaw'), 'OpenClaw')} or ${faqLink(faqHrefAgent('hermes'), 'Hermes')} when you need shell scripts, parallel sessions, or richer skill workflows. See ${faqLink(publicFaqHref.agentSetupGuides, 'agent setup guides')}.`
			},
			{
				title: 'Why use Warp instead of an agent host like OpenClaw?',
				description: `${faqLink(faqHrefAgent('openclaw'), 'OpenClaw')} and ${faqLink(faqHrefAgent('hermes'), 'Hermes')} fit always-on chat from Telegram, Discord, or Slack. Warp fits when OpenQuok should live where you run commands. Pick Warp for terminal workflows; pick an agent host for messaging and scale. Many teams use both.`
			},
			{
				title: 'How do I authenticate?',
				description: `Create an OAuth app, generate an opo_ token, then paste the MCP config. See ${faqLink(publicFaqHref.oauthApps, 'OAuth2 for apps')} and ${faqLink(faqHrefDocs('mcp-setup-guides/warp'), 'Warp MCP setup')}.`
			},
			{
				title: 'How do I verify the connection?',
				description: `Start a fresh Warp AI session and ask: List my connected social media accounts. See the ${faqLink(faqHrefDocs('mcp-setup-guides/warp'), 'Warp MCP setup guide')}.`
			},
			{
				title: 'Is Warp free?',
				description: `Warp is free to download at warp.dev with AI credits to start. OpenQuok MCP only needs your programmatic token — billing stays separate. Plan limits are on ${faqLink(publicFaqHref.pricing, 'Pricing')}.`
			},
			{
				title: 'Which social platforms are supported?',
				description: `YouTube, TikTok, LinkedIn, and X are available today. Facebook, Instagram, and Threads are coming soon. See ${faqLink(publicFaqHref.channels, 'Supported channels')} and the ${faqLink(publicFaqHref.socialIntegration, 'channel setup guides')}.`
			}
		]
	}
} satisfies McpLandingSeed;
