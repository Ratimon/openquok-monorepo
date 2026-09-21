import type { PublicAgentsHubCompareSection, PublicAgentsHubFaqSection } from '$lib/content/constants/agents/types';

export const PUBLIC_AGENTS_HUB = {
	subtitle: 'Agents',
	title: 'Social media CLI and MCP for AI agents',
	description:
		'Install openquok-core on OpenClaw, Hermes, Grok Bot, ThinkRail, or another skill host. Or connect OpenQuok in Cursor, Claude Code, Codex, and other MCP clients. Schedule posts from chat. You approve what goes live.',
	cliInstallTitle: 'Install the CLI:',
	skillInstallTitle: 'Install our core skill:',
	autonomousAgentHubSubtitle: 'Autonomous Agent',
	autonomousAgentHubTitle: 'Autonomous agent hosts',
	autonomousAgentHubDescription:
		'Message your assistant from Telegram, Discord, Slack, Grok Bot, or ThinkRail. Install openquok-core. Schedule posts from chat. Pick a host below for setup and skill install commands.',
	mcpHubSubtitle: 'MCP',
	mcpHubTitle: 'Native MCP clients',
	mcpHubDescription:
		'Add OpenQuok where you already chat with an AI agent. Use Cursor or Claude Code in the IDE. Use Warp in the terminal. Pick a client below for setup and a copy-paste MCP config.',
	mcpConfigTitle: 'Copy configuration',
	mcpConfigDescription:
		'Generate a programmatic token after sign-up. Paste the snippet for your client. You do not need the CLI skill.',
	compareSection: {
		subtitle: 'Hosted Agent vs MCP client',
		title: 'agent hosts vs MCP clients match the tool to how you work',
		description:
			'Both paths connect to OpenQuok. Use an agent host such as OpenClaw, Hermes, Grok Bot, or ThinkRail for messaging, memory, and parallel sessions. Use an MCP client such as Codex or Claude Code for focused work in your editor or terminal.',
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
			'How OpenClaw, Hermes, Grok Bot, and ThinkRail differ from Cursor, Codex, and Claude Code. When to pick each path. How they connect to OpenQuok. What each costs to run. Why many teams use both.',
		faqItems: [
			{
				title: 'When should I choose an agent host?',
				description:
					'Choose an agent host to schedule from chat apps, keep memory, and run parallel sessions. Install openquok-core as a SKILL.md you can customize. OpenClaw, Hermes, <a href="/agents/grok-bot">Grok Bot</a>, and <a href="/agents/thinkrail">ThinkRail</a> stay reachable while you are away.'
			},
			{
				title: 'When should I choose an MCP client?',
				description:
					'Choose an MCP client when OpenQuok lives in your editor or terminal. You get native tool calls. You do not install a skill. <a href="/agents/cursor">Cursor</a>, Claude Code, and Codex fit focused repo work. Warp fits terminal-first workflows.'
			},
			{
				title: 'How do I pay for agent hosts vs MCP clients?',
				description:
					'OpenQuok bills workspaces, channels, and scheduling. Your LLM and agent app bill separately. OpenClaw, Hermes, and ThinkRail are open source. Grok Bot needs SuperGrok or Cursor. Cursor, Claude Code, and Codex use their own plans. OpenQuok MCP needs only your programmatic token.'
			},
			{
				title: 'What is the MCP host vs MCP client?',
				description:
					'The MCP host is the app you use, such as Cursor or Claude Desktop. It opens one MCP client session per connected server, including OpenQuok. We call Cursor, Codex, and Claude Code MCP clients because that matches how developers name their tools.'
			},
			{
				title: 'Does OpenQuok work with both paths at the same time?',
				description:
					'Yes. One workspace can serve an OpenClaw skill and a <a href="/agents/cursor">Cursor MCP</a> config at the same time. You keep the same channels and the same approval flow. Message <a href="/agents/grok-bot">Grok Bot</a> from your phone. Chat in <a href="/agents/thinkrail">ThinkRail</a>. Or call OpenQuok tools from your IDE.'
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

