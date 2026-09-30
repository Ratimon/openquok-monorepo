/**
 * Channel catalog (Tier 1 pSEO) — `/channels/{slug}`.
 *
 * | Path | Role |
 * | --- | --- |
 * | `platforms/{slug}.ts` | Full `PublicChannelLandingPageViewModel` (`{slug}Channel` export) |
 * | `seeds.ts` | `PUBLIC_CHANNEL_LANDING_PAGES` registry (hub, footer, tool derivations) |
 * | `types.ts`, `shared.ts`, `feature-bento.ts` | Shared VM types, SEO keywords, bento id union |
 *
 * Runtime getters and FAQ append live in `../index.ts` (`getPublicChannelBySlug`, …).
 *
 * Not here: shared marketing chrome (`../../landing/`), `/self-hosting` copy (`../../self-hosting/landing.ts`),
 * API marketing (`../api/posting/platforms/`), or tool-only patches (`../tool-surfaces/`).
 */

export type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels/catalog/types';
export { SHARED_CHANNEL_SEO_KEYWORDS } from '$lib/content/constants/channels/catalog/shared';
export {
	PUBLIC_CHANNEL_LANDING_PAGES,
	listPublicChannelLandingSeedsForFooter
} from '$lib/content/constants/channels/catalog/seeds';
export * from '$lib/content/constants/channels/catalog/platforms/index';
