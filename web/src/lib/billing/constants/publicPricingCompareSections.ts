import type {
	PublicPricingCompareRowDefinition,
	PublicPricingCompareRowId
} from '$lib/billing/constants/publicPricingCatalog';

export type PublicPricingCompareSectionId =
	| 'publish'
	| 'collaborate'
	| 'automate'
	| 'list'
	| 'curate'
	| 'generate'
	| 'analyze'
	| 'support';

export const PUBLIC_PRICING_COMPARE_SECTION_ORDER: readonly PublicPricingCompareSectionId[] = [
	'publish',
	'collaborate',
	'automate',
	'list',
	'curate',
	'generate',
	'analyze',
	'support'
] as const;

export const PUBLIC_PRICING_COMPARE_SECTION_LABELS: Record<
	PublicPricingCompareSectionId,
	string
> = {
	publish: 'Publish',
	collaborate: 'Collaborate',
	automate: 'Automate',
	list: 'List',
	curate: 'Curate',
	generate: 'Generate',
	analyze: 'Analyze',
	support: 'Support'
};

/**
 * Compare-table category per catalog row (`PUBLIC_PRICING_COMPARE_ROWS`).
 * Grouped in `PUBLIC_PRICING_COMPARE_SECTION_ORDER` — add new rows under the right block.
 */
export const PUBLIC_PRICING_COMPARE_ROW_SECTION: Record<
	PublicPricingCompareRowId,
	PublicPricingCompareSectionId
> = {
	// Publish
	posts_per_month: 'publish',
	official_api: 'publish',
	multi_channel_publishing: 'publish',
	post_delays: 'publish',
	post_comments: 'publish',
	repeated_posts: 'publish',

	// Collaborate
	workspaces: 'collaborate',
	channels: 'collaborate',
	team_members: 'collaborate',
	cloud_storage: 'collaborate',
	share_post_preview: 'collaborate',
	group_management: 'collaborate',

	// Automate
	public_api: 'automate',
	oauth_apps: 'automate',
	mcp_server: 'automate',
	browser_extension: 'automate',
	agent_integrations: 'automate',
	internal_plugs: 'automate',
	cross_account_plugs: 'automate',
	global_plugs: 'automate',
	cross_posting: 'automate',

	// List
	directory_business_profiles: 'list',
	directory_extension_autofill: 'list',
	directory_submission_tracking: 'list',
	directory_profile_variants: 'list',
	directory_catalog_dr: 'list',

	// Curate
	skill_builder: 'curate',
	photo_editor: 'curate',
	calendar_views: 'curate',
	kanban_views: 'curate',
	file_manager: 'curate',
	reusable_templates: 'curate',
	reusable_signatures: 'curate',
	smart_filter: 'curate',
	dark_light_mode: 'curate',

	// Generate
	ai_writer: 'generate',
	ai_summarizer: 'generate',

	// Analyze
	analytics: 'analyze',
	directory_analytics: 'analyze',
	directory_competitor_domains: 'analyze',

	// Support
	help_articles: 'support',
	email_support: 'support',
	discord_chat: 'support',
	community: 'support'
};

export function publicPricingCompareSectionForRow(
	row: Pick<PublicPricingCompareRowDefinition, 'id'>
): PublicPricingCompareSectionId {
	return PUBLIC_PRICING_COMPARE_ROW_SECTION[row.id];
}

/** In-page fragment for the compare table (`PublicPricingCompareSection`). */
export const PUBLIC_PRICING_COMPARE_TABLE_FRAGMENT_ID = 'pricing-compare';

/** JSON-LD `@id` suffixes and DOM `id` prefix for segmented compare headers. */
export const PUBLIC_PRICING_COMPARE_SCHEMA_FRAGMENT_SUFFIX = {
	sectionsItemList: 'pricing-compare-sections',
	tableOfContents: 'pricing-compare-toc',
	featuresItemList: 'pricing-compare-features'
} as const;

export function publicPricingCompareSectionFragmentId(
	sectionId: PublicPricingCompareSectionId
): string {
	return `pricing-compare-${sectionId}`;
}

export function groupPublicPricingCompareRowsBySection(
	rows: readonly PublicPricingCompareRowDefinition[]
): Map<PublicPricingCompareSectionId, PublicPricingCompareRowDefinition[]> {
	const bySection = new Map<PublicPricingCompareSectionId, PublicPricingCompareRowDefinition[]>();
	for (const sectionId of PUBLIC_PRICING_COMPARE_SECTION_ORDER) {
		bySection.set(sectionId, []);
	}
	for (const row of rows) {
		const sectionId = publicPricingCompareSectionForRow(row);
		bySection.get(sectionId)?.push(row);
	}
	return bySection;
}