import { icons } from '$data/icons';

import type { PublicAgentHostLandingPageViewModel } from '$lib/content/constants/agents/types';
import { faqLink, publicFaqHref } from '$lib/content/utils/publicFaqLinks';
import {
	MANUS_SKILL_INSTALL_OPTIONS,
	OPENQUOK_CLI_COMMAND_REFERENCE
} from '$lib/content/constants/agents/cli-command-reference';
import { PUBLIC_AGENT_LISTINGS_PREVIEW_SECTION } from '$lib/content/constants/agents/general';

export const manusAgent = {
	pageType: 'agent-host',
	slug: 'manus',
	agentId: 'manus',
	agentLabel: 'Manus',
	icon: icons.Manus.name,
	available: true,
	metaTitle: 'Manus Social Media Skill for OpenQuok',
	metaDescription:
		'Manus is an agent platform with Skills, Manus Studio, and Cloud Computers. Connect OpenQuok to draft and schedule social posts from chat. You approve every publish on the calendar or kanban.',
	hubDescription:
		'Manus runs projects in Studio, web, and mobile. Import openquok-core as a Skill from GitHub or upload. Run the CLI on a Cloud Computer. Schedule posts. You approve on OpenQuok.',
	keywords: [
		'Manus social media',
		'Manus skill',
		'Manus 2.0 skill',
		'openquok-core skill',
		'Manus CLI posting',
		'agentic social media scheduler',
		'schedule social media via MCP',
		'Manus Cloud Computer scheduling',
		'OpenQuok Manus integration'
	],
	heroTitle: 'Schedule social media from Manus then you approve',
	heroDescription:
		'Manus turns ideas into finished work with Skills and optional Cloud Computers. Add the openquok-core skill so Manus drafts and schedules social posts from chat or Studio. You review and approve on the calendar or kanban.',
	docsPath: '/docs/agent-setup-guides/manus',
	skillInstallOptions: MANUS_SKILL_INSTALL_OPTIONS,
	workflowSection: {
		subtitle: 'Your Manus project',
		title: 'Chat in Manus, keep skills portable',
		description:
			'Ask Manus to draft and schedule like any other task. The openquok-core skill runs openquok in your Cloud Computer or local shell. It finds connected channels, attaches media, and queues drafts. You approve on the calendar before anything publishes.',
		deviceMock: 'desktop',
		deviceMockContent: 'agent-parallel-schedule',
		imageAlt: 'Manus desktop chat scheduling social posts via OpenQuok'
	},
	audienceSubtitle: 'Built for Manus users',
	audienceTitle: 'Who connects Manus to OpenQuok?',
	audienceCards: [
		{
			iconName: icons.CustomizedDrawnClapperboard.name,
			iconClass: 'text-zinc-400',
			title: 'Video and launch creators',
			description:
				'You finish product ads, tutorials, or motion graphics in Manus Video Editor or Alchemy mode. Export from Studio, then ask Manus to draft launch posts with openquok-core in the same project.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			iconClass: 'text-neutral-300',
			title: 'Game and interactive builders',
			description:
				'You ship playable games in Game Dev and host multiplayer on a Cloud Computer. When you publish a link or ship an update, Manus can queue social drafts — you still approve on OpenQuok.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CalendarClock.name,
			iconClass: 'text-stone-400',
			title: 'Automation operators',
			description:
				'You use Manus Automations when email, ads, Slack, Notion, or calendar events fire. Add openquok-core so triggered runs can draft or schedule posts without a separate dashboard.',
			containerClass: 'h-full min-h-[18rem]'
		}
	],
	setupStepsSubtitle: 'How it works',
	setupStepsTitle: 'Five steps,to Manus + OpenQuok',
	setupSteps: [
		{
			id: 1,
			title: '1. Open Manus',
			content:
				'Sign in at manus.im or install Manus Studio on desktop. Create a project when you need a Cloud Computer or long-running workspace.',
			mediaAlt: 'Manus Skills documentation at help.manus.im',
			deviceMock: 'safari',
			deviceMockContent: 'manus-docs-overview',
			mockUrl: 'help.manus.im',
			iconName: icons.Terminal.name
		},
		{
			id: 2,
			title: '2. Add the openquok-core skill',
			content:
				'Open the Skills tab, choose + Add, then Import from GitHub or Upload a skill. Point GitHub at the public openquok-core folder or upload a SKILL.md package.',
			animatedContent: 'llm-models',
			mediaAlt: 'Import openquok-core into Manus Skills',
			iconName: icons.Sparkles.name
		},
		{
			id: 3,
			title: '3. Chat or automate',
			content:
				'Type / in chat to pick openquok-core, or wire an Automation when an external event should start scheduling work.',
			mediaAlt: 'Manus desktop chat for scheduling requests',
			deviceMock: 'desktop',
			deviceMockContent: 'agent-parallel-schedule',
			iconName: icons.MessageCircle.name
		},
		{
			id: 4,
			title: '4. Install CLI on the Cloud Computer',
			content:
				'When Manus runs a shell for you, install @openquok/auto-cli globally and authenticate once. The skill instructions call the same commands.',
			mediaAlt: 'Install openquok-core skill and authenticate the OpenQuok CLI',
			deviceMock: 'terminal',
			deviceMockContent: 'openquok-skill-install-manus',
			iconName: icons.OpenQuok.name
		},
		{
			id: 5,
			title: '5. Integrate other skills or connectors',
			content:
				'Add Bloom, RevenueCat, or any other skill beside openquok-core. Use connectors only when you need them — CLI-first for scheduling.',
			animatedContent: 'agent-integrations',
			mediaAlt: 'Agent skills and integrations with OpenQuok',
			iconName: icons.Sparkles.name
		}
	],
	featureSections: [
		{
			subtitle: 'Connect once',
			title: 'authenticate on the Cloud Computer, pick your workspace, chat from Manus securely',
			description:
				'Choose an OpenQuok workspace, connect with OAuth2 — approve in your browser, and credentials stay on the machine that runs openquok. Ask Manus in chat to draft and schedule without opening another app.',
			deviceMock: 'iphone-15-pro',
			deviceMockContent: 'openquok-login',
			imageAlt: 'Manus chat guiding OpenQuok OAuth device login and workspace authorization',
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
				'Move agent-generated posts from draft to review to scheduled on a kanban board—with the same smart filters as your calendar. Approve quality at scale instead of trusting autopilot.',
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
				'Ask Manus to pull impressions, likes, comments, and shares for any connected channel. Compare performance and schedule more of what already resonates — without opening the dashboard.',
			deviceMock: 'desktop',
			deviceMockContent: 'agent-parallel-analytics',
			imageAlt: 'Manus desktop chat showing OpenQuok platform and post analytics',
			mediaOnRight: true,
			cliCommandsTitle: 'CLI analytics options',
			cliCommands: `# Platform metrics (followers, impressions, engagement)
openquok analytics:platform <integration-uuid> -d 30

# Per-post insights (likes, comments, shares)
openquok analytics:post <post-id> -d 7`
		},
		{
			subtitle: 'Scale what works',
			title: 'when a format hits, scale with parallel Manus sessions',
			description:
				'Spot a winner in analytics, then spin another project or Automation while a second chat queues the next wave — credentials and channels stay scoped per workspace as you scale.',
			parallelMocks: [
				{
					deviceMock: 'desktop',
					deviceMockContent: 'agent-parallel-schedule',
					imageAlt: 'First Manus session scheduling posts in parallel'
				},
				{
					deviceMock: 'desktop',
					deviceMockContent: 'agent-parallel-analytics',
					imageAlt: 'Second Manus session pulling live analytics concurrently'
				},
				{
					deviceMock: 'desktop',
					deviceMockContent: 'agent-parallel-schedule',
					imageAlt: 'Manus desktop chat scheduling posts while another session runs analytics'
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
		withTitle: 'OpenQuok + Manus',
		points: [
			{
				pain: 'Copy posts between your AI chat and a separate scheduling tool',
				feature: 'Ask Manus to draft and schedule from the same project chat'
			},
			{
				pain: 'Siloed API keys and workflows that do not compose with your agent stack',
				feature: 'Credentials stay on the Cloud Computer or shell that runs openquok'
			},
			{
				pain: 'Always-on integrations that bloat agent context',
				feature: 'Skills load on demand — import once, invoke with / when you need scheduling'
			},
			{
				pain: "Locked to one vendor's models or automation layer",
				feature: 'CLI-first openquok-core works beside any other Manus skill or connector'
			},
			{
				pain: 'One-off prompts that forget how you schedule each channel',
				feature: 'SKILL.md keeps channel rules and CLI examples in a portable package'
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
		title: 'Studio, web, mobile, and Skills',
		description:
			'Manus runs across Studio, browser, and mobile apps — import skills once, then invoke openquok-core with / in chat or from Automations:',
		extensionLabel: 'Connectors (optional)'
	},
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'Manus + OpenQuok, answered',
	faqDescription:
		'Manus 2.0, Studio, Video Editor, Game Dev, Automations, Skills, Cloud Computers, OpenQuok approval, and how Manus differs from Cue.',
	faqItems: [
		{
			title: 'What is Manus?',
			description:
				`Manus is an agent platform for turning ideas into deliverables. Manus 2.0 adds Manus Studio, Cascade, optional Cloud Computers, and event-driven Automations — not just chat. See the ${faqLink(publicFaqHref.manusLanding, 'Manus integration')}, ${faqLink(publicFaqHref.manusAgentGuide, 'Manus agent guide')}, and Manus 2.0 overview at https://manus.im/blog/introducing-manus-2-0.`
		},
		{
			title: 'What are Manus Studio, Video Editor, and Game Dev?',
			description:
				'Manus Studio is the shared desktop workspace for documents, code, sites, and creation tools. Video Editor gives you a timeline for short ads, tutorials, and motion-led video — including Alchemy mode for higher-quality first cuts. Game Dev helps you build, edit, and publish playable games, with Cloud Computers for always-on multiplayer. OpenQuok does not replace those tools — openquok-core schedules social posts after your Studio work is ready.'
		},
		{
			title: 'How is Manus different from Cue?',
			description:
				`Manus is the full project platform with Studio, Video Editor, Game Dev, Skills, and Cloud Computers. Cue is a separate early-access app for personal agents with their own email, phone, and computer on phone and desktop. Use this guide for Manus and openquok-core Skills — not for Cue-specific setup.`
		},
		{
			title: 'How do Manus Automations work with OpenQuok?',
			description:
				'Automations start Manus work when something happens in a connected service — not only on a clock. Tell Manus what to watch and what to do; include openquok-core when the workflow should draft or schedule social posts. The CLI still writes drafts to your OpenQuok workspace — you approve on the calendar or kanban before anything publishes.'
		},
		{
			title: 'How do I install the openquok-core skill in Manus?',
			description:
				`Open Skills → + Add → Import from GitHub or Upload a skill. Import the public openquok-core folder, or download SKILL.md and upload it. See the ${faqLink(publicFaqHref.manusAgentGuide, 'Manus agent guide')}.`
		},
		{
			title: 'Where do OpenQuok credentials live?',
			description:
				`The global CLI and auth files live on the Cloud Computer or local shell where Manus runs openquok — not in ordinary chat. Use OAuth device flow or a programmatic opo_ token on that machine. See ${faqLink(publicFaqHref.oauthApps, 'OAuth2 for apps')} and ${faqLink(publicFaqHref.publicApi, 'Public API')} docs for token setup.`
		},
		{
			title: 'What can Manus do with OpenQuok?',
			description:
				`Draft and schedule posts, upload media, configure plugs, and pull analytics across your connected channels. See ${faqLink(publicFaqHref.channels, 'supported channels')} and ${faqLink(publicFaqHref.cliManagingPosts, 'CLI post commands')}; openquok-core returns structured JSON for the agent.`
		},
		{
			title: 'Which social media platforms are supported?',
			description:
				`Facebook, Instagram, Threads, YouTube, TikTok, LinkedIn, and X are supported today. Connect channels in the OpenQuok web app or follow the ${faqLink(publicFaqHref.socialIntegration, 'channel setup guides')}; see every network on ${faqLink(publicFaqHref.channels, 'Supported channels')}. Manus uses integration UUIDs from openquok integrations:list to target the right accounts.`
		},
		{
			title: 'Does Manus publish immediately or wait for approval?',
			description:
				'Posts created through the CLI land in your OpenQuok workspace as drafts or scheduled items. You review on the calendar or kanban, move posts through draft and review, and approve what should publish.'
		},
		{
			title: 'Why use Manus with CLI instead of MCP-only?',
			description:
				`openquok-core is CLI-first for repeatable Manus Skills on a Cloud Computer. MCP fits ad hoc editor tools — see ${faqLink(publicFaqHref.cursorLanding, 'OpenQuok for Cursor')} or ${faqLink(publicFaqHref.mcpSetupGuides, 'MCP setup')}. Many teams use both.`
		},
		{
			title: 'Is it free to start?',
			description:
				`OpenQuok offers a 7-day free trial for scheduling on ${faqLink(publicFaqHref.pricing, 'Pricing')}. Manus plan limits are on the Manus site. Import openquok-core, authenticate once, and begin scheduling from chat.`
		}
	]
} satisfies PublicAgentHostLandingPageViewModel;
