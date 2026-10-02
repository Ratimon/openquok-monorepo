import type { CompareFeatureCell, ComparePricingPlan, CompareProduct } from '$lib/content/constants/competitors/types';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';
import { icons } from '$data/icons';

const SPROUT_SOCIAL_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Essentials',
		monthlyPrice: 79,
		tagline: 'Best for publishing-focused teams on up to five social profiles',
		footnote: 'Per seat / month (annual billing) · $99 billed monthly · 30-day free trial'
	},
	{
		name: 'Standard',
		monthlyPrice: 199,
		tagline: 'Best for small teams that need inbox, monitoring, and five profiles',
		footnote: 'Per seat / month (annual billing) · 30-day free trial'
	},
	{
		name: 'Professional',
		monthlyPrice: 299,
		tagline: 'Best for teams with high engagement and unlimited social profiles',
		footnote: 'Per seat / month (annual billing) · 30-day free trial'
	},
	{
		name: 'Advanced',
		monthlyPrice: 399,
		tagline: 'Best for cross-functional teams that need API access and care workflows',
		footnote: 'Per seat / month (annual billing) · Sprout API on Advanced'
	},
	{
		name: 'Enterprise',
		monthlyPrice: null,
		tagline: 'Best for large organizations that need SSO and white-glove onboarding',
		footnote: 'Custom pricing — contact sales'
	}
];

const SPROUT_SOCIAL_CHANNELS = [
	'Facebook',
	'Instagram',
	'LinkedIn',
	'X',
	'TikTok',
	'YouTube',
	'Pinterest',
	'Threads',
	'Bluesky',
	'WhatsApp',
	'Reddit',
	'Google Business Profile'
];

const SPROUT_SOCIAL_FEATURE_SUPPORT: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
	workspaces: { kind: 'text', text: 'Customer groups and profile groups' },
	channels: { kind: 'text', text: '5 profiles on Essentials/Standard · unlimited on Professional+' },
	posts_per_month: { kind: 'text', text: 'Unlimited scheduling' },
	team_members: { kind: 'text', text: 'Per-seat licensing' },
	ai_writer: { kind: 'included' },
	ai_summarizer: { kind: 'included' },
	share_post_preview: { kind: 'included' },
	official_api: { kind: 'included' },
	public_api: { kind: 'text', text: 'Sprout API (Advanced plan)' },
	oauth_apps: { kind: 'excluded' },
	mcp_server: { kind: 'excluded' },
	cloud_storage: { kind: 'text', text: 'Asset library and DAM integrations' },
	multi_channel_publishing: { kind: 'included' },
	agent_integrations: { kind: 'excluded' },
	analytics: { kind: 'included' },
	photo_editor: { kind: 'excluded' },
	skill_builder: { kind: 'excluded' },
	calendar_views: { kind: 'included' },
	kanban_views: { kind: 'excluded' },
	file_manager: { kind: 'included' },
	repeated_posts: { kind: 'included' },
	reusable_templates: { kind: 'included' },
	reusable_signatures: { kind: 'excluded' },
	smart_filter: { kind: 'included' },
	post_delays: { kind: 'text', text: 'Optimal Send Times' },
	post_comments: { kind: 'included' },
	cross_posting: { kind: 'included' },
	internal_plugs: { kind: 'excluded' },
	cross_account_plugs: { kind: 'excluded' },
	global_plugs: { kind: 'excluded' },
	group_management: { kind: 'included' },
	dark_light_mode: { kind: 'excluded' },
	community: { kind: 'included' }
};

export const sproutSocialCompareProduct: CompareProduct = {
	slug: 'sprout-social',
	name: 'Sprout Social',
	icon: icons.SproutSocial.name,
	pricingUnit: 'per_seat',
	tagline: 'Enterprise social suite with publishing, care, and listening',
	overview:
		'Sprout Social is a social media management platform for marketing and care teams. Plans cover publishing, Smart Inbox engagement, analytics, AI Assist, and optional listening — with per-seat pricing, profile limits on lower tiers, and a Sprout API on Advanced.',
	pricingPlans: SPROUT_SOCIAL_PRICING_PLANS,
	channels: SPROUT_SOCIAL_CHANNELS,
	featureSupport: SPROUT_SOCIAL_FEATURE_SUPPORT,
	comparison: {
		headline: 'enterprise social operations',
		notAnother: 'enterprise inbox',
		builtFor: 'marketing and care teams in a unified dashboard',
		positioningWhenLeft:
			'combines publishing, engagement, analytics, and listening for teams that standardize on one vendor',
		talkingPoints: {
			agent_workflow: {
				strength: 'Trellis AI and AI Assist draft posts, replies, and alt text inside Sprout',
				weakness:
					'AI lives inside Sprout — no skills, workspace MCP, or agent-first review queue for external tools'
			},
			pricing_model: {
				strength: 'Mature per-seat tiers with inbox, listening add-ons, and enterprise sales support',
				weakness: 'Per-seat pricing from $79–$399 before add-ons — costs climb with every teammate'
			},
			workspace_isolation: {
				weakness: 'One Sprout customer account — not isolated workspaces per client or brand'
			},
			product_focus: {
				strength: 'Smart Inbox, listening, and influencer tools for full-funnel social teams',
				weakness: 'Suite breadth you may not need if you only schedule and approve posts'
			},
			programmatic_access: {
				weakness: 'Sprout API requires Advanced and sales provisioning — not workspace API keys on every plan'
			},
			publishing_control: {
				strength: 'Message approval workflows and external calendar sharing for stakeholder sign-off',
				weakness: 'Approvals live in Sprout — not the same human-in-the-loop queue as agent-scheduled drafts'
			}
		}
	}
};
