import type { CompareFeatureCell, ComparePricingPlan, CompareProduct } from '$lib/content/constants/competitors/types';
import type { PublicPricingCompareRowId } from '$lib/billing/constants/publicPricingCatalog';
import { icons } from '$data/icons';

const USEBARD_PRICING_PLANS: ComparePricingPlan[] = [
	{
		name: 'Early access',
		monthlyPrice: 20,
		tagline: 'Best for musicians, DJs, and producers who want short-form video with their tracks',
		footnote: 'Per month · book a call for early access'
	}
];

const USEBARD_CHANNELS = ['Facebook', 'Instagram', 'TikTok', 'YouTube Shorts'];

const USEBARD_FEATURE_SUPPORT: Partial<Record<PublicPricingCompareRowId, CompareFeatureCell>> = {
	workspaces: { kind: 'excluded' },
	channels: { kind: 'text', text: 'TikTok, Instagram, YouTube Shorts, Facebook' },
	posts_per_month: { kind: 'text', text: 'Schedule-based — volume not published' },
	team_members: { kind: 'excluded' },
	ai_writer: { kind: 'excluded' },
	ai_summarizer: { kind: 'excluded' },
	share_post_preview: { kind: 'included' },
	public_api: { kind: 'excluded' },
	oauth_apps: { kind: 'excluded' },
	mcp_server: { kind: 'excluded' },
	cloud_storage: { kind: 'text', text: 'Raw video clip uploads' },
	multi_channel_publishing: { kind: 'included' },
	agent_integrations: { kind: 'excluded' },
	analytics: { kind: 'excluded' },
	photo_editor: { kind: 'text', text: 'Auto clip cuts with music overlay' },
	skill_builder: { kind: 'excluded' },
	calendar_views: { kind: 'included' },
	kanban_views: { kind: 'excluded' },
	file_manager: { kind: 'excluded' },
	repeated_posts: { kind: 'excluded' },
	reusable_templates: { kind: 'excluded' },
	reusable_signatures: { kind: 'excluded' },
	smart_filter: { kind: 'excluded' },
	post_delays: { kind: 'included' },
	post_comments: { kind: 'excluded' },
	cross_posting: { kind: 'included' },
	internal_plugs: { kind: 'excluded' },
	global_plugs: { kind: 'excluded' },
	group_management: { kind: 'excluded' },
	dark_light_mode: { kind: 'excluded' },
	community: { kind: 'excluded' }
};

export const usebardCompareProduct: CompareProduct = {
	slug: 'usebard',
	name: 'UseBard',
	icon: icons.UseBard.name,
	tagline: 'Music-promo short video clips, edited and scheduled for you',
	overview:
		'UseBard is a music-promotion workflow for musicians, DJs, and producers. Upload raw video clips, approve short edits with your track added, and UseBard schedules them to TikTok, Instagram Reels, YouTube Shorts, and Facebook — aimed at artists who want posting handled without manual editing.',
	pricingPlans: USEBARD_PRICING_PLANS,
	channels: USEBARD_CHANNELS,
	featureSupport: USEBARD_FEATURE_SUPPORT,
	comparison: {
		headline: 'music-promo clip automation',
		notAnother: 'music-clip autoposter',
		builtFor: 'musicians who want short videos with their tracks posted on a weekly rhythm',
		positioningWhenLeft:
			'cuts raw clips, layers your music, and schedules TikTok, Reels, Shorts, and Facebook after you approve each edit',
		withoutTitle: 'Typical UseBard workflow',
		talkingPoints: {
			agent_workflow: {
				strength: 'Upload clips and approve edits — no copy-paste into a scheduler',
				weakness:
					'Upload-and-approve only — no Public API, MCP, CLI, or agent skills for external workflows'
			},
			pricing_model: {
				strength: '$20/mo early-access pricing for musicians promoting tracks on short-form video',
				weakness: 'Onboarding call required — no self-serve signup or plan tiers listed on the website'
			},
			workspace_isolation: {
				weakness: 'One music-promo pipeline — not isolated workspaces per brand, client, or channel group'
			},
			product_focus: {
				strength:
					'Automated short clips with your track for artists promoting on TikTok, Reels, Shorts, and Facebook',
				weakness:
					'Music-promo short video only — no text posts, threads, LinkedIn, X, or general cross-channel scheduling'
			},
			programmatic_access: {
				weakness: 'No API, MCP, or agent endpoints — dashboard upload and approval only'
			},
			publishing_control: {
				strength: 'Review and approve each generated clip before UseBard posts on your schedule',
				weakness:
					"Locked to UseBard's automated clip-and-music pipeline — cannot schedule finished posts you already edited"
			}
		}
	}
};
