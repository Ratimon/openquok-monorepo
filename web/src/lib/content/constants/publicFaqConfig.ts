import { getRootPathPublicAgents, getRootPathPublicAgent } from '$lib/area-public/constants/getRootPathPublicAgents';
import { getRootPathPublicBlogPost } from '$lib/area-public/constants/getRootPathPublicBlog';
import { getRootPathPublicChannels } from '$lib/area-public/constants/getRootPathPublicChannels';
import { getRootPathPublicCompare, getRootPathPublicComparePair } from '$lib/area-public/constants/getRootPathPublicCompare';
import {
	getRootPathPublicDocs,
	getRootPathPublicDocsInstallationDockerCompose
} from '$lib/area-public/constants/getRootPathPublicDocs';
import { route } from '$lib/utils/path';

export type PublicFaqItem = {
	title: string;
	description: string;
};

/** First-party GitHub repo (followable). Keep in sync with `docsSite.social.github`. */
export const OPENQUOK_GITHUB_REPO_HREF = 'https://github.com/Ratimon/openquok-monorepo';

const hrefDocs = (slug: string) => route(`${getRootPathPublicDocs()}/${slug}`);
const hrefPricing = route('pricing');
const hrefChannels = route(getRootPathPublicChannels());
const hrefAgents = route(getRootPathPublicAgents());
const hrefCompare = route(getRootPathPublicCompare());
const hrefCompareBuffer = route(getRootPathPublicComparePair('openquok', 'buffer'));
const hrefDockerCompose = route(getRootPathPublicDocsInstallationDockerCompose());
const hrefCliGettingStarted = hrefDocs('getting-started-for-cli');
const hrefCliManagingPosts = hrefDocs('cli-usages/managing-posts');
const hrefCliAnalytics = hrefDocs('cli-usages/analytics');
const hrefAgentSetupGuides = hrefDocs('agent-setup-guides');
const hrefGrokBotAgentGuide = hrefDocs('agent-setup-guides/grok-bot');
const hrefThinkrailAgentGuide = hrefDocs('agent-setup-guides/thinkrail');
const hrefMcpSetupGuides = hrefDocs('mcp-setup-guides');
const hrefMcpGettingStarted = hrefDocs('getting-started-for-mcp');
const hrefPublicApi = hrefDocs('getting-started-for-public-api');
const hrefOauthApps = hrefDocs('oauth2-for-apps');
const hrefSocialIntegration = hrefDocs('social-integration');
const hrefChannelGroups = hrefDocs('apis-integrations/groups');
const hrefCliThreads = hrefDocs('cli-examples/threads');
const hrefCliX = hrefDocs('cli-examples/x');
const hrefGrokBotLanding = route(getRootPathPublicAgent('grok-bot'));
const hrefThinkrailLanding = route(getRootPathPublicAgent('thinkrail'));
const hrefCursorLanding = route(getRootPathPublicAgent('cursor'));
const hrefCursorMcpGuide = hrefDocs('mcp-setup-guides/cursor');
const hrefBlogBufferAlternatives = route(
	getRootPathPublicBlogPost('best-buffer-alternatives-for-teams-that-approve-ai-content-before-posting')
);
const hrefBlogSelfHost = route(
	getRootPathPublicBlogPost('how-to-self-host-openquok-with-cli-device-login-free-no-api-keys-on-your-agent')
);
const hrefBlogGrokBot = route(
	getRootPathPublicBlogPost('schedule-social-posts-from-grok-bot-with-openquok')
);
const hrefBlogThinkrail = route(
	getRootPathPublicBlogPost('schedule-social-posts-from-thinkrail-with-openquok')
);

function faqA(href: string, label: string): string {
	return `<a href="${href}">${label}</a>`;
}

/** Default Q&A copy when `public_faq.ITEMS` is missing from stored config. */
export const PUBLIC_FAQ_ITEMS: readonly PublicFaqItem[] = [
	{
		title: 'Why switch from Buffer or Hootsuite?',
		description:
			`Buffer and Hootsuite charge $75–$200/month for enterprise feature most teams never use. OpenQuok covers the same UI scheduling basics including connect channels, compose, calendar, multi-channel publish. We also cover agent-first features like workspaces, integrations, and API/CLI access. Same workflow when you post by hand; built for when agents do the work. Less cost, less clutter, and real support from Meta and OpenQuok team. See ${faqA(hrefCompareBuffer, 'OpenQuok vs Buffer')} and the ${faqA(hrefBlogBufferAlternatives, 'Buffer alternatives guide')}.`
	},
	{
		title: 'Can I try OpenQuok for free?',
		description:
			`Yes. OpenQuok offers a 7-day free trial so you can schedule social media posts across your connected channels before you choose a plan. Create an account and start today — no credit card required to explore the scheduler. Plan limits are on ${faqA(hrefPricing, 'Pricing')}.`
	},
	{
		title: 'How do I schedule social media posts with OpenQuok?',
		description:
			`Connect your channels, compose or import a draft, pick a date and time on the calendar (or kanban), and publish. You can schedule social media posts by hand, from reusable templates, or pipe drafts in from AI agents — then review everything before it goes live. Agents follow the ${faqA(hrefCliGettingStarted, 'CLI getting started')} guide. For Grok Bot, see the ${faqA(hrefGrokBotLanding, 'Grok Bot integration')}, ${faqA(hrefGrokBotAgentGuide, 'setup guide')}, or ${faqA(hrefBlogGrokBot, 'scheduling walkthrough')}. For ThinkRail, see the ${faqA(hrefThinkrailLanding, 'ThinkRail integration')}, ${faqA(hrefThinkrailAgentGuide, 'setup guide')}, or ${faqA(hrefBlogThinkrail, 'ThinkRail walkthrough')}. For Cursor MCP in your editor, see ${faqA(hrefCursorLanding, 'OpenQuok for Cursor')} and the ${faqA(hrefCursorMcpGuide, 'MCP setup guide')}.`
	},
	{
		title: 'Can I self-host OpenQuok?',
		description:
			`Yes. OpenQuok is ${faqA(OPENQUOK_GITHUB_REPO_HREF, 'open source on GitHub')}, so you can run it on your own infrastructure (eg. AWS, GCP, Hezner, or even vercel) and manage limits locally without needing a subscription. Follow the ${faqA(hrefDockerCompose, 'Docker Compose self-host guide')} or the ${faqA(hrefBlogSelfHost, 'CLI device-login self-host walkthrough')}.`
	},
	{
		title: 'What is the agent workspace?',
		description:
			`An agent workspace is where you connect channels, schedule posts, and collaborate. Workspaces exist to keep agent and automation context focused. Too many channels or tasks in one place can cause context rot or hallucinations. Use separate workspaces for different brands or clients when things get crowded. Workspace limits are on ${faqA(hrefPricing, 'Pricing')}; agent hosts live under ${faqA(hrefAgents, 'Agents')}.`
	},
	{
		title: "Why should I use OpenQuok's multi-workspace?",
		description:
			`Most schedulers treat one account as one pile of channels — fine at first, risky when you add clients, brands, or agents. OpenQuok gives each workspace its own channels, OAuth app, programmatic token, and MCP endpoint so credentials and drafts never cross wires. Spin up a workspace per client or brand when a format wins, run parallel sessions inside each, and scale volume without an agent posting to the wrong Page or mixing analytics. It is the safeguard Buffer and Hootsuite do not ship for agent-driven workflows. See ${faqA(hrefPricing, 'plan workspace counts')} and ${faqA(hrefCompare, 'how we compare')}.`
	},
	{
		title: 'What do OAuth app counts on pricing plans mean?',
		description:
			`Each workspace includes one OAuth application. The totals on ${faqA(hrefPricing, 'pricing plans')} match your workspace limit — for example, Solo includes 1 OAuth app (1 workspace), Team includes 3, Ultimate includes 5, and Max includes 10. Register the app under Developers → Apps to get client credentials for third-party OAuth flows. See ${faqA(hrefOauthApps, 'OAuth2 for apps')}.\n\nIf you need separate apps for different products, clients, or redirect URLs — such as one integration built with our SDK and another product with its own OAuth consent screen — create an additional workspace and register one app there. Each workspace keeps its own channels, credentials, and tokens isolated.\n\nWithin one workspace, that single OAuth app also backs your workspace programmatic token (opo_…) for the ${faqA(hrefPublicApi, 'Public API')}, SDK, CI scripts, and MCP.`
	},
	{
		title: 'What are Unlimited AI Writer and AI Summarizer?',
		description:
			'Unlimited AI Writer and Unlimited AI Summarizer are experimental, on-device features that run in supported Chromium browsers. Post drafting stays on your device. Writer and rewrite flows use the Writer API (<a href="https://developer.chrome.com/docs/ai/writer-api">https://developer.chrome.com/docs/ai/writer-api</a>) and Rewriter API (<a href="https://developer.chrome.com/docs/ai/rewriter-api">https://developer.chrome.com/docs/ai/rewriter-api</a>); summarization uses the Summarizer API, including techniques for longer text described in Scale client-side summarization (<a href="https://developer.chrome.com/docs/ai/scale-summarization">https://developer.chrome.com/docs/ai/scale-summarization</a>). Availability depends on browser support, hardware, and Chrome’s origin-trial status, and the APIs may change as the experiments evolve.'
	},
	{
		title: 'Can I get a refund?',
		description:
			'With in 1 month, you can get a refund if you have not used the product during a billing period. If you have used the product during a billing period, contact support and we will work with you on a fair resolution. Self-hosted deployments follow your own billing policies.'
	},
	{
		title: 'Can I change plans later?',
		description:
			`Yes. Upgrade or downgrade from account billing settings. Proration and timing follow your Stripe subscription when cloud billing is enabled. Current tiers are on ${faqA(hrefPricing, 'Pricing')}.`
	},
	{
		title: 'How do I pay for agent hosts vs MCP clients?',
		description:
			`OpenQuok and your LLM are billed separately. OpenQuok covers workspaces, channels, and scheduling. Agent hosts and MCP clients are your AI layer: OpenClaw, Hermes, and ${faqA(hrefThinkrailLanding, 'ThinkRail')} are open source; ${faqA(hrefGrokBotLanding, 'Grok Bot')} requires eligible SuperGrok or Cursor plans; ${faqA(hrefCursorLanding, 'Cursor')} (editor MCP), Claude Code, and Codex bill through their own subscriptions. See ${faqA(hrefAgentSetupGuides, 'agent setup guides')} and ${faqA(hrefMcpSetupGuides, 'MCP setup guides')}. OpenQuok MCP only needs your programmatic token.`
	},
	{
		title: 'What is MCP and how does OpenQuok use it?',
		description:
			`MCP (Model Context Protocol) is how AI assistants plug into the apps you use. Connect OpenQuok once in ${faqA(hrefCursorLanding, 'Cursor')}, Claude Code, Codex, or another MCP client and your agent can manage your social presence — list channels, read platform rules, and schedule posts — without opening the dashboard or copy-pasting between tools. For always-on desktop teammates with the openquok-core skill, see ${faqA(hrefGrokBotLanding, 'Grok Bot + OpenQuok')}. For a worktree IDE around the pi coding agent, see ${faqA(hrefThinkrailLanding, 'ThinkRail + OpenQuok')}. Ask in plain language, e.g. “Schedule a post to X for tomorrow at 10am.” Start with ${faqA(hrefMcpGettingStarted, 'MCP getting started')} or a client-specific ${faqA(hrefMcpSetupGuides, 'MCP setup guide')}.`
	},
	{
		title: 'How does MCP relate to my OAuth app?',
		description:
			`Each workspace has one MCP server. It uses the same programmatic token (opo_…) as ${faqA(hrefPublicApi, 'Public API')} and SDK — issued from that workspace’s single OAuth app. Setup: Developers → Apps (create OAuth app) → Access (generate token, copy MCP client config). See ${faqA(hrefOauthApps, 'OAuth2 for apps')} and ${faqA(hrefMcpSetupGuides, 'MCP setup')}. Multi-workspace plans get one MCP endpoint per workspace; switch workspace to manage credentials separately.`
	},
	{
		title: 'What counts as a channel?',
		description:
			`A channel is a connected social account (for example Facebook, Instagram, LinkedIn, TikTok, YouTube, Reddit, Threads, or Pinterest). You schedule posts to the channels you connect. See every network on ${faqA(hrefChannels, 'Supported channels')} and the ${faqA(hrefSocialIntegration, 'channel setup guides')}.`
	},
	{
		title: 'Can I connect 2 channels to the same platform?',
		description:
			`Yes. Example: SOLO plan can connect 15 total accounts, all of them can be tiktok accounts. Totals are on ${faqA(hrefPricing, 'Pricing')}.`
	},
	{
		title: 'How does team member work?',
		description:
			`Team members are people you invite to a workspace. They can collaborate on content and connect their own channels where your plan allows. Seat limits are shown as invites plus you as owner. For example, “2 + 1 (you) per workspace” means four invited members and one seat for you on each workspace you own. Seat counts are listed on ${faqA(hrefPricing, 'Pricing')}.`
	},
	{
		title: 'Will my post get less reach or banned if I use multi-channel publishing with OpenQuok?',
		description:
			`No ! We use the official API for each platform. Your posts should perform the same as if you published them directly on each platform. We had the same concern that algorithms might favor in-app posting, but in our own tests we did not see lower reach when scheduling through OpenQuok. Connect via the ${faqA(hrefSocialIntegration, 'official channel setup guides')}.`
	},
	{
		title: 'How does repeated posts work',
		description:
			`Repeated posts let you automatically republish evergreen content on a schedule (daily, weekly, or a custom cadence). It’s a great way to keep promoting ongoing offers, quotes, or other timeless content without manually rescheduling. Agents can also queue repeats from ${faqA(hrefCliManagingPosts, 'CLI post commands')}.`
	},
	{
		title: 'What are reusable templates and how does it work?',
		description:
			'Templates are pre-defined groups of channels with custom message templates. If you frequently post to the same combination of accounts (e.g., your personal X + company LinkedIn + Facebook page), you can save it as a Set for one-click posting.'
	},
	{
		title: 'What are reusable signatures and how does it work?',
		description:
			'Signatures are snippets of text you can automatically append to posts (hashtags, links, promos). If you often use the same call-to-action or signature across multiple posts, save it once and reuse it everywhere.'
	},
	{
		title: 'What analytics does OpenQuok offer?',
		description:
			`Get detailed analytics across connected platforms—impressions, likes, comments, shares, bookmarks, and engagement rate—so you can track results over time and see what content resonates most. Pull the same metrics from the ${faqA(hrefCliAnalytics, 'analytics CLI')} or ask an agent after ${faqA(hrefMcpSetupGuides, 'MCP setup')}.`
	},
	{
		title: 'Can I schedule comments or threads',
		description:
			`Yes. You can schedule follow-up comments to help drive engagement. On platforms like X and Threads, you can also schedule full threads, while on LinkedIn and Facebook scheduled comments are posted as replies to your main post. See ${faqA(hrefCliX, 'X CLI examples')} and ${faqA(hrefCliThreads, 'Threads CLI examples')}.`
	},
	{
		title: 'What is the delay feature between posts?',
		description:
			'Use the delay feature to add time gaps between posts and scheduled comments for a more natural publishing cadence—space them out by minutes or hours instead of posting everything at once.'
	},
	{
		title: 'I have connnected too many channels, what should I do?',
		description:
			`The Group management feature let you organize connected channels by client, brand, or any structure you like—making it simple to manage multiple clients or keep personal and business accounts separate. This can be selected to create post later or used by smart filters. Programmatic group lists are in ${faqA(hrefChannelGroups, 'channel groups API')} docs.`
	}
];

export type PublicFaqConfigItem = {
	question: string;
	answer: string;
};

export function getDefaultPublicFaqConfigItems(): PublicFaqConfigItem[] {
	return PUBLIC_FAQ_ITEMS.map(({ title, description }) => ({
		question: title,
		answer: description
	}));
}
