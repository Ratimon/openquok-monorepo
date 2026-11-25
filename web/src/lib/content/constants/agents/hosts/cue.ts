import { icons } from '$data/icons';

import type { PublicAgentHostLandingPageViewModel } from '$lib/content/constants/agents/types';
import { faqLink, publicFaqHref } from '$lib/content/utils/publicFaqLinks';
import {
	CUE_SKILL_INSTALL_OPTIONS,
	OPENQUOK_CLI_COMMAND_REFERENCE
} from '$lib/content/constants/agents/cli-command-reference';
import { PUBLIC_AGENT_OPPORTUNITIES_PREVIEW_SECTION } from '$lib/content/constants/agents/general';
import {
	buildPublishApprovalFaqAnswer,
	COMPARISON_PUBLISH_CHOICE_FEATURE,
	WORKFLOW_PUBLISH_CHOICE_SENTENCE
} from '$lib/content/constants/schedulingPublishChoice';

const TIKTOK_LOW_VIEWS_BLOG_HREF = '/blog/why-my-tiktok-videos-have-low-views-and-what-to-fix-first';

export const cueAgent = {
	pageType: 'agent-host',
	slug: 'cue',
	agentId: 'cue',
	agentLabel: 'Cue',
	icon: icons.Cue.name,
	available: true,
	metaTitle: 'Cue Social Scheduling — openquok-core Skill & Official Platform APIs',
	metaDescription:
		'Install openquok-core on your Cue cloud or paired computer. Schedule TikTok, Instagram, X, and more through official platform APIs. You approve every post on OpenQuok — not Cue agent social graph posts.',
	hubDescription:
		'Cue gives your agent its own identity and computer. Add openquok-core with Cue CLI so your Cue drafts and schedules real social channels. You approve on OpenQuok.',
	keywords: [
		'Cue social media',
		'Cue OS scheduling',
		'Cue openquok-core skill',
		'Cue CLI social posts',
		'Cue vs Manus scheduling',
		'Cue agent computer OpenQuok',
		'official API social scheduling',
		'open source social scheduler Cue',
		'Cue TikTok Instagram schedule',
		'OpenQuok Cue integration'
	],
	heroTitle: 'Schedule TikTok, Instagram, and X from Cue then you approve',
	heroDescription:
		'Your Cue can plan dinner and post among its contacts — but brand channels belong on official platform APIs. Add openquok-core on the Cue computer, connect channels in OpenQuok, and let your Cue queue drafts. You review on the calendar or kanban.',
	docsPath: '/docs/agent-setup-guides/cue',
	skillInstallOptions: CUE_SKILL_INSTALL_OPTIONS,
	workflowSection: {
		subtitle: 'Your personal agent',
		title: 'Chat with Cue, publish on real networks',
		description:
			`Ask Cue to draft and schedule like any other task. The openquok-core skill runs openquok on the cloud or paired computer. It uses connected channel UUIDs, attaches media, and queues posts through official APIs. ${WORKFLOW_PUBLISH_CHOICE_SENTENCE}`,
		deviceMock: 'desktop',
		deviceMockContent: 'agent-parallel-schedule',
		imageAlt: 'Cue chat scheduling social posts on TikTok and Instagram via OpenQuok'
	},
	audienceSubtitle: 'Built for Cue users',
	audienceTitle: 'Who connects Cue to OpenQuok?',
	audienceCards: [
		{
			iconName: icons.Phone.name,
			iconClass: 'text-zinc-400',
			title: 'Early-access personal agents',
			description:
				'You gave your Cue its own email, phone, and computer. Extend it to brand channels without browser hacks.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			iconClass: 'text-neutral-300',
			title: 'Cue CLI operators',
			description:
				'Pair your Mac, Linux, or WSL computer. Install skills once — every agent on that machine can call openquok.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.ShieldCheck.name,
			iconClass: 'text-stone-400',
			title: 'Creators who fear platform bans',
			description:
				'Official APIs and human approval reduce shadowbans and account locks that come from unofficial posting.',
			containerClass: 'h-full min-h-[18rem]'
		}
	],
	setupStepsSubtitle: 'How it works',
	setupStepsTitle: 'Five steps,to Cue + OpenQuok',
	setupSteps: [
		{
			id: 1,
			title: '1. Open Cue OS',
			content:
				'Sign in at cueos.ai on web or mobile. Create or choose your Cue. Open Agent info → Computer and pick a cloud computer or Your computer with Cue CLI pairing.',
			mediaAlt: 'Cue OS docs — agent computer and skills',
			deviceMock: 'safari',
			deviceMockContent: 'cue-docs-overview',
			mockUrl: 'docs.cueos.ai',
			iconName: icons.Terminal.name
		},
		{
			id: 2,
			title: '2. Install openquok-core',
			content:
				'On the agent computer, fetch SKILL.md into a folder and run cue skill install. Read the skill with cue skill read before you run it.',
			animatedContent: 'llm-models',
			mediaAlt: 'Install openquok-core with Cue CLI',
			iconName: icons.Sparkles.name
		},
		{
			id: 3,
			title: '3. Ask Cue to schedule',
			content:
				'Message your Cue to draft launch posts or pull analytics. The skill instructions call the same openquok commands you would run in a terminal.',
			mediaAlt: 'Cue chat for scheduling requests',
			deviceMock: 'desktop',
			deviceMockContent: 'agent-parallel-schedule',
			iconName: icons.MessageCircle.name
		},
		{
			id: 4,
			title: '4. Authenticate the CLI',
			content:
				'Install @openquok/auto-cli on the agent computer and run openquok auth:login once. Tokens stay on that machine — not in ordinary chat.',
			mediaAlt: 'Install openquok CLI and authenticate on the Cue computer',
			deviceMock: 'terminal',
			deviceMockContent: 'openquok-skill-install-cue',
			iconName: icons.OpenQuok.name
		},
		{
			id: 5,
			title: '5. Connect real channels',
			content:
				'Connect TikTok, Instagram, X, and other networks in the OpenQuok workspace. Your Cue uses integration UUIDs — not the Cue agent social graph — for brand publishing.',
			animatedContent: 'agent-integrations',
			mediaAlt: 'Connected channels in OpenQuok for Cue scheduling',
			iconName: icons.Link.name
		}
	],
	featureSections: [
		{
			subtitle: 'Official APIs',
			title: 'publish on TikTok, Instagram, and X the platform-approved way',
			description:
				'OpenQuok connects with OAuth and official posting APIs. You can read the integration code in the open-source repo. That path respects platform terms and avoids the restrictions that come from scripted logins or scrapers.',
			deviceMock: 'iphone-15-pro',
			deviceMockContent: 'openquok-login',
			imageAlt: 'OpenQuok OAuth connect flow for official social channel APIs',
			mediaOnRight: true,
			cliCommandsTitle: 'Verify integrations',
			cliCommands: `openquok integrations:list
openquok integrations:schema <integration-uuid>`
		},
		{
			subtitle: 'Not agent social graph',
			title: 'Cue agent posts stay separate,from brand channel publishing',
			description:
				'Cue can like and comment among its contacts on Cue OS — that is not your company TikTok or Instagram. openquok-core targets the channels you connected in OpenQuok, with drafts you approve before anything goes live.',
			bentoId: 'agent-multi-platform-bulk-scheduling',
			mediaOnRight: false,
			cliCommandsTitle: 'Queue for review',
			cliCommands: `openquok posts:create -c "…" -s "…" -t draft -i "<uuid>"
openquok posts:status <post-id> -s schedule`
		},
		{
			subtitle: 'Kanban + smart filters',
			title: 'Review every AI draft, sign off confidently, before it goes live',
			description:
				'Move agent-generated posts from draft to review to scheduled on a kanban board—with the same smart filters as your calendar. Approve quality at scale instead of trusting autopilot.',
			deviceMock: 'desktop',
			deviceMockContent: 'agent-parallel-analytics',
			imageAlt: 'Cue session pulling OpenQuok analytics for connected channels',
			mediaOnRight: true,
			cliCommandsTitle: 'CLI analytics options',
			cliCommands: `openquok analytics:platform <integration-uuid> -d 30
openquok analytics:post <post-id> -d 7`
		},
		{
			subtitle: 'Scale what works',
			title: 'when a format hits, ask Cue to queue the next wave',
			description:
				'Spot a winner in analytics, then message Cue while your computer stays paired. Credentials stay scoped per workspace as you schedule more of what already resonates.',
			parallelMocks: [
				{
					deviceMock: 'desktop',
					deviceMockContent: 'agent-parallel-schedule',
					imageAlt: 'Cue scheduling the next batch of posts'
				},
				{
					deviceMock: 'desktop',
					deviceMockContent: 'agent-parallel-analytics',
					imageAlt: 'Cue pulling platform metrics in parallel'
				},
				{
					deviceMock: 'iphone-15-pro',
					deviceMockContent: 'openquok-login',
					imageAlt: 'Approve OAuth or posts from phone while Cue works'
				}
			],
			mediaOnRight: false,
			cliCommandsTitle: 'Parallel CLI sessions',
			cliCommands: `# Draft launch post
openquok posts:create -c "…" -s "…" -t draft -i "<uuid>"
openquok posts:status <post-id> -s schedule

openquok posts:list --status draft`
		}
	],
	opportunitiesPreviewSection: PUBLIC_AGENT_OPPORTUNITIES_PREVIEW_SECTION,
	comparisonSection: {
		subtitle: 'comparisons',
		title: 'brand channels on official APIs, not another closed social feed',
		description:
			'Cue agent social activity lives on Cue OS. OpenQuok is built for the networks your audience already uses.',
		withoutTitle: 'Unofficial or in-ecosystem posting',
		withTitle: 'OpenQuok + Cue',
		points: [
			{
				pain: 'Your brand account shares passwords or runs a headless browser on the agent computer',
				feature: 'OAuth tokens live in OpenQuok — the Cue skill calls official APIs only'
			},
			{
				pain: 'You cannot audit how posts reach TikTok or Instagram',
				feature: 'OpenQuok is open source — verify the integration paths yourself'
			},
			{
				pain: 'Platform limits or bans after automation that breaks terms',
				feature: `Official APIs and human approval — see our ${faqLink(TIKTOK_LOW_VIEWS_BLOG_HREF, 'TikTok views troubleshooting')} for reach basics`
			},
			{
				pain: 'Agent social graph posts look like brand publishing',
				feature: 'Cue contacts stay on Cue OS — openquok-core schedules your connected channels'
			},
			{
				pain: 'Autopilot publishing with no human checkpoint',
				feature: COMPARISON_PUBLISH_CHOICE_FEATURE
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
		title: 'Web, mobile, cloud computer, and your machine',
		description:
			'Cue runs in chat on phone and desktop. Skills install on the agent computer — cloud or paired with Cue CLI:',
		extensionLabel: 'Routines (optional)'
	},
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'Cue + OpenQuok, answered',
	faqDescription: 'Cue OS, agent social graph, skills, and official platform scheduling',
	faqItems: [
		{
			title: 'What is Cue?',
			description:
				`Cue is a personal agent with its own identity, email, phone, wallet, and computer on Cue OS. You stay in control of contacts, purchases, and visibility. See the ${faqLink(publicFaqHref.cueLanding, 'Cue integration')} and ${faqLink(publicFaqHref.cueAgentGuide, 'Cue agent guide')}.`
		},
		{
			title: 'What is the Cue agent social graph?',
			description:
				`Your Cue can read posts, like, comment, and publish among its Cue contacts — separate from your personal graph. That activity stays on Cue OS. It is not the same as scheduling TikTok, Instagram, X, or YouTube for your brand. See Cue docs on agent social. For brand channels, use openquok-core and the channels you connect in OpenQuok.`
		},
		{
			title: 'Why use OpenQuok instead of Cue social posts for brand channels?',
			description:
				`OpenQuok publishes through each platform's official APIs with OAuth you approve in your workspace. The project is open source — you can verify the integration paths. That approach follows platform terms and reduces ban risk compared with password logins or browser automation. Read ${faqLink(TIKTOK_LOW_VIEWS_BLOG_HREF, 'why TikTok views stay low')} for reach fundamentals after you post the right way.`
		},
		{
			title: 'How is Cue different from Manus?',
			description:
				`Manus is the full project platform with Studio, Video Editor, Game Dev, and Manus Skills. Cue is a personal agent app with its own network on Cue OS. Both can run openquok-core — Manus via Skills import; Cue via cue skill install on the agent computer. See ${faqLink(publicFaqHref.manusLanding, 'Manus integration')} if you use both products.`
		},
		{
			title: 'How do I install the openquok-core skill on Cue?',
			description:
				`Pair a cloud or your computer with Cue CLI, fetch SKILL.md into a folder, then run cue skill install. See the ${faqLink(publicFaqHref.cueAgentGuide, 'Cue agent guide')} for pairing, cue skill doctor, and CLI auth.`
		},
		{
			title: 'Where do OpenQuok credentials live?',
			description:
				`The global CLI and auth files live on the agent computer that runs openquok — not in ordinary chat. Use OAuth device flow or a programmatic opo_ token on that machine. See ${faqLink(publicFaqHref.oauthApps, 'OAuth2 for apps')} and ${faqLink(publicFaqHref.publicApi, 'Public API')} docs.`
		},
		{
			title: 'What can Cue do with OpenQuok?',
			description:
				`Draft and schedule posts, upload media, configure plugs, and pull analytics across your connected channels. See ${faqLink(publicFaqHref.channels, 'supported channels')} and ${faqLink(publicFaqHref.cliManagingPosts, 'CLI post commands')}; openquok-core returns structured JSON for the agent.`
		},
		{
			title: 'Which social media platforms are supported?',
			description:
				`Facebook, Instagram, Threads, YouTube, TikTok, LinkedIn, and X are supported today. ${faqLink(publicFaqHref.signUp, 'Sign up for free')}, open a workspace, and choose Connect channel — see ${faqLink(publicFaqHref.connectChannelsGuide, 'connect channels')}. Your Cue uses integration UUIDs from openquok integrations:list.`
		},
		{
			title: 'Does Cue publish immediately or wait for approval?',
			description: buildPublishApprovalFaqAnswer('Cue')
		},
		{
			title: 'Why use Cue with CLI instead of MCP-only?',
			description:
				`openquok-core is CLI-first on the Cue computer where skills run. MCP fits ad hoc editor tools — see ${faqLink(publicFaqHref.cursorLanding, 'OpenQuok for Cursor')} or ${faqLink(publicFaqHref.mcpSetupGuides, 'MCP setup')}. Many teams use both.`
		},
		{
			title: 'Is it free to start?',
			description:
				`OpenQuok offers a 7-day free trial for scheduling on ${faqLink(publicFaqHref.pricing, 'Pricing')}. Cue OS access is on the Cue site. Install openquok-core, authenticate once, and begin scheduling from chat.`
		}
	]
} satisfies PublicAgentHostLandingPageViewModel;