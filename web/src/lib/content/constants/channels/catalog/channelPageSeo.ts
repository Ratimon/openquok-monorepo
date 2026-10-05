import type { AudienceCard } from '$lib/ui/templates/WhoIsFor.svelte';

import { icons } from '$data/icons';
import {
	AGENT_HOST_FIRST_CLASS_CHANNEL_BADGE,
	getPrimaryAgentHostSlugForChannelPage,
	isFirstClassChannelForHost
} from '$lib/content/constants/agents/ecosystems';
import type { PublicChannelSiblingGridItem } from '$lib/content/utils/buildPublicChannelSiblingGridCopy';

const CARD_CONTAINER_CLASS = 'h-full min-h-[18rem]';

/**
 * Agent hosts to list first on `/channels/{slug}` integration grids
 * (inverse of agent-host “first-class channel” emphasis).
 */
export const CHANNEL_PAGE_PINNED_AGENT_SLUGS: Readonly<
	Partial<Record<string, readonly string[]>>
> = {
	x: ['grok-bot', 'openclaw', 'dots'],
	facebook: ['meta-muse', 'openclaw', 'dots'],
	instagram: ['meta-muse', 'openclaw', 'dots'],
	threads: ['meta-muse', 'openclaw', 'dots'],
	devto: ['thinkrail', 'openclaw', 'hermes']
};

export function buildPublicChannelAudienceTitle(platformLabel: string): string {
	const label = platformLabel.trim();
	return label.length > 0 ? `Who schedules ${label} with OpenQuok?` : 'Who schedules with OpenQuok?';
}

export function buildPublicChannelAudienceSubtitle(platformLabel: string): string {
	const label = platformLabel.trim();
	return label.length > 0 ? `Built for ${label}` : 'Built for social scheduling';
}

/** Optional fourth WhoIsFor card on `/channels/{slug}` when the seed has no tailored card. */
export function buildPublicChannelAgentAudienceTailoredCard(
	platformLabel: string
): AudienceCard {
	const label = platformLabel.trim() || 'social posts';
	return {
		iconName: icons.CustomizedDrawnRobot.name,
		iconClass: 'text-violet-400',
		title: 'Agent & MCP operators',
		description: `Schedule ${label} from OpenClaw, Grok Bot, Cursor, or ChatGPT MCP. Open each agent landing page for ${label} CLI examples and setup FAQs.`,
		containerClass: CARD_CONTAINER_CLASS
	};
}

export function sortChannelPageAgentIntegrations<T extends { slug: string }>(
	items: readonly T[],
	channelSlug: string
): T[] {
	const pinned = CHANNEL_PAGE_PINNED_AGENT_SLUGS[channelSlug.trim().toLowerCase()];
	if (!pinned?.length) return [...items];

	const rank = new Map(pinned.map((slug, index) => [slug.trim().toLowerCase(), index]));
	return [...items].sort((a, b) => {
		const aRank = rank.get(a.slug.trim().toLowerCase()) ?? Number.POSITIVE_INFINITY;
		const bRank = rank.get(b.slug.trim().toLowerCase()) ?? Number.POSITIVE_INFINITY;
		if (aRank !== bRank) return aRank - bRank;
		return 0;
	});
}

/** Badge Meta Muse first-class siblings on `/channels/{facebook|instagram|threads}`. */
export function enrichPublicChannelSiblingGridItems(
	items: readonly PublicChannelSiblingGridItem[],
	activeChannelSlug: string
): PublicChannelSiblingGridItem[] {
	const hostSlug = getPrimaryAgentHostSlugForChannelPage(activeChannelSlug);
	if (!hostSlug) return [...items];

	return items.map((item) => {
		if (
			item.slug !== activeChannelSlug &&
			isFirstClassChannelForHost(hostSlug, item.slug) &&
			item.available
		) {
			return { ...item, badgeLabel: AGENT_HOST_FIRST_CLASS_CHANNEL_BADGE };
		}
		return item;
	});
}
