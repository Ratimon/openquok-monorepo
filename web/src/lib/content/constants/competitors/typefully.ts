import type { CompareFeatureCell, ComparePricingPlan, CompareProduct } from '$lib/content/constants/competitors/types';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';
import { icons } from '$data/icons';

const TYPEFULLY_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Free',
		monthlyPrice: 0,
		tagline: 'Best for light usage and trying the writing-first editor',
		footnote: '1 social set · 1 user · 15 posts/month · Agents, API, and MCP included'
	},
	{
		name: 'Pro',
		monthlyPrice: 10,
		tagline: 'Best for individual writers and creators shipping polished posts',
		footnote: 'From $10/mo per social set · up to 10 social sets · 1 user · ~$8/mo on yearly'
	},
	{
		name: 'Business',
		monthlyPrice: 20,
		tagline: 'Best for marketing teams and agencies that collaborate on drafts',
		footnote: 'From $20/mo per social set · up to 50 social sets · unlimited users · ~$18/mo on yearly'
	},
	{
		name: 'Enterprise',
		monthlyPrice: null,
		tagline: 'Best for companies that need custom limits, priority support, or a security review',
		footnote: 'Custom pricing — request a trial'
	}
];

const TYPEFULLY_CHANNELS = ['X', 'LinkedIn', 'Threads', 'Bluesky', 'Mastodon'];

const TYPEFULLY_FEATURE_SUPPORT: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
	workspaces: { kind: 'excluded' },
	channels: { kind: 'text', text: '1 social set on Free · up to 10 on Pro · up to 50 on Business' },
	posts_per_month: { kind: 'text', text: '15 on Free · 1,000 on Pro · 1,500 on Business' },
	team_members: { kind: 'text', text: '1 on Free/Pro · unlimited on Business' },
	ai_writer: { kind: 'text', text: 'Writing Assistant, Rewrite & Improve (usage by plan)' },
	ai_summarizer: { kind: 'excluded' },
	share_post_preview: { kind: 'included' },
	public_api: { kind: 'included' },
	oauth_apps: { kind: 'excluded' },
	mcp_server: { kind: 'included' },
	cloud_storage: { kind: 'text', text: 'Limited on Free · unlimited media uploads on Pro+' },
	multi_channel_publishing: { kind: 'included' },
	agent_integrations: { kind: 'text', text: 'API, MCP, and AI agent skills' },
	analytics: { kind: 'text', text: 'X analytics on Pro+' },
	photo_editor: { kind: 'excluded' },
	skill_builder: { kind: 'excluded' },
	calendar_views: { kind: 'included' },
	kanban_views: { kind: 'excluded' },
	file_manager: { kind: 'excluded' },
	repeated_posts: { kind: 'excluded' },
	reusable_templates: { kind: 'excluded' },
	reusable_signatures: { kind: 'excluded' },
	smart_filter: { kind: 'text', text: 'Tags & filtering' },
	post_delays: { kind: 'text', text: 'Natural language scheduling' },
	post_comments: { kind: 'text', text: 'Draft comments & LinkedIn first comment' },
	cross_posting: { kind: 'included' },
	internal_plugs: { kind: 'excluded' },
	global_plugs: { kind: 'text', text: 'Automatic Plug & Auto-RT (engagement)' },
	group_management: { kind: 'text', text: 'Social sets (one identity across platforms)' },
	dark_light_mode: { kind: 'included' },
	community: { kind: 'excluded' }
};

export const typefullyCompareProduct: CompareProduct = {
	slug: 'typefully',
	name: 'Typefully',
	icon: icons.Typefully.name,
	tagline: 'Writing-first social scheduler for creators and collaborative teams',
	overview:
		'Typefully is a writing-first social media workspace for creators and teams. It centers a high-fidelity editor, review workflows, calendar scheduling, and cross-posting to text-forward networks — with Public API v2, MCP, agent skills, and AI writing tools, priced per social set from Free through Business plus Enterprise.',
	pricingPlans: TYPEFULLY_PRICING_PLANS,
	channels: TYPEFULLY_CHANNELS,
	featureSupport: TYPEFULLY_FEATURE_SUPPORT,
	comparison: {
		headline: 'writing-first social publishing',
		notAnother: 'writing-first editor',
		builtFor: 'creators and teams that want polished writing, review, and cross-platform scheduling',
		positioningWhenLeft:
			'puts drafting, review, and team collaboration first, with API, MCP, and agent skills around a hosted writing workspace',
		talkingPoints: {
			agent_workflow: {
				strength: 'API, MCP, and agent skills let assistants queue drafts and manage the calendar',
				weakness:
					'Agents work inside Typefully’s hosted writing workspace — not workspace-scoped OpenQuok tokens with separate OAuth and MCP endpoints'
			},
			pricing_model: {
				strength: 'Free plan plus Pro from $10/mo per social set for serious solo creators',
				weakness: 'Per-social-set pricing that multiplies as you add brands, clients, or identities'
			},
			workspace_isolation: {
				strength: 'Social sets keep one creator identity’s accounts bundled across platforms',
				weakness: 'Social sets organize identities — not isolated workspaces per brand with separate agent credentials'
			},
			product_focus: {
				strength: 'High-fidelity editor, thread tooling, review comments, and pixel-perfect previews',
				weakness: 'Text-forward networks only — no Instagram, TikTok, YouTube, Facebook, or Pinterest coverage'
			},
			programmatic_access: {
				strength: 'Public API v2, MCP, webhooks, Zapier, and agent skills on every plan including Free',
				weakness: 'Account-level API and MCP — not workspace-scoped Public API + CLI + MCP per brand'
			},
			publishing_control: {
				strength: 'Shared drafts, comments, and calendar review before posts go live across the team',
				weakness: 'Hosted proprietary service — no self-host path or source you can audit and run yourself'
			}
		}
	}
};
