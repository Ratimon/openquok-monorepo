/**
 * Per-channel `/channels/{slug}` landing VMs (`{slug}Channel` exports).
 *
 * Register new slugs in `../seeds.ts`. Shared types, bento IDs, and SEO helpers live in the parent `catalog/` folder.
 */

export { blueskyChannel } from '$lib/content/constants/channels/catalog/platforms/bluesky';
export { devtoChannel } from '$lib/content/constants/channels/catalog/platforms/devto';
export { facebookChannel } from '$lib/content/constants/channels/catalog/platforms/facebook';
export { instagramChannel } from '$lib/content/constants/channels/catalog/platforms/instagram';
export { linkedinChannel } from '$lib/content/constants/channels/catalog/platforms/linkedin';
export { threadsChannel } from '$lib/content/constants/channels/catalog/platforms/threads';
export { tiktokChannel } from '$lib/content/constants/channels/catalog/platforms/tiktok';
export { xChannel } from '$lib/content/constants/channels/catalog/platforms/x';
export { youtubeChannel } from '$lib/content/constants/channels/catalog/platforms/youtube';
