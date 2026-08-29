import { icons } from '$data/icons';

import type { PublicAgentHostLandingPageViewModel } from '$lib/content/constants/agents/types';
import {
	OPENQUOK_CLI_COMMAND_REFERENCE,
	THINKRAIL_SKILL_INSTALL_OPTIONS
} from '$lib/content/constants/openquokCliCommandReference';
import { PUBLIC_AGENT_LISTINGS_PREVIEW_SECTION } from '$lib/content/constants/agents/shared';

export const thinkrailAgent = {
	pageType: 'agent-host',
	slug: 'thinkrail',
	agentId: 'thinkrail',
	agentLabel: 'ThinkRail',
	icon: icons.ThinkRail.name,
	available: true,
	metaTitle: 'ThinkRail Social Media Skill for OpenQuok',
	metaDescription:
		'ThinkRail is a worktree IDE for the pi coding agent. Connect OpenQuok to draft and schedule social posts from chat, Monaco, and terminals — approve every publish on the calendar or kanban.',
	hubDescription:
		'ThinkRail is a worktree IDE: each workspace is its own git branch and cwd. Install openquok-core as a pi skill, run the CLI in the worktree terminal, and schedule posts while you approve on OpenQuok.',
	keywords: [
		'ThinkRail social media',
		'ThinkRail skill',
		'pi coding agent skill',
		'openquok-core skill',
		'ThinkRail CLI posting',
		'worktree IDE social posts',
		'OpenQuok ThinkRail integration'
	],
	heroTitle: 'Schedule social media from ThinkRail then you approve',
	heroDescription:
		'ThinkRail hosts the pi coding agent in a real IDE — git worktrees, Monaco tabs, terminals, and concurrent chats. Add the openquok-core skill so the agent drafts and schedules social posts while you review and approve on the calendar or kanban.',
	docsPath: '/docs/agent-setup-guides/thinkrail',
	skillInstallOptions: THINKRAIL_SKILL_INSTALL_OPTIONS,
	workflowSection: {
		subtitle: 'Your worktree IDE',
		title: 'Chat with pi in ThinkRail, keep main clean',
		description:
			'Open a repo, cut a workspace worktree, and ask the agent to draft and schedule like any other task. The openquok-core skill runs in that worktree’s shell, finds connected channels, attaches media, and queues drafts — you approve on the calendar before anything publishes.',
		deviceMock: 'desktop',
		deviceMockContent: 'agent-parallel-schedule',
		imageAlt: 'ThinkRail desktop chat scheduling social posts via OpenQuok'
	},
	audienceSubtitle: 'Built for ThinkRail users',
	audienceTitle: 'Who connects ThinkRail to OpenQuok?',
	audienceCards: [
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			iconClass: 'text-zinc-400',
			title: 'Worktree-first operators',
			description:
				'Each workspace is a real git worktree — own branch, files, terminals, and chats. Install the CLI once, drop openquok-core into ~/.pi or .pi/skills, and schedule without mixing drafts into main.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnRobot.name,
			iconClass: 'text-neutral-300',
			title: 'Pi coding agent users',
			description:
				'ThinkRail is a thin host: pi owns models, skills, and cost. OpenQuok stays CLI-first so you reuse the same recipes in ThinkRail, a pi CLI session, or another skill host.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnHouse.name,
			iconClass: 'text-stone-400',
			title: 'Founders & small teams',
			description:
				'Keep human approval on the calendar while the agent handles volume from a dedicated worktree. Specs stay beside the code; social drafts stay behind OpenQuok review.',
			containerClass: 'h-full min-h-[18rem]'
		}
	],
	setupStepsSubtitle: 'How it works',
	setupStepsTitle: 'Five steps,to ThinkRail + OpenQuok',
	setupSteps: [
		{
			id: 1,
			title: '1. Install ThinkRail',
			content:
				'Install the ThinkRail CLI or desktop build, then run thinkrail on a git repo. You need git on PATH and an authenticated pi provider.',
			mediaAlt: 'ThinkRail documentation at thinkrail.ai',
			deviceMock: 'safari',
			deviceMockContent: 'thinkrail-docs-overview',
			mockUrl: 'thinkrail.ai',
			iconName: icons.Terminal.name
		},
		{
			id: 2,
			title: '2. Open a worktree workspace',
			content:
				'Cut a workspace from the project — its own branch and working directory. Files, diffs, terminals, and chats all scope to that worktree.',
			animatedContent: 'llm-models',
			mediaAlt: 'Create a ThinkRail worktree workspace',
			iconName: icons.Bot.name
		},
		{
			id: 3,
			title: '3. Chat, edit, and run terminals',
			content:
				'Use Monaco tabs, the files tree, Changes, and worktree-scoped terminals. Start a pi session and keep scheduling in the same workspace.',
			mediaAlt: 'ThinkRail desktop chat for scheduling requests',
			deviceMock: 'desktop',
			deviceMockContent: 'agent-parallel-schedule',
			iconName: icons.MessageCircle.name
		},
		{
			id: 4,
			title: '4. Install openquok-core skill',
			content:
				'Install the global CLI, then curl SKILL.md into ~/.pi/agent/skills/openquok-core or .pi/skills in the worktree so pi can load it.',
			mediaAlt: 'Install openquok-core skill and authenticate the OpenQuok CLI',
			deviceMock: 'terminal',
			deviceMockContent: 'openquok-skill-install-thinkrail',
			iconName: icons.OpenQuok.name
		},
		{
			id: 5,
			title: '5. Integrate & customize other skills or MCPs',
			content:
				'Add Bloom, RevenueCat, or any other skill beside openquok-core — optional pi MCP extensions when you need them, CLI-first for scheduling.',
			animatedContent: 'agent-integrations',
			mediaAlt: 'Agent skills and integrations with OpenQuok',
			iconName: icons.Sparkles.name
		}
	],
	featureSections: [
		{
			subtitle: 'Connect once',
			title: 'authenticate in the worktree, pick your workspace, chat from the IDE securely',
			description:
				'Choose an OpenQuok workspace, connect with OAuth2 — approve in your browser, and credentials stay on the machine that runs ThinkRail. Ask the agent in chat to draft and schedule without opening another app.',
			deviceMock: 'iphone-15-pro',
			deviceMockContent: 'openquok-login',
			imageAlt: 'ThinkRail chat guiding OpenQuok OAuth device login and workspace authorization',
			mediaOnRight: true,
			cliCommandsTitle: 'CLI authentication options',
			cliCommands: `# OAuth2 device flow (interactive — opens browser)
openquok auth:login
openquok auth:status`
		},
		{
			subtitle: 'Kanban + smart filters',
			title: 'Review every AI draft, sign off confidently, before it goes live',
			description:
				'Chat, move agent-generated posts from draft to review to scheduled on a kanban board—with the same smart filters as your calendar. Approve quality at scale instead of trusting autopilot.',
			bentoId: 'agent-multi-platform-bulk-scheduling',
			mediaOnRight: false,
			cliCommandsTitle: 'CLI command options',
			cliCommands: `# Draft + human checklist
openquok posts:create -c "…" -s "…" -t draft -i "<uuid>" --note "Check CTA before schedule"

openquok posts:review-todo <post-id> --note "…"
openquok posts:status <post-id> --status draft
openquok posts:status <post-id> -s schedule`
		},
		{
			subtitle: 'Analytics',
			title: 'Ask what worked, see winners, and adapt from chat',
			description:
				'Ask the agent in ThinkRail to pull impressions, likes, comments, and shares for any connected channel. Compare performance and schedule more of what already resonates — without opening the dashboard.',
			deviceMock: 'desktop',
			deviceMockContent: 'agent-parallel-analytics',
			imageAlt: 'ThinkRail desktop chat showing OpenQuok platform and post analytics',
			mediaOnRight: true,
			cliCommandsTitle: 'CLI analytics options',
			cliCommands: `# Platform metrics (followers, impressions, engagement)
openquok analytics:platform <integration-uuid> -d 30

# Per-post insights (likes, comments, shares)
openquok analytics:post <post-id> -d 7`
		},
		{
			subtitle: 'Scale what works',
			title: 'when a format hits, scale by adding worktrees and parallel chats',
			description:
				'Spot a winner in analytics, then cut another worktree for the next client or brand while a second pi session queues the next wave — credentials, channels, and agent context stay isolated as you scale.',
			parallelMocks: [
				{
					deviceMock: 'desktop',
					deviceMockContent: 'agent-parallel-schedule',
					imageAlt: 'First ThinkRail session scheduling posts in parallel'
				},
				{
					deviceMock: 'desktop',
					deviceMockContent: 'agent-parallel-analytics',
					imageAlt: 'Second ThinkRail session pulling live analytics concurrently'
				},
				{
					deviceMock: 'desktop',
					deviceMockContent: 'agent-parallel-schedule',
					imageAlt: 'ThinkRail desktop chat scheduling posts while another session runs analytics'
				}
			],
			mediaOnRight: false,
			cliCommandsTitle: 'Parallel CLI sessions',
			cliCommands: `# Workspace A — launch (client brand)
openquok posts:create -c "…" -s "…" -t draft -i "<uuid>"
openquok posts:status <post-id> -s schedule

# Workspace B — another client (isolated credentials)
openquok posts:list --status draft

# Same workspace — metrics in parallel
openquok analytics:platform <integration-uuid> -d 7
openquok analytics:post <post-id> -d 30`
		}
	],
	listingsPreviewSection: PUBLIC_AGENT_LISTINGS_PREVIEW_SECTION,
	comparisonSection: {
		subtitle: 'comparisons',
		title: 'agent-native scheduling, not another dashboard',
		description:
			'Most social scheduler SaaS keeps you in a browser tab. OpenQuok is built for agents',
		withoutTitle: 'Typical social scheduler SaaS',
		withTitle: 'OpenQuok + ThinkRail',
		points: [
			{
				pain: 'Copy posts between your AI chat and a separate scheduling tool',
				feature: 'Ask the agent in ThinkRail to draft and schedule from the worktree'
			},
			{
				pain: 'Siloed API keys and workflows that do not compose with your agent stack',
				feature: 'Credentials stay on the machine that runs ThinkRail — workspace isolated'
			},
			{
				pain: 'Always-on integrations that bloat agent context',
				feature: 'Skills load on demand from ~/.pi or the worktree .pi/skills folder'
			},
			{
				pain: "Locked to one vendor's models or automation layer",
				feature: 'CLI-first openquok-core works beside any other pi skill or extension'
			},
			{
				pain: 'One working tree mixing every experiment as you add channels and parallel sessions',
				feature:
					'Git worktrees isolate each line of work — merge the good branch, delete the rest'
			},
			{
				pain: 'Autopilot publishing with no human checkpoint',
				feature:
					'Every post lands as draft or scheduled — you approve before anything goes live'
			}
		]
	},
	commandReferenceSection: {
		subtitle: 'CLI',
		title: 'Command reference',
		description:
			'Commands from the openquok-core skill — structured JSON on stdout, human-in-the-loop drafts, and workspace media uploads.',
		commands: OPENQUOK_CLI_COMMAND_REFERENCE
	},
	supportedChannelsSection: {
		subtitle: 'Where you work',
		title: 'Worktrees, editor, and terminals',
		description:
			'ThinkRail scopes files, diffs, terminals, and pi chats to the active git worktree — then invoke openquok-core like any other skill:',
		extensionLabel: 'Optional MCP extensions'
	},
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'ThinkRail + OpenQuok, answered',
	faqDescription:
		'What ThinkRail is, how it relates to the pi coding agent, how to install openquok-core, worktree credentials, human approval, and why CLI beats MCP-only for scheduling.',
	faqItems: [
		{
			title: 'What is ThinkRail?',
			description:
				'ThinkRail is a worktree IDE for the pi coding agent. You open a git repo as a project, cut workspaces as git worktrees, and work across Monaco tabs, terminals, diffs, and concurrent pi chat sessions — all scoped to the active worktree.'
		},
		{
			title: 'How does ThinkRail relate to the pi coding agent?',
			description:
				'ThinkRail is a thin host: pi runs in-process and owns models, skills, compaction, and cost. ThinkRail owns the workspace, the editor, and the UI. You do not need a separate /agents/pi landing — install openquok-core where pi discovers skills, then chat from ThinkRail. A standalone pi CLI session can use the same skill files.'
		},
		{
			title: 'How do I install the openquok-core skill in ThinkRail?',
			description:
				'In a worktree terminal, run npm install -g @openquok/auto-cli@latest, then curl SKILL.md into ~/.pi/agent/skills/openquok-core/SKILL.md (all projects) or .pi/skills/openquok-core/SKILL.md in the worktree. Start a new chat so pi reloads skills. Set OPENQUOK_API_KEY from Account → Settings → Developers → Access or run openquok auth:login. See the <a href="/docs/agent-setup-guides/thinkrail">ThinkRail agent guide</a> or the <a href="/blog/schedule-social-posts-from-thinkrail-with-openquok">scheduling walkthrough</a> for exact commands.'
		},
		{
			title: 'Where do OpenQuok credentials live?',
			description:
				'The global CLI and auth files live on the machine that runs ThinkRail — the same environment as worktree terminals. Your OpenQuok workspace tokens never need to be pasted into chat; use OAuth device flow or a programmatic opo_ token on that computer.'
		},
		{
			title: 'What can ThinkRail do with OpenQuok?',
			description:
				'The agent can draft and schedule posts, upload images and video, apply per-platform settings, schedule threads and follow-up comments, configure internal and global plugs, and pull platform and post analytics — across every channel connected in your workspace. The openquok-core skill documents integrations:list, posts:create, plugs:upsert, posts:status, analytics:platform, upload, and more; every command returns structured JSON for the agent to parse.'
		},
		{
			title: 'Which social media platforms are supported?',
			description:
				'YouTube, TikTok, LinkedIn, and X are available today. Facebook, Instagram, and Threads are coming soon. Connect channels in the OpenQuok web app; ThinkRail uses integration UUIDs from openquok integrations:list to target the right accounts.'
		},
		{
			title: 'Does ThinkRail publish immediately or wait for approval?',
			description:
				'Posts created through the CLI land in your OpenQuok workspace as drafts or scheduled items — nothing goes live on autopilot. You review on the calendar or kanban, move posts through draft and review, and approve what should publish. ThinkRail handles volume; you handle quality.'
		},
		{
			title: 'Why use ThinkRail with CLI instead of MCP-only?',
			description:
				'ThinkRail is not a native OpenQuok MCP client like Cursor. Pi loads skills and can use optional MCP extensions, but openquok-core is CLI-first: structured JSON, media uploads, plugs, and analytics in one skill. MCP fits point-in-time tool calls in editors that host OpenQuok MCP; the CLI skill fits repeatable scheduling recipes in a worktree shell. For editor-native MCP scheduling, see <a href="/agents/cursor">OpenQuok for Cursor</a>. Many teams use both — MCP for ad hoc tools in another IDE, openquok-core inside ThinkRail.'
		},
		{
			title: 'Is it free to start?',
			description:
				'OpenQuok offers a 7-day free trial for scheduling. ThinkRail is open source; you bring your own pi provider credentials. Install ThinkRail, add openquok-core, and begin scheduling from a worktree chat.'
		}
	]
} satisfies PublicAgentHostLandingPageViewModel;
