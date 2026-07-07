import type { PaidSubscriptionTier } from 'openquok-common';
import {
	accountTeamMemberSeatTotal,
	isUnlimitedTeamMembersPerWorkspace,
	planLimitsForTier
} from 'openquok-common';

import { formatPostsPerMonthLimit } from '$lib/billing/Billing.repository.svelte';
import { formatTeamMembersPerWorkspaceDisplay } from '$lib/billing/GetBilling.presenter.svelte';
import {
	PUBLIC_PRICING_COMPARE_ROWS,
	PUBLIC_PRICING_PLAN_META,
	PUBLIC_PRICING_TIER_ORDER,
	type PublicPricingCompareRowId
} from '$lib/billing/constants/publicPricingCatalog';
import type { PublicAgentComparisonSection } from '$lib/content/constants/publicAgentConfig';
import { listAvailablePublicChannels } from '$lib/content/constants/publicChannelConfig';
import { PUBLIC_FAQ_ITEMS, type PublicFaqItem } from '$lib/content/constants/publicFaqConfig';
import { formatBytes } from '$lib/medias';

export type CompareProductSlug = 'openquok' | 'hootsuite';

export type CompareFeatureCell =
	| { kind: 'included' }
	| { kind: 'excluded' }
	| { kind: 'text'; text: string };

export type ComparePricingPlan = {
	name: string;
	/** Monthly price in USD; `null` for custom or contact-sales tiers. */
	monthlyPrice: number | null;
	/** Short line under the plan name (e.g. tagline or audience). */
	tagline: string;
	/** Price footnote (e.g. per-user billing or trial copy). */
	footnote?: string;
};

export type CompareProduct = {
	slug: CompareProductSlug;
	name: string;
	tagline: string;
	overview: string;
	pricingPlans: ComparePricingPlan[];
	channels: string[];
	featureSupport: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>>;
};

export type PublicFaqItemId =
	| 'switch-from-buffer-hootsuite'
	| 'try-free'
	| 'multi-workspace';

export type ComparePair = {
	productASlug: 'openquok';
	productBSlug: CompareProductSlug;
	metaTitle: string;
	metaDescription: string;
	keywords: string[];
	heroTitle: string;
	heroDescription: string;
	withWithoutSection: PublicAgentComparisonSection;
	faqItemIds?: PublicFaqItemId[];
};

export type CompareHubPairViewModel = {
	productASlug: 'openquok';
	competitorSlug: CompareProductSlug;
	competitorName: string;
};

const OPENQUOK_CHANNELS = listAvailablePublicChannels().map((channel) => channel.platformLabel);

const OPENQUOK_PRICING_PLANS: ComparePricingPlan[] = PUBLIC_PRICING_TIER_ORDER.map((tier) => {
	const limits = planLimitsForTier(tier);
	const meta = PUBLIC_PRICING_PLAN_META[tier];
	return {
		name: tierDisplayNameForCompare(tier),
		monthlyPrice: limits.month_price,
		tagline: meta.tagline,
		footnote: tier === 'SOLO' ? '7-day free trial · no credit card required' : undefined
	};
});

const HOOTSUITE_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Standard',
		monthlyPrice: 199,
		tagline: 'Best for small teams that need publishing and engagement basics',
		footnote: 'Per user / month (annual billing)'
	},
	{
		name: 'Advanced',
		monthlyPrice: 399,
		tagline: 'Best for growing teams that need analytics, inbox, and approvals',
		footnote: 'Per user / month (annual billing)'
	},
	{
		name: 'Enterprise',
		monthlyPrice: null,
		tagline: 'Best for large organizations with custom security and governance needs',
		footnote: 'Custom pricing — contact sales'
	}
];

const HOOTSUITE_CHANNELS = [
	'Facebook',
	'Instagram',
	'LinkedIn',
	'X',
	'TikTok',
	'YouTube',
	'Pinterest',
	'Threads',
	'Bluesky',
	'Google Business Profile',
	'WhatsApp'
];

const OPENQUOK_WITH_HOOTSUITE_COMPARISON: PublicAgentComparisonSection = {
	subtitle: 'comparisons',
	title: 'agent-native scheduling, not another enterprise dashboard',
	description:
		'Hootsuite is built for marketing teams in a browser. OpenQuok covers the same scheduling basics — and adds workspaces, agents, and API access when automation does the work.',
	withoutTitle: 'Typical Hootsuite workflow',
	withTitle: 'OpenQuok',
	points: [
		{
			pain: 'Copy drafts between your AI assistant and a separate scheduling tab',
			feature: 'Agents draft and schedule via skills, MCP, or the Public API — you approve on the calendar'
		},
		{
			pain: 'Per-seat pricing that climbs as you add collaborators',
			feature: 'Flat workspace pricing from $29/mo — team seats scale with your plan, not per user'
		},
		{
			pain: 'One account pile for every brand, client, and channel',
			feature:
				'Agent workspaces isolate channels, OAuth apps, tokens, and MCP endpoints per brand or client'
		},
		{
			pain: 'Enterprise bundles with listening and ads you may never use',
			feature:
				'Focused scheduling, analytics, and agent integrations — pay for what you publish, not unused suites'
		},
		{
			pain: 'No first-class path for Cursor, Claude Code, or terminal workflows',
			feature: 'MCP server and CLI per workspace — connect agents without copy-pasting between tools'
		},
		{
			pain: 'Autopilot publishing with limited human checkpoints',
			feature: 'Every agent draft lands as draft or scheduled — you approve before anything goes live'
		}
	]
};

function tierDisplayNameForCompare(tier: PaidSubscriptionTier): string {
	if (tier === 'SOLO') return 'Solo';
	if (tier === 'TEAM') return 'Team';
	if (tier === 'ULTIMATE') return 'Ultimate';
	if (tier === 'MAX') return '10x Max';
	return tier;
}

function totalChannels(workspaces: number, channelPerWorkspace: number): number {
	return Math.max(0, workspaces) * Math.max(0, channelPerWorkspace);
}

function buildOpenQuokFeatureSupport(): Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> {
	const solo = planLimitsForTier('SOLO');
	const max = planLimitsForTier('MAX');
	const soloChannels = totalChannels(solo.workspaces, solo.channel_per_workspace);
	const maxChannels = totalChannels(max.workspaces, max.channel_per_workspace);
	const soloStorage = formatBytes(solo.media_storage_bytes_per_workspace * solo.workspaces);
	const maxStorage = formatBytes(max.media_storage_bytes_per_workspace * max.workspaces);
	const soloPosts = formatPostsPerMonthLimit(solo.posts_per_month);
	const maxPosts = formatPostsPerMonthLimit(max.posts_per_month);

	const support: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
		workspaces: {
			kind: 'text',
			text: solo.workspaces === max.workspaces ? String(max.workspaces) : `${solo.workspaces}–${max.workspaces}`
		},
		channels: {
			kind: 'text',
			text:
				soloChannels === maxChannels
					? String(maxChannels)
					: `${soloChannels}–${maxChannels} (${solo.channel_per_workspace}–${max.channel_per_workspace}/ workspace)`
		},
		posts_per_month: {
			kind: 'text',
			text: soloPosts === maxPosts ? maxPosts : `${soloPosts}–${maxPosts}`
		},
		team_members: {
			kind: 'text',
			text: buildOpenQuokTeamMembersCell(solo, max)
		},
		share_post_preview: solo.share_post_preview
			? { kind: 'included' }
			: { kind: 'text', text: 'Team plan+' },
		public_api: { kind: 'included' },
		oauth_apps: { kind: 'text', text: '1 per workspace' },
		mcp_server: { kind: 'text', text: '1 per workspace' },
		cloud_storage: {
			kind: 'text',
			text:
				soloStorage === maxStorage
					? maxStorage
					: `${soloStorage}–${maxStorage} (${formatBytes(solo.media_storage_bytes_per_workspace)}–${formatBytes(max.media_storage_bytes_per_workspace)}/ workspace)`
		},
		multi_channel_publishing: { kind: 'included' },
		agent_integrations: { kind: 'included' },
		analytics: { kind: 'included' },
		photo_editor: { kind: 'included' },
		calendar_views: { kind: 'included' },
		kanban_views: { kind: 'included' },
		file_manager: { kind: 'included' },
		repeated_posts: { kind: 'included' },
		reusable_templates: { kind: 'included' },
		reusable_signatures: { kind: 'included' },
		smart_filter: { kind: 'included' },
		post_delays: { kind: 'included' },
		post_comments: { kind: 'included' },
		cross_posting: { kind: 'included' },
		internal_plugs: { kind: 'included' },
		global_plugs: { kind: 'included' },
		group_management: { kind: 'included' },
		dark_light_mode: { kind: 'included' },
		community: { kind: 'included' }
	};

	return support;
}

function buildOpenQuokTeamMembersCell(
	soloLimits: ReturnType<typeof planLimitsForTier>,
	maxLimits: ReturnType<typeof planLimitsForTier>
): string {
	const soloUnlimited = isUnlimitedTeamMembersPerWorkspace(soloLimits.team_members_per_workspace);
	const maxUnlimited = isUnlimitedTeamMembersPerWorkspace(maxLimits.team_members_per_workspace);

	if (soloUnlimited || maxUnlimited) {
		return 'Unlimited';
	}

	const soloTotal = accountTeamMemberSeatTotal(
		soloLimits.workspaces,
		soloLimits.team_members_per_workspace
	);
	const maxTotal = accountTeamMemberSeatTotal(
		maxLimits.workspaces,
		maxLimits.team_members_per_workspace
	);

	if (soloTotal === maxTotal) {
		return String(maxTotal);
	}

	const soloPerWorkspace = formatTeamMembersPerWorkspaceDisplay(soloLimits.team_members_per_workspace, {
		includeYou: false
	});
	const maxPerWorkspace = formatTeamMembersPerWorkspaceDisplay(maxLimits.team_members_per_workspace, {
		includeYou: false
	});
	return `${soloTotal}–${maxTotal} (${soloPerWorkspace}–${maxPerWorkspace}/ workspace)`;
}

const HOOTSUITE_FEATURE_SUPPORT: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
	workspaces: { kind: 'excluded' },
	channels: { kind: 'text', text: 'Varies by plan' },
	posts_per_month: { kind: 'text', text: 'Unlimited scheduling' },
	team_members: { kind: 'text', text: 'Per-seat licensing' },
	share_post_preview: { kind: 'included' },
	public_api: { kind: 'excluded' },
	oauth_apps: { kind: 'excluded' },
	mcp_server: { kind: 'excluded' },
	cloud_storage: { kind: 'text', text: 'Media library (plan limits apply)' },
	multi_channel_publishing: { kind: 'included' },
	agent_integrations: { kind: 'excluded' },
	analytics: { kind: 'included' },
	photo_editor: { kind: 'excluded' },
	calendar_views: { kind: 'included' },
	kanban_views: { kind: 'excluded' },
	file_manager: { kind: 'included' },
	repeated_posts: { kind: 'included' },
	reusable_templates: { kind: 'included' },
	reusable_signatures: { kind: 'excluded' },
	smart_filter: { kind: 'included' },
	post_delays: { kind: 'text', text: 'Best-time scheduling' },
	post_comments: { kind: 'included' },
	cross_posting: { kind: 'included' },
	internal_plugs: { kind: 'excluded' },
	global_plugs: { kind: 'excluded' },
	group_management: { kind: 'included' },
	dark_light_mode: { kind: 'excluded' },
	community: { kind: 'excluded' }
};

export const PUBLIC_COMPARE_PRODUCTS: readonly CompareProduct[] = [
	{
		slug: 'openquok',
		name: 'OpenQuok',
		tagline: 'Social media scheduler built for humans and AI agents',
		overview:
			'OpenQuok is an agent-native social media scheduler. Connect channels, plan content on calendar and kanban views, and publish across every platform from the dashboard — or pipe drafts in from AI agents via skills, MCP, and the Public API. Multi-workspace isolation keeps brands, clients, and automation contexts separate.',
		pricingPlans: OPENQUOK_PRICING_PLANS,
		channels: OPENQUOK_CHANNELS,
		featureSupport: buildOpenQuokFeatureSupport()
	},
	{
		slug: 'hootsuite',
		name: 'Hootsuite',
		tagline: 'Enterprise social marketing suite since 2008',
		overview:
			'Hootsuite is an established social media management platform for marketing teams. It covers publishing, content calendar, social inbox, listening, analytics, and team workflows — with broad network support and per-user pricing aimed at mid-market and enterprise organizations.',
		pricingPlans: HOOTSUITE_PRICING_PLANS,
		channels: HOOTSUITE_CHANNELS,
		featureSupport: HOOTSUITE_FEATURE_SUPPORT
	}
];

export const PUBLIC_COMPARE_PAIRS: readonly ComparePair[] = [
	{
		productASlug: 'openquok',
		productBSlug: 'hootsuite',
		metaTitle: 'OpenQuok vs Hootsuite — Social Media Scheduler Comparison',
		metaDescription:
			'Compare OpenQuok and Hootsuite on pricing, channels, agent workspaces, MCP access, and scheduling features. See which social media scheduler fits your team.',
		keywords: [
			'OpenQuok vs Hootsuite',
			'Hootsuite alternative',
			'social media scheduler comparison',
			'agent social media scheduling',
			'Hootsuite pricing',
			'OpenQuok pricing',
			'AI agent social media',
			'multi-workspace scheduler'
		],
		heroTitle: 'OpenQuok vs. Hootsuite comparison',
		heroDescription:
			'See how OpenQuok stacks up against Hootsuite on pricing, channels, team workflows, and agent-native features. Start with a 7-day free trial — no credit card required.',
		withWithoutSection: OPENQUOK_WITH_HOOTSUITE_COMPARISON,
		faqItemIds: ['switch-from-buffer-hootsuite', 'try-free', 'multi-workspace']
	}
];

const FAQ_ITEM_INDEX_BY_ID: Record<PublicFaqItemId, number> = {
	'switch-from-buffer-hootsuite': 0,
	'try-free': 1,
	'multi-workspace': 5
};

const productBySlug = new Map(PUBLIC_COMPARE_PRODUCTS.map((product) => [product.slug, product]));

export function getCompareProduct(slug: string): CompareProduct | undefined {
	const key = slug.trim().toLowerCase() as CompareProductSlug;
	return productBySlug.get(key);
}

export function getComparePair(productA: string, productB: string): ComparePair | null {
	const a = productA.trim().toLowerCase();
	const b = productB.trim().toLowerCase();
	if (a !== 'openquok') return null;

	return (
		PUBLIC_COMPARE_PAIRS.find(
			(pair) => pair.productASlug === a && pair.productBSlug === (b as CompareProductSlug)
		) ?? null
	);
}

export function listComparePairsForHub(baseSlug: CompareProductSlug = 'openquok'): CompareHubPairViewModel[] {
	return PUBLIC_COMPARE_PAIRS.filter((pair) => pair.productASlug === baseSlug).map((pair) => {
		const competitor = getCompareProduct(pair.productBSlug);
		return {
			productASlug: pair.productASlug,
			competitorSlug: pair.productBSlug,
			competitorName: competitor?.name ?? pair.productBSlug
		};
	});
}

export function resolvePublicFaqItemsByIds(ids: readonly PublicFaqItemId[]): PublicFaqItem[] {
	return ids
		.map((id) => {
			const index = FAQ_ITEM_INDEX_BY_ID[id];
			return PUBLIC_FAQ_ITEMS[index];
		})
		.filter((item): item is PublicFaqItem => item != null);
}

/** Row labels shared with the pricing comparison table. */
export const PUBLIC_COMPARE_FEATURE_ROW_IDS = PUBLIC_PRICING_COMPARE_ROWS.map((row) => row.id);
