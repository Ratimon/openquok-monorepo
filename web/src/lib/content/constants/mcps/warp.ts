import { icons } from '$data/icons';

import type { McpLandingSeed } from '$lib/content/constants/mcps/types';
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
				description:
					'Warp is a modern terminal with AI built in — not a plugin inside VS Code or Cursor. You run commands, inspect block-based output, and ask Warp AI to explain errors or fix code in the same window. Add OpenQuok MCP to list channels, upload media, and schedule social posts from that same terminal session.'
			},
			{
				title: 'How is Warp different from Cursor, Claude Code, and other MCP clients?',
				description:
					'Most MCP clients on OpenQuok are editor-first: Cursor, Claude Code, Codex, and VS Code Copilot live inside your IDE for deep repo work and PR-friendly sessions. Warp is terminal-first: you ship builds, debug deploy failures, and schedule social posts from one AI-native terminal. When a command fails, you ask Warp what broke — no copying stack traces into a separate chat tab. Choose Warp when your workflow already centers on the terminal; choose an IDE client when you want Agent or Composer inside the project tree.'
			},
			{
				title: 'Do I need the CLI or openquok-core skill?',
				description:
					'No — Warp connects over MCP with an opo_ token and built-in tools, which is the fastest path for terminal workflows. The openquok-core skill on agent hosts like OpenClaw and Hermes is worth it when you want deeper customization: compose OpenQuok with other skills, run parallel sessions, automate from shell scripts, and scale into workflows MCP alone does not cover yet.'
			},
			{
				title: 'Why use Warp instead of an agent host like OpenClaw?',
				description:
					'OpenClaw and Hermes fit always-on scheduling from Telegram, Discord, or Slack — persistent memory and parallel sessions across messaging apps. Warp fits when OpenQuok should live where you already run commands: native MCP tool calls, in-terminal AI for debugging, and focused ship sessions without standing up a separate agent host. Choose Warp when the terminal is home base; choose an agent host when messaging-first scale matters. Many teams use both.'
			},
			{
				title: 'How do I authenticate?',
				description:
					'Create an OAuth app in Developers → Apps, generate an opo_ token under Developers → Access, then paste the MCP config with either an Authorization header or the API key in the URL path.'
			},
			{
				title: 'How do I verify the connection?',
				description:
					'Start a fresh Warp AI session and ask: List my connected social media accounts. Warp should call integrationList and return your workspace channels.'
			},
			{
				title: 'Is Warp free?',
				description:
					'Warp is free to download for macOS, Windows, and Linux at warp.dev. Warp includes AI credits to get started; upgrade if you use AI heavily. OpenQuok MCP only needs your OpenQuok programmatic token — billing for Warp AI and OpenQuok workspaces stays separate.'
			},
			{
				title: 'Which social platforms are supported?',
				description:
					'YouTube, TikTok, LinkedIn, and X are available today. Facebook, Instagram, and Threads are coming soon. Connect channels in the OpenQuok web app first.'
			}
		]
	}
} satisfies McpLandingSeed;
