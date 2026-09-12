import type { CompareFeatureCell, ComparePricingPlan, CompareProduct } from '$lib/content/constants/competitors/types';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';
import { icons } from '$data/icons';

const CLAW_POST_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Free',
		monthlyPrice: 0,
		tagline: 'Best for trying agent posting on one connected account',
		footnote: '25 posts / month · text posting to X · 1 connected account'
	},
	{
		name: 'Starter',
		monthlyPrice: 9,
		tagline: 'Best for indie builders who need media and a few accounts',
		footnote: '300 posts / month · text + media · 3 connected accounts'
	},
	{
		name: 'Pro',
		monthlyPrice: 29,
		tagline: 'Best for teams and growing AI products that need webhooks',
		footnote: '3,000 posts / month · 10 connected accounts · priority job queue'
	},
	{
		name: 'Agency',
		monthlyPrice: 99,
		tagline: 'Best for agencies and high-volume agent pipelines',
		footnote: '20,000 posts / month · unlimited accounts · dedicated queue · SLA'
	}
];

const CLAW_POST_CHANNELS = ['X', 'LinkedIn', 'Facebook', 'TikTok', 'Instagram'];

const CLAW_POST_FEATURE_SUPPORT: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
	workspaces: { kind: 'excluded' },
	channels: { kind: 'text', text: '1–unlimited accounts by plan' },
	posts_per_month: { kind: 'text', text: '25–20,000 by plan' },
	team_members: { kind: 'excluded' },
	ai_writer: { kind: 'excluded' },
	ai_summarizer: { kind: 'excluded' },
	share_post_preview: { kind: 'excluded' },
	public_api: { kind: 'included' },
	oauth_apps: { kind: 'excluded' },
	mcp_server: { kind: 'text', text: 'Streamable HTTP MCP with OAuth' },
	cloud_storage: { kind: 'text', text: 'Signed upload URLs for media' },
	multi_channel_publishing: { kind: 'included' },
	agent_integrations: { kind: 'text', text: 'REST API, MCP, and OpenClaw skills' },
	analytics: { kind: 'excluded' },
	photo_editor: { kind: 'excluded' },
	skill_builder: { kind: 'excluded' },
	calendar_views: { kind: 'excluded' },
	kanban_views: { kind: 'excluded' },
	file_manager: { kind: 'excluded' },
	repeated_posts: { kind: 'excluded' },
	reusable_templates: { kind: 'excluded' },
	reusable_signatures: { kind: 'excluded' },
	smart_filter: { kind: 'excluded' },
	post_delays: { kind: 'excluded' },
	post_comments: { kind: 'excluded' },
	cross_posting: { kind: 'included' },
	internal_plugs: { kind: 'excluded' },
	cross_account_plugs: { kind: 'excluded' },
	global_plugs: { kind: 'excluded' },
	group_management: { kind: 'excluded' },
	dark_light_mode: { kind: 'excluded' },
	community: { kind: 'excluded' }
};

export const clawPostCompareProduct: CompareProduct = {
	slug: 'claw-post',
	name: 'Claw Post',
	icon: icons.ClawPost.name,
	tagline: 'Browser-extension posting API for AI agents',
	overview:
		'Claw Post is agent-first social posting infrastructure that publishes through a logged-in Chrome extension instead of official platform APIs. Connect X, LinkedIn, Facebook, TikTok, and Instagram from your desktop browser, then trigger posts from a REST API, Streamable HTTP MCP with OAuth, or OpenClaw skills — with job queues, retries, idempotency keys, and signed media uploads.',
	pricingPlans: CLAW_POST_PRICING_PLANS,
	channels: CLAW_POST_CHANNELS,
	featureSupport: CLAW_POST_FEATURE_SUPPORT,
	comparison: {
		headline: 'browser-session agent posting',
		notAnother: 'headless Playwright loop',
		builtFor: 'agents that post through a real logged-in Chrome session',
		positioningWhenLeft:
			'queues post jobs to a Chrome extension so agents never hold social passwords or hunt UI buttons',
		withoutTitle: 'Typical Claw Post workflow',
		talkingPoints: {
			agent_workflow: {
				strength: 'One REST call or MCP tool queues a post job — the extension publishes from your browser session',
				weakness:
					'Extension-driven execution — no calendar, kanban, or human review workspace before posts leave the queue'
			},
			pricing_model: {
				strength: 'Usage-based tiers from $0 with post caps that scale to agency volume',
				weakness: 'Monthly post quotas (25–20,000) and per-plan account limits on every tier except Agency'
			},
			workspace_isolation: {
				weakness: 'One tenant queue and API key — not separate agent workspaces with isolated MCP endpoints'
			},
			product_focus: {
				strength: 'Purpose-built for agents — MCP OAuth, idempotency keys, and job lifecycle tracking out of the box',
				weakness: 'Job-queue API without a full scheduling workspace, analytics, or content calendar'
			},
			programmatic_access: {
				strength: 'REST API plus Streamable HTTP MCP with OAuth — no skill file required for compatible agents',
				weakness: 'Tenant-scoped API key or MCP OAuth — not workspace-scoped Public API keys per brand or client'
			},
			publishing_control: {
				strength: 'Credentials stay in Chrome — the service never sees social passwords',
				weakness: 'Posts fire when the extension runs — no draft-approval kanban or team review before publish'
			}
		}
	}
};
