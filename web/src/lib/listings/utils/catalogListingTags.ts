import { listPublicAgentsForHub } from '$lib/content/constants/agents';
import { listPublicChannelsForHub } from '$lib/content/constants/channels';

/** Seeded listing-tag group names (secret-admin; not SQL-created per product). */
export const CATALOG_LISTING_TAG_GROUP_AUTONOMOUS_AGENTS = 'Autonomous agents';
export const CATALOG_LISTING_TAG_GROUP_SOCIAL_PLATFORMS = 'Social platforms';
export const CATALOG_LISTING_TAG_GROUP_VIDEOS = 'Videos';
export const CATALOG_LISTING_TAG_GROUP_PHOTOS = 'Photos';
export const CATALOG_LISTING_TAG_GROUP_TEXT = 'Text';

export type CatalogListingTagSource = 'agents' | 'channels';

/** Paste-ready listing tag for a public `/agents` host or `/channels` platform. */
export type CatalogListingTagDraftViewModel = {
	name: string;
	slug: string;
	description: string;
	groupNames: string[];
	source: CatalogListingTagSource;
};

const VIDEO_CHANNEL_SLUGS = new Set(['youtube', 'tiktok']);
const PHOTO_CHANNEL_SLUGS = new Set(['instagram']);
const TEXT_CHANNEL_SLUGS = new Set(['threads', 'linkedin', 'x', 'facebook', 'devto']);

function uniqueGroupNames(names: string[]): string[] {
	return [...new Set(names)];
}

function channelGroupNames(slug: string): string[] {
	const groups = [CATALOG_LISTING_TAG_GROUP_SOCIAL_PLATFORMS];
	if (VIDEO_CHANNEL_SLUGS.has(slug)) groups.push(CATALOG_LISTING_TAG_GROUP_VIDEOS);
	if (PHOTO_CHANNEL_SLUGS.has(slug)) groups.push(CATALOG_LISTING_TAG_GROUP_PHOTOS);
	if (TEXT_CHANNEL_SLUGS.has(slug)) groups.push(CATALOG_LISTING_TAG_GROUP_TEXT);
	return uniqueGroupNames(groups);
}

export function listExpectedCatalogListingTags(): CatalogListingTagDraftViewModel[] {
	const agentTags: CatalogListingTagDraftViewModel[] = listPublicAgentsForHub().map((agent) => ({
		name: agent.agentLabel,
		slug: agent.slug,
		description: `Skills and CLI workflows for ${agent.agentLabel} agents.`,
		groupNames: [CATALOG_LISTING_TAG_GROUP_AUTONOMOUS_AGENTS],
		source: 'agents'
	}));

	const channelTags: CatalogListingTagDraftViewModel[] = listPublicChannelsForHub().map((channel) => ({
		name: channel.platformLabel,
		slug: channel.slug,
		description: `${channel.platformLabel} channel integrations and workflows.`,
		groupNames: channelGroupNames(channel.slug),
		source: 'channels'
	}));

	return [...agentTags, ...channelTags].sort((a, b) => a.name.localeCompare(b.name));
}

export function filterMissingCatalogListingTags(
	existingTags: ReadonlyArray<{ slug: string }>
): CatalogListingTagDraftViewModel[] {
	const existingSlugs = new Set(
		existingTags.map((tag) => tag.slug.trim().toLowerCase()).filter(Boolean)
	);
	return listExpectedCatalogListingTags().filter((tag) => !existingSlugs.has(tag.slug));
}
