/**
 * Public **social channel** programmatic SEO — canonical import for `/channels` and channel slugs.
 *
 * **pSEO tiers under `channels/`** (see `web-seo-pseo.mdc`):
 * - **Tier 1** — `catalog/platforms/{slug}.ts` + `catalog/seeds.ts` → `/channels/{slug}`
 * - **Tier 2** — `api/posting/platforms/{slug}.ts` → posting/scheduling API marketing
 * - **Tier 3** — `tool-surfaces/{slug}.ts` + `tools/{tool}/general.ts` → `/tools/{tool}/{slug}` patches
 *
 * **Different folders (not channel identity):**
 * - `content/constants/landing/` — shared CTAs, breadcrumbs, who-is-for for `/` and hub chrome
 * - `content/constants/self-hosting/landing.ts` — `/self-hosting` page only (filename is historical)
 *
 * Import `getPublicChannelBySlug` / `listAvailablePublicChannels` from here — not legacy `public*Config` shims.
 */

import type { AudienceCard } from '$lib/ui/templates/WhoIsFor.svelte';

import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels/catalog/types';
import {
	buildPublicChannelAgentAudienceTailoredCard,
	buildPublicChannelAudienceSubtitle,
	buildPublicChannelAudienceTitle
} from '$lib/content/constants/channels/catalog/channelPageSeo';
import {
	appendPublicGeneralFaqItems,
	PUBLIC_CHANNELS_HUB_FAQ_ITEM_IDS
} from '$lib/content/constants/faq';
import {
	applyPublicChannelPageAudienceFirstCardHook,
	buildPublicChannelEcosystemAudienceTailoredCard,
	buildPublicChannelEcosystemFaqItems
} from '$lib/content/constants/agents/ecosystems';
import { PUBLIC_CHANNEL_LANDING_PAGES } from '$lib/content/constants/channels/catalog/seeds';

export * from '$lib/content/constants/channels/catalog/types';
export { SHARED_CHANNEL_SEO_KEYWORDS } from '$lib/content/constants/channels/catalog/shared';
export {
	blueskyChannel,
	devtoChannel,
	facebookChannel,
	instagramChannel,
	linkedinChannel,
	skoolChannel,
	threadsChannel,
	tiktokChannel,
	xChannel,
	youtubeChannel
} from '$lib/content/constants/channels/catalog/platforms/index';
export {
	PUBLIC_CHANNEL_LANDING_PAGES,
	listPublicChannelLandingSeedsForFooter
} from '$lib/content/constants/channels/catalog/seeds';

const channelBySlug = new Map(PUBLIC_CHANNEL_LANDING_PAGES.map((page) => [page.slug, page]));

/** Optional fourth WhoIsFor card from `audienceTailoredCard` on the channel seed. */
export function getPublicChannelAudienceTailoredCard(
	slug: string
): AudienceCard | undefined {
	const key = slug.trim().toLowerCase();
	return channelBySlug.get(key)?.audienceTailoredCard;
}

/** Seed WhoIsFor cards only — excludes `/channels/{slug}` ecosystem merge. */
export function getPublicChannelSeedAudienceCards(slug: string): AudienceCard[] {
	const key = slug.trim().toLowerCase();
	const page = channelBySlug.get(key);
	return page ? [...page.audienceCards] : [];
}

const CHANNEL_AUDIENCE_AGENT_OPERATORS_TITLE = 'Agent operators';

function baseCardsIncludeAgentOperatorsCard(baseCards: readonly AudienceCard[]): boolean {
	return baseCards.some((card) => card.title === CHANNEL_AUDIENCE_AGENT_OPERATORS_TITLE);
}

/** Append tailored fourth card from seed or default agent/MCP card for channel landings. */
export function resolvePublicChannelAudienceCards(
	baseCards: readonly AudienceCard[],
	slug: string,
	platformLabel?: string
): AudienceCard[] {
	const tailoredFromSeed = getPublicChannelAudienceTailoredCard(slug);
	const ecosystemTailored =
		!tailoredFromSeed && platformLabel?.trim()
			? buildPublicChannelEcosystemAudienceTailoredCard(slug, platformLabel)
			: undefined;
	const defaultAgentTailored =
		!tailoredFromSeed &&
		!ecosystemTailored &&
		platformLabel?.trim() &&
		!baseCardsIncludeAgentOperatorsCard(baseCards)
			? buildPublicChannelAgentAudienceTailoredCard(platformLabel)
			: undefined;
	const tailored = tailoredFromSeed ?? ecosystemTailored ?? defaultAgentTailored;
	if (!tailored) return [...baseCards];
	if (baseCards.some((card) => card.title === tailored.title)) {
		return [...baseCards];
	}
	return [...baseCards, tailored];
}

function withChannelPageSeoCopy(
	page: PublicChannelLandingPageViewModel
): PublicChannelLandingPageViewModel {
	return {
		...page,
		audienceSubtitle: page.audienceSubtitle?.trim() || buildPublicChannelAudienceSubtitle(page.platformLabel),
		audienceTitle: buildPublicChannelAudienceTitle(page.platformLabel),
		audienceCards: applyPublicChannelPageAudienceFirstCardHook(
			resolvePublicChannelAudienceCards(page.audienceCards, page.slug, page.platformLabel),
			page.slug,
			page.platformLabel
		)
	};
}

export function getPublicChannelBySlug(slug: string): PublicChannelLandingPageViewModel | undefined {
	const key = slug.trim().toLowerCase();
	const page = channelBySlug.get(key);
	if (!page) return undefined;

	const withSeo = withChannelPageSeoCopy(page);
	const ecosystemFaqs = buildPublicChannelEcosystemFaqItems({
		channelSlug: key,
		platformLabel: withSeo.platformLabel
	});
	const seenFaqTitles = new Set(withSeo.faqItems.map((item) => item.title));
	const prependedFaqs = ecosystemFaqs.filter((item) => !seenFaqTitles.has(item.title));

	return {
		...withSeo,
		faqItems: appendPublicGeneralFaqItems(
			[...prependedFaqs, ...withSeo.faqItems],
			PUBLIC_CHANNELS_HUB_FAQ_ITEM_IDS
		)
	};
}

export function listPublicChannelsForHub(): PublicChannelLandingPageViewModel[] {
	return [...PUBLIC_CHANNEL_LANDING_PAGES];
}

export function listAvailablePublicChannels(): PublicChannelLandingPageViewModel[] {
	return PUBLIC_CHANNEL_LANDING_PAGES.filter((page) => page.available);
}

/** Platform labels for competitor compare tables — includes `comparePlatformLabels` extras. */
export function listAvailablePublicChannelCompareLabels(): string[] {
	const labels: string[] = [];

	for (const channel of listAvailablePublicChannels()) {
		labels.push(channel.platformLabel);
		if (channel.comparePlatformLabels) {
			labels.push(...channel.comparePlatformLabels);
		}
	}

	return labels;
}
