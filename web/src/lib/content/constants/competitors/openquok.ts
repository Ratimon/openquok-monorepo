import type { PaidSubscriptionTier } from 'openquok-common';
import {
	accountTeamMemberSeatTotal,
	isUnlimitedTeamMembersPerWorkspace,
	planLimitsForTier
} from 'openquok-common';

import { formatPostsPerMonthLimit } from '$lib/billing/Billing.repository.svelte';
import { formatTeamMembersPerWorkspaceDisplay } from '$lib/billing/GetBilling.presenter.svelte';
import {
	PUBLIC_PRICING_TIER_ORDER,
	PUBLIC_PRICING_PLAN_META,
	type PublicPricingCompareRowId
} from '$lib/billing/constants/publicPricingCatalog';
import { listAvailablePublicChannelCompareLabels } from '$lib/content/constants/channels';
import type { CompareFeatureCell, ComparePricingPlan, CompareProduct } from '$lib/content/constants/competitors/types';
import { formatBytes } from '$lib/medias';
import { icons } from '$data/icons';

const OPENQUOK_CHANNELS = listAvailablePublicChannelCompareLabels();

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

export const openquokCompareProduct: CompareProduct = {
	slug: 'openquok',
	name: 'OpenQuok',
	icon: icons.OpenQuok.name,
	tagline: 'Social media scheduler built for humans and AI agents',
	overview:
		'OpenQuok is a 100% open-source agent-native social media scheduler. Connect channels, plan content on calendar and kanban views, and publish across every platform from the dashboard — or pipe drafts in from AI agents via skills, MCP, and the Public API. Multi-workspace isolation keeps brands, clients, and automation contexts separate.',
	pricingPlans: OPENQUOK_PRICING_PLANS,
	channels: OPENQUOK_CHANNELS,
	featureSupport: buildOpenQuokFeatureSupport(),
	comparison: {
		headline: 'agent-native scheduling',
		notAnother: 'browser-only scheduler',
		builtFor: 'humans and AI agents who need multi-workspace scheduling',
		positioningWhenLeft:
			'covers the same scheduling basics — and adds workspaces, agents, and API access when automation does the work',
		talkingPoints: {
			agent_workflow: {
				strength:
					'Agents draft and schedule via skills, MCP, or the Public API — you approve on the calendar'
			},
			pricing_model: {
				strength:
					'Flat workspace pricing from $29/mo — predictable plans instead of per-seat or per-channel fees'
			},
			workspace_isolation: {
				strength:
					'Agent workspaces isolate channels, OAuth apps, tokens, and MCP endpoints per brand or client'
			},
			product_focus: {
				strength:
					'Focused scheduling, analytics, and agent integrations — pay for what you publish, not unused suites'
			},
			programmatic_access: {
				strength: 'MCP server and CLI per workspace — connect agents without copy-pasting between tools'
			},
			publishing_control: {
				strength:
					'Every agent draft lands as draft or scheduled — you approve before anything goes live'
			}
		}
	}
};
