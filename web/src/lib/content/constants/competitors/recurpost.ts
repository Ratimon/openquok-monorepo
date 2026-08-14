import type { CompareFeatureCell, ComparePricingPlan, CompareProduct } from '$lib/content/constants/competitors/types';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';
import { icons } from '$data/icons';

const RECURPOST_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Starter',
		monthlyPrice: 9,
		tagline: 'Best for an individual running their own workflow on two social accounts',
		footnote: '2 accounts · 1 user · 14-day free trial · extra accounts $4/mo'
	},
	{
		name: 'Personal',
		monthlyPrice: 25,
		tagline: 'Best for a small business or freelancer managing up to five social accounts',
		footnote: '5 accounts · 1 user · 14-day free trial · extra accounts $4/mo'
	},
	{
		name: 'Agency',
		monthlyPrice: 79,
		tagline: 'Best for agencies running client accounts with approvals and white-label reports',
		footnote: '20 accounts · 3 users · extra accounts $4/mo · extra teammates $20/mo'
	},
	{
		name: 'Enterprise',
		monthlyPrice: null,
		tagline: 'Best for organizations operating past 100 social accounts or on negotiated terms',
		footnote: 'Custom pricing — 100+ accounts · priority onboarding'
	}
];

const RECURPOST_CHANNELS = [
	'Facebook',
	'Instagram',
	'LinkedIn',
	'X',
	'TikTok',
	'YouTube',
	'Pinterest',
	'Threads',
	'Bluesky',
	'Google Business Profile'
];

const RECURPOST_FEATURE_SUPPORT: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
	workspaces: { kind: 'text', text: 'Client workspaces on Agency+' },
	channels: { kind: 'text', text: '2 on Starter · 5 on Personal · 20 on Agency · 100+ on Enterprise' },
	posts_per_month: { kind: 'text', text: '10–80 posts/account/day by plan' },
	team_members: { kind: 'text', text: '1 on Starter/Personal · 3 on Agency · extra seats $20/mo' },
	ai_writer: { kind: 'text', text: 'AI composer, images, and chat assistant' },
	ai_summarizer: { kind: 'excluded' },
	share_post_preview: { kind: 'included' },
	public_api: { kind: 'excluded' },
	oauth_apps: { kind: 'excluded' },
	mcp_server: { kind: 'excluded' },
	cloud_storage: { kind: 'text', text: '10–250 GB by plan' },
	multi_channel_publishing: { kind: 'included' },
	agent_integrations: { kind: 'excluded' },
	analytics: { kind: 'included' },
	photo_editor: { kind: 'included' },
	skill_builder: { kind: 'excluded' },
	calendar_views: { kind: 'included' },
	kanban_views: { kind: 'excluded' },
	file_manager: { kind: 'included' },
	repeated_posts: { kind: 'included' },
	reusable_templates: { kind: 'text', text: 'AI templates & seasonal libraries' },
	reusable_signatures: { kind: 'excluded' },
	smart_filter: { kind: 'excluded' },
	post_delays: { kind: 'text', text: 'Best-time scheduling' },
	post_comments: { kind: 'text', text: 'First comment on new posts' },
	cross_posting: { kind: 'included' },
	internal_plugs: { kind: 'excluded' },
	global_plugs: { kind: 'excluded' },
	group_management: { kind: 'text', text: 'Client workspaces on Agency+' },
	dark_light_mode: { kind: 'excluded' },
	community: { kind: 'excluded' }
};

export const recurpostCompareProduct: CompareProduct = {
	slug: 'recurpost',
	name: 'RecurPost',
	icon: icons.RecurPost.name,
	tagline: 'Agency social scheduler with evergreen recycling since 2016',
	overview:
		'RecurPost is a social media management tool and scheduler for agencies, freelancers, and teams managing multiple accounts. Plan campaigns, tailor posts per network, collect client approvals with a shareable link, recycle evergreen content, and send white-label reports — with per-profile pricing from $9/month and a 14-day free trial.',
	pricingPlans: RECURPOST_PRICING_PLANS,
	channels: RECURPOST_CHANNELS,
	featureSupport: RECURPOST_FEATURE_SUPPORT,
	comparison: {
		headline: 'evergreen recycling and agency approvals',
		notAnother: 'evergreen queue',
		builtFor: 'agencies and freelancers managing many client accounts in a browser',
		positioningWhenLeft:
			'centralizes calendars, client approvals, evergreen libraries, and white-label reports for teams that live in the dashboard',
		talkingPoints: {
			agent_workflow: {
				strength: 'AI Chat Assistant drafts posts inside the composer, inbox, and reports',
				weakness:
					'AI lives inside RecurPost — no skills, workspace MCP, or Public API for external agents'
			},
			pricing_model: {
				strength: 'Per-profile pricing from $9/mo — extra teammates are a flat $20, not another full seat',
				weakness: 'Per-profile add-ons at $4/mo plus daily post caps that force plan jumps as volume grows'
			},
			workspace_isolation: {
				strength: 'Agency client workspaces and password-free onboarding keep client accounts separated',
				weakness: 'Client workspaces start on Agency ($79) — Starter and Personal share one account pile'
			},
			product_focus: {
				strength: 'Scheduling plus approvals, unified inbox, Instagram DM automation, and white-label reports',
				weakness:
					'Agency suite of inbox, DM automation, and white-label reports when you mainly need agent-native scheduling'
			},
			programmatic_access: {
				weakness: 'Zapier and a Chrome extension — no Public API, CLI, or MCP server for editor or terminal agents'
			},
			publishing_control: {
				strength: 'Shareable approval links and visible post-failure handling with 850+ error types',
				weakness: 'Dashboard-first publishing — agent drafts cannot land as reviewable checkpoints without the RecurPost UI'
			}
		}
	}
};
