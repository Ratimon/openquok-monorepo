import type { CompareFeatureCell, ComparePricingPlan, CompareProduct } from '$lib/content/constants/competitors/types';
import { COMPARE_PRODUCT_CATEGORIES_SOCIAL_SCHEDULING } from '$lib/content/constants/competitors/shared';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';
import { icons } from '$data/icons';

const HEROPOST_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Starter',
		monthlyPrice: 197,
		pricePeriod: 'one_time',
		tagline: 'Best for solo creators and small brands on a handful of accounts',
		footnote: 'One payment · 12 social accounts · 2 workspaces · 5 automations · 1 user'
	},
	{
		name: 'Growth',
		monthlyPrice: 297,
		pricePeriod: 'one_time',
		tagline: 'Best for growing brands that need more accounts and client workspaces',
		footnote: 'One payment · 70 social accounts · 7 workspaces · 15 automations · 1 user'
	},
	{
		name: 'Agency',
		monthlyPrice: 397,
		pricePeriod: 'one_time',
		tagline: 'Best for agencies that need unlimited accounts, team seats, and approvals',
		footnote:
			'One payment · unlimited accounts & workspaces · unlimited team members · approval workflows'
	}
];

const HEROPOST_CHANNELS = [
	'Facebook',
	'Instagram',
	'LinkedIn',
	'X',
	'TikTok',
	'YouTube',
	'Pinterest',
	'Reddit',
	'Threads',
	'Bluesky',
	'Telegram'
];

const HEROPOST_FEATURE_SUPPORT: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
	workspaces: { kind: 'text', text: '2 on Starter · 7 on Growth · unlimited on Agency' },
	channels: { kind: 'text', text: '12 / 70 / unlimited social accounts by tier' },
	posts_per_month: { kind: 'text', text: 'Unlimited scheduling on every tier' },
	team_members: { kind: 'text', text: '1 on Starter & Growth · unlimited on Agency' },
	ai_writer: { kind: 'text', text: 'HeroAI captions & hashtags (unlimited)' },
	ai_summarizer: { kind: 'excluded' },
	share_post_preview: { kind: 'included' },
	official_api: { kind: 'text', text: 'No Info' },
	public_api: { kind: 'text', text: 'Coming soon' },
	oauth_apps: { kind: 'excluded' },
	mcp_server: { kind: 'excluded' },
	cloud_storage: { kind: 'text', text: 'Per-workspace media library' },
	multi_channel_publishing: { kind: 'included' },
	agent_integrations: { kind: 'excluded' },
	analytics: { kind: 'included' },
	photo_editor: { kind: 'text', text: 'Adobe Express built in' },
	skill_builder: { kind: 'excluded' },
	calendar_views: { kind: 'included' },
	kanban_views: { kind: 'excluded' },
	file_manager: { kind: 'included' },
	repeated_posts: { kind: 'excluded' },
	reusable_templates: { kind: 'text', text: 'HeroAI caption templates' },
	reusable_signatures: { kind: 'excluded' },
	smart_filter: { kind: 'excluded' },
	post_delays: { kind: 'text', text: 'Schedule months ahead · bulk CSV' },
	post_comments: { kind: 'included' },
	cross_posting: { kind: 'included' },
	internal_plugs: { kind: 'excluded' },
	cross_account_plugs: { kind: 'excluded' },
	global_plugs: { kind: 'excluded' },
	group_management: { kind: 'text', text: 'Posting groups for bulk upload' },
	dark_light_mode: { kind: 'included' },
	community: { kind: 'excluded' }
};

export const heropostCompareProduct: CompareProduct = {
	slug: 'heropost',
	categories: COMPARE_PRODUCT_CATEGORIES_SOCIAL_SCHEDULING,
	name: 'Heropost',
	icon: icons.Heropost.name,
	tagline: 'Lifetime social scheduler with HeroAI and eleven networks',
	overview:
		'Heropost is a hosted social scheduler for creators, brands, and agencies. You connect eleven networks, schedule unlimited posts, and automate feeds from RSS, WordPress, and Shopify. Lifetime tiers include workspaces, analytics, and bulk CSV scheduling.',
	pricingPlans: HEROPOST_PRICING_PLANS,
	channels: HEROPOST_CHANNELS,
	featureSupport: HEROPOST_FEATURE_SUPPORT,
	alternativesLongForm: {
		whyPeopleLook: {
			id: 'why-people-look',
			navLabel: 'Why people look',
			subtitle: 'Why people look',
			title: 'Why teams look for Heropost alternatives',
			body: [
				'Heropost sells lifetime tiers with HeroAI and eleven networks.',
				'Teams switch when they need self-hosting, agents, or a Public API.',
				'You may outgrow workspace and account caps on lower tiers.'
			]
		},
		yourOptions: {
			id: 'your-options',
			navLabel: 'Your options',
			subtitle: 'Your options',
			title: 'Stay on Heropost, switch schedulers, or adopt OpenQuok',
			body: [
				'Keep Heropost, pick another scheduler, or move to OpenQuok.',
				'OpenQuok ranks first here for self-hosting and agent scheduling.',
				'Compare list prices in the sections below.'
			]
		},
		whenTheyWin: {
			id: 'when-they-win',
			navLabel: 'When they win',
			subtitle: 'When they win',
			title: 'When Heropost stays the better choice',
			body: [
				'You want eleven networks and HeroAI in one lifetime payment.',
				'You use CSV bulk upload and store feeds in one dashboard.',
				'You do not need self-hosting, MCP, or a Public API this quarter.'
			]
		}
	},
	comparison: {
		headline: 'lifetime multi-network scheduling',
		notAnother: 'lifetime deal dashboard',
		builtFor: 'creators and agencies who want eleven networks and unlimited posts in one hosted app',
		positioningWhenLeft:
			'bundles HeroAI, workspaces, RSS and store automations, and unlimited scheduling into one-time lifetime tiers',
		talkingPoints: {
			agent_workflow: {
				strength: 'HeroAI drafts captions, threads, and hashtags inside the composer on every tier',
				weakness:
					'HeroAI stays inside Heropost — no skills, workspace MCP, or Public API for external agents yet'
			},
			pricing_model: {
				strength:
					'One-time lifetime tiers from $197 with unlimited posts and all eleven networks on every plan',
				weakness: 'Account and workspace caps on Starter and Growth before Agency unlocks unlimited seats'
			},
			workspace_isolation: {
				strength: 'Workspaces separate brands, media, and time zones inside one login',
				weakness:
					'Hosted client workspaces — not isolated agent workspaces with separate tokens and MCP endpoints'
			},
			product_focus: {
				strength:
					'Bulk CSV upload, client self-connect invites, MonoLink pages, and store automations without per-channel fees',
				weakness: 'Public API and white label are marked coming soon — not available for custom agent stacks today'
			},
			programmatic_access: {
				weakness: 'No shipping Public API or MCP server — automation stays inside the dashboard and feed connectors'
			},
			publishing_control: {
				strength: 'Agency tier adds approval workflows, roles, and client guest review',
				weakness: 'Approvals and unlimited team members require the Agency lifetime tier'
			}
		}
	}
};
