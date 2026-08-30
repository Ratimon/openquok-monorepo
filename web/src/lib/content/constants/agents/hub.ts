import type { PublicAgentsHubCompareSection, PublicAgentsHubFaqSection } from '$lib/content/constants/agents/types';

export const PUBLIC_AGENTS_HUB = {
	subtitle: 'Agents',
	title: 'Social media CLI and MCP for AI agents',
	description:
		'Connect OpenClaw, Hermes, Grok Bot, ThinkRail, or any skill-based host — install openquok-core for local agents and custom workflows. Or plug OpenQuok into Cursor, Claude Code, Codex, and other MCP clients. Schedule posts from chat while you approve what goes live.',
	cliInstallTitle: 'Install the CLI:',
	skillInstallTitle: 'Install our core skill:',
	autonomousAgentHubSubtitle: 'Autonomous Agent',
	autonomousAgentHubTitle: 'Self-hosted agent hosts',
	autonomousAgentHubDescription:
		'Message your assistant from Telegram, Discord, Slack, the Grok Bot desktop app, or ThinkRail — install openquok-core, and schedule posts from chat. Pick a host below for setup steps and skill install commands.',
	mcpHubSubtitle: 'MCP',
	mcpHubTitle: 'Native MCP clients',
	mcpHubDescription:
		'Wire OpenQuok into the editors and terminals where you already chat with an AI agent — Cursor and Claude Code for IDE workflows, Warp for an AI-native terminal. Pick a client below for setup steps and a copy-paste MCP config.',
	mcpConfigTitle: 'Copy configuration',
	mcpConfigDescription:
		'Generate a programmatic token after sign-up, then paste the snippet for your client — no CLI skill required.',
	compareSection: {
		subtitle: 'Hosted Agent vs MCP client',
		title: 'agent hosts vs MCP clients match the tool to how you work',
		description:
			'Both paths connect to OpenQuok. Agent hosts like OpenClaw, Hermes, Grok Bot, and ThinkRail shine when you want messaging, memory, and parallel sessions. MCP clients like Codex and Claude Code shine when you want focused coding workflows in your editor or terminal.',
		leftTitle: 'Agent hosts (OpenClaw, Hermes, Grok Bot, ThinkRail)',
		rightTitle: 'MCP clients (Codex, Claude Code, Cursor)',
		points: [
			{
				left: 'Schedule from Telegram, Discord, Slack, or WhatsApp',
				right: 'Work in Cursor, Claude Code, or Codex'
			},
			{
				left: 'Persistent memory across sessions',
				right: 'Focused, per-session coding sprints'
			},
			{
				left: 'Parallel sessions across channels',
				right: 'Async tasks with clear specs'
			},
			{
				left: 'Messaging, memory, and workflows in one assistant',
				right: 'Native OpenQuok MCP tool calls'
			},
			{
				left: 'Model-agnostic — swap providers freely',
				right: 'Ticket- and PR-friendly review flows'
			}
		]
	} satisfies PublicAgentsHubCompareSection,
	faqSection: {
		faqSubtitle: 'Frequently asked questions',
		faqTitle: 'Agent hosts vs MCP clients, answered',
		faqDescription:
			'How OpenClaw, Hermes, Grok Bot, and ThinkRail differ from Cursor, Codex, and Claude Code — when to pick each path, how they connect to OpenQuok, what each costs to run, and why many teams use both.',
		faqItems: [
			{
				title: 'When should I choose an agent host?',
				description:
					'Choose an agent host for scheduling from chat apps, persistent memory, and parallel sessions. Install openquok-core as a SKILL.md you can customize. OpenClaw, Hermes, <a href="/agents/grok-bot">Grok Bot</a>, and <a href="/agents/thinkrail">ThinkRail</a> stay reachable while you are away.'
			},
			{
				title: 'When should I choose an MCP client?',
				description:
					'Choose an MCP client when OpenQuok lives in your editor or terminal with native tool calls — no skill install. <a href="/agents/cursor">Cursor</a>, Claude Code, and Codex suit focused repo work; Warp suits terminal-first workflows.'
			},
			{
				title: 'How do I pay for agent hosts vs MCP clients?',
				description:
					'OpenQuok bills workspaces, channels, and scheduling. Your LLM and agent app bill separately. OpenClaw, Hermes, and ThinkRail are open source. Grok Bot needs SuperGrok or Cursor. Cursor, Claude Code, and Codex use their own plans. OpenQuok MCP only needs your programmatic token.'
			},
			{
				title: 'What is the MCP host vs MCP client?',
				description:
					'The MCP host is the app you use — for example Cursor or Claude Desktop. It opens one MCP client session per connected server, including OpenQuok. We call Cursor, Codex, and Claude Code MCP clients because that matches how developers name their tools.'
			},
			{
				title: 'Does OpenQuok work with both paths at the same time?',
				description:
					'Yes. One workspace can serve an OpenClaw skill and a <a href="/agents/cursor">Cursor MCP</a> config simultaneously — same channels, same approval flow. Use whichever interface matches where you are working: message <a href="/agents/grok-bot">Grok Bot</a> from your phone, chat in <a href="/agents/thinkrail">ThinkRail</a>, or call OpenQuok tools from your IDE.'
			},
			{
				title: 'Which path gives me persistent memory?',
				description:
					'Agent hosts like OpenClaw, Hermes, <a href="/agents/grok-bot">Grok Bot</a>, and <a href="/agents/thinkrail">ThinkRail</a> are built for long-lived sessions — they remember preferences, past decisions, and project context across conversations. MCP clients like <a href="/agents/cursor">Cursor</a> typically run per-session: productive for focused coding sprints, but you start fresh when you open a new session unless the client stores its own project notes.'
			},
			{
				title: 'Do I still approve posts before they publish?',
				description:
					'Yes, regardless of path. Agent hosts and MCP clients create drafts or scheduled items in your OpenQuok workspace. Nothing goes live on autopilot — review on the calendar or kanban and approve what should publish.'
			}
		]
	} satisfies PublicAgentsHubFaqSection
} as const;

