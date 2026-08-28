import type { CompareFeatureCell, ComparePricingPlan, CompareProduct } from '$lib/content/constants/competitors/types';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';
import { icons } from '$data/icons';

const OPENPOST_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Starter',
		monthlyPrice: 15,
		tagline: 'Best for one company building a repeatable content habit',
		footnote: '1 workspace · 3 social accounts · 100 scheduled posts/month · 14-day free trial'
	},
	{
		name: 'Founder',
		monthlyPrice: 25,
		tagline: 'Best for founders publishing across more channels and workspaces',
		footnote: '3 workspaces · 6 social accounts · 500 scheduled posts/month'
	},
	{
		name: 'Pro',
		monthlyPrice: 49,
		tagline: 'Best for a complete solo-founder content operation',
		footnote: '10 workspaces · 15 social accounts · 2,500 scheduled posts/month'
	},
	{
		name: 'Team',
		monthlyPrice: 99,
		tagline: 'Best for small teams that need seats and workspace roles',
		footnote: '3 included seats · team roles · 5,000 scheduled posts/month'
	},
	{
		name: 'Agency',
		monthlyPrice: 199,
		tagline: 'Best for agencies managing many clients and campaigns',
		footnote: '5 included seats · 50 workspaces · 150 social accounts · 25,000 scheduled posts/month'
	}
];

const OPENPOST_CHANNELS = [
	'Facebook',
	'Instagram',
	'LinkedIn',
	'X',
	'TikTok',
	'YouTube',
	'Threads',
	'Bluesky',
	'Mastodon',
	'Discord'
];

const OPENPOST_FEATURE_SUPPORT: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
	workspaces: { kind: 'text', text: '1–50 by hosted plan' },
	channels: { kind: 'text', text: '3–150 social accounts by plan' },
	posts_per_month: { kind: 'text', text: '100–25,000 scheduled posts by plan' },
	team_members: { kind: 'text', text: '1 seat on Starter–Pro · 3 on Team · 5 on Agency' },
	ai_writer: { kind: 'excluded' },
	ai_summarizer: { kind: 'excluded' },
	share_post_preview: { kind: 'included' },
	public_api: { kind: 'included' },
	oauth_apps: { kind: 'excluded' },
	mcp_server: { kind: 'text', text: 'mcp:read and mcp:full scopes' },
	cloud_storage: { kind: 'text', text: '1–250 GB media by plan' },
	multi_channel_publishing: { kind: 'included' },
	agent_integrations: { kind: 'text', text: 'HTTP API, CLI, and MCP tokens' },
	analytics: { kind: 'included' },
	photo_editor: { kind: 'text', text: 'OpenPost Image Editor' },
	skill_builder: { kind: 'excluded' },
	calendar_views: { kind: 'included' },
	kanban_views: { kind: 'excluded' },
	file_manager: { kind: 'included' },
	repeated_posts: { kind: 'excluded' },
	reusable_templates: { kind: 'text', text: 'Social Sets for account groups' },
	reusable_signatures: { kind: 'excluded' },
	smart_filter: { kind: 'excluded' },
	post_delays: { kind: 'text', text: 'Saved weekly slots' },
	post_comments: { kind: 'included' },
	cross_posting: { kind: 'included' },
	internal_plugs: { kind: 'excluded' },
	global_plugs: { kind: 'excluded' },
	group_management: { kind: 'text', text: 'Social Sets' },
	dark_light_mode: { kind: 'included' },
	community: { kind: 'excluded' }
};

export const openpostCompareProduct: CompareProduct = {
	slug: 'openpost',
	name: 'OpenPost',
	icon: icons.OpenPost.name,
	tagline: 'Content workspace for solo founders with hosted and self-hosted paths',
	overview:
		'OpenPost is a publishing workspace for solo founders and small teams. Write once, adapt copy and media for each connected account, schedule from the calendar, and review analytics and inbox replies — with HTTP API, CLI, and MCP access on hosted plans, or zero software fee when you self-host the AGPL stack.',
	pricingPlans: OPENPOST_PRICING_PLANS,
	channels: OPENPOST_CHANNELS,
	featureSupport: OPENPOST_FEATURE_SUPPORT,
	comparison: {
		headline: 'founder-focused publishing workspace',
		notAnother: 'browser-only queue',
		builtFor: 'solo founders who want one composer, account-specific versions, and optional self-hosting',
		positioningWhenLeft:
			'combines cross-platform adaptation, built-in image and video editors, analytics, and agent paths via API, CLI, and MCP on hosted or self-hosted deployments',
		talkingPoints: {
			agent_workflow: {
				strength: 'HTTP API, CLI, and MCP tokens let assistants schedule while social keys stay encrypted in OpenPost',
				weakness:
					'Scoped MCP tokens (read vs full) — no skill builder or per-workspace OAuth apps for external agent checkpoints'
			},
			pricing_model: {
				strength: 'Hosted plans from $15/month plus a $0 software-fee self-host option under AGPL',
				weakness: 'Monthly scheduled-post caps (100–25,000) and account limits on every hosted tier'
			},
			workspace_isolation: {
				strength: 'Workspaces keep brands and clients separated with plan-based workspace counts',
				weakness:
					'Organization workspaces — not agent workspaces with separate MCP endpoints and OAuth apps per automation context'
			},
			product_focus: {
				strength: 'Built-in image and video editors, analytics, inbox, and ten-network publishing in one founder workspace',
				weakness: 'Post quotas and a ten-network catalog when you need broader agent-native tooling and kanban review'
			},
			programmatic_access: {
				strength: 'Same workspace rules from HTTP API, CLI, and MCP on hosted and self-hosted deployments',
				weakness: 'Account-level MCP scopes — not one OAuth app and MCP server per agent workspace'
			},
			publishing_control: {
				strength: 'Account-specific versions and destination previews before content leaves the composer',
				weakness: 'Team roles only on Team and Agency — solo tiers lack collaboration and approval gates'
			}
		}
	}
};
