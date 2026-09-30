/**
 * Per-channel **tool surface** copy (Tier 3 pSEO).
 *
 * Edit marketing copy in `{slug}.ts` (`{slug}ToolSurfaceMeta`). Benchmark
 * calculator rows still come from `best-time-to-post/constants/benchmarkSlots.ts`.
 * Overrides are built in `shared/createChannelToolSurfaceOverrides.ts` and
 * registered via the maps below.
 */
import type { ChannelToolContentOverridesBySlug } from '$lib/content/constants/channels/tools/shared/channelToolContentOverride.types';

import {
	TOOL_SURFACE_CHANNEL_META,
	TOOL_SURFACE_CHANNEL_SLUGS
} from '$lib/content/constants/channels/tool-surfaces/shared/channelToolSurfaceMetaBySlug';
import {
	createBestTimeContentOverride,
	createPhotoEditorContentOverride,
	createSkillBuilderContentOverride
} from '$lib/content/constants/channels/tool-surfaces/shared/createChannelToolSurfaceOverrides';

export type { ToolSurfaceChannelMeta } from '$lib/content/constants/channels/tool-surfaces/shared/channelToolSurfaceMeta.types';

export { blueskyToolSurfaceMeta } from '$lib/content/constants/channels/tool-surfaces/bluesky';
export { devtoToolSurfaceMeta } from '$lib/content/constants/channels/tool-surfaces/devto';
export { facebookToolSurfaceMeta } from '$lib/content/constants/channels/tool-surfaces/facebook';
export { instagramToolSurfaceMeta } from '$lib/content/constants/channels/tool-surfaces/instagram';
export { linkedinToolSurfaceMeta } from '$lib/content/constants/channels/tool-surfaces/linkedin';
export { threadsToolSurfaceMeta } from '$lib/content/constants/channels/tool-surfaces/threads';
export { tiktokToolSurfaceMeta } from '$lib/content/constants/channels/tool-surfaces/tiktok';
export { xToolSurfaceMeta } from '$lib/content/constants/channels/tool-surfaces/x';
export { youtubeToolSurfaceMeta } from '$lib/content/constants/channels/tool-surfaces/youtube';

export { TOOL_SURFACE_CHANNEL_SLUGS, TOOL_SURFACE_CHANNEL_META };

function overridesBySlug<T>(build: (slug: string) => T): Record<string, T> {
	return Object.fromEntries(TOOL_SURFACE_CHANNEL_SLUGS.map((slug) => [slug, build(slug)]));
}

export const bestTimeToolContentOverridesBySlug: ChannelToolContentOverridesBySlug =
	overridesBySlug(createBestTimeContentOverride);

export const photoEditorToolContentOverridesBySlug: ChannelToolContentOverridesBySlug =
	overridesBySlug(createPhotoEditorContentOverride);

export const skillBuilderToolContentOverridesBySlug: ChannelToolContentOverridesBySlug =
	overridesBySlug(createSkillBuilderContentOverride);

/** `/tools/best-time-to-post/bluesky` — convenience re-export */
export const blueskyBestTimeContentOverride = bestTimeToolContentOverridesBySlug.bluesky;

/** `/tools/photo-editor/bluesky` */
export const blueskyPhotoEditorContentOverride = photoEditorToolContentOverridesBySlug.bluesky;

/** `/tools/skill-builder/bluesky` */
export const blueskySkillBuilderContentOverride = skillBuilderToolContentOverridesBySlug.bluesky;
