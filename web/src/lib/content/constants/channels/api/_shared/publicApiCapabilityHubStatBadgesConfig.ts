import type { PublicLandingHeroStatBadge } from '$lib/content/constants/marketing/publicLandingHeroStatBadges';
import type { PublicApiCapability } from '$lib/content/constants/channels/api/_shared/types';

const PUBLIC_API_POSTING_HUB_HERO_STAT_BADGES: readonly PublicLandingHeroStatBadge[] = [
	{ id: 'sdk', value: 'Node SDK', label: 'Typed REST calls' },
	{ id: 'mcp', value: 'MCP tools', label: 'Schedule from chat' },
	{ id: 'oauth', value: 'OAuth apps', label: 'User consent' },
	{ id: 'publish', value: 'Publish now', label: 'POST /public/posts' }
];

const PUBLIC_API_SCHEDULING_HUB_HERO_STAT_BADGES: readonly PublicLandingHeroStatBadge[] = [
	{ id: 'sdk', value: 'Node SDK', label: 'Typed REST calls' },
	{ id: 'mcp', value: 'MCP tools', label: 'Schedule from chat' },
	{ id: 'oauth', value: 'OAuth apps', label: 'User consent' },
	{ id: 'schedule', value: 'Queue ahead', label: 'Calendar-ready posts' }
];

export function getPublicApiHubLandingHeroStatBadges(
	capability: PublicApiCapability
): readonly PublicLandingHeroStatBadge[] {
	return capability === 'posting'
		? PUBLIC_API_POSTING_HUB_HERO_STAT_BADGES
		: PUBLIC_API_SCHEDULING_HUB_HERO_STAT_BADGES;
}
