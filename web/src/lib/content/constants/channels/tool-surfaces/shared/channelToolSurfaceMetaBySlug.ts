import { blueskyToolSurfaceMeta } from '$lib/content/constants/channels/tool-surfaces/bluesky';
import { devtoToolSurfaceMeta } from '$lib/content/constants/channels/tool-surfaces/devto';
import { facebookToolSurfaceMeta } from '$lib/content/constants/channels/tool-surfaces/facebook';
import { instagramToolSurfaceMeta } from '$lib/content/constants/channels/tool-surfaces/instagram';
import { linkedinToolSurfaceMeta } from '$lib/content/constants/channels/tool-surfaces/linkedin';
import { threadsToolSurfaceMeta } from '$lib/content/constants/channels/tool-surfaces/threads';
import { tiktokToolSurfaceMeta } from '$lib/content/constants/channels/tool-surfaces/tiktok';
import { xToolSurfaceMeta } from '$lib/content/constants/channels/tool-surfaces/x';
import { skoolToolSurfaceMeta } from '$lib/content/constants/channels/tool-surfaces/skool';
import { youtubeToolSurfaceMeta } from '$lib/content/constants/channels/tool-surfaces/youtube';
import type { ToolSurfaceChannelMeta } from '$lib/content/constants/channels/tool-surfaces/shared/channelToolSurfaceMeta.types';

/** Hub order matches `channels/catalog/seeds.ts`. */
export const TOOL_SURFACE_CHANNEL_SLUGS: readonly string[] = [
	facebookToolSurfaceMeta.slug,
	threadsToolSurfaceMeta.slug,
	instagramToolSurfaceMeta.slug,
	youtubeToolSurfaceMeta.slug,
	tiktokToolSurfaceMeta.slug,
	linkedinToolSurfaceMeta.slug,
	xToolSurfaceMeta.slug,
	blueskyToolSurfaceMeta.slug,
	devtoToolSurfaceMeta.slug,
	skoolToolSurfaceMeta.slug
];

export const TOOL_SURFACE_CHANNEL_META: Record<string, ToolSurfaceChannelMeta> = {
	[facebookToolSurfaceMeta.slug]: facebookToolSurfaceMeta,
	[threadsToolSurfaceMeta.slug]: threadsToolSurfaceMeta,
	[instagramToolSurfaceMeta.slug]: instagramToolSurfaceMeta,
	[youtubeToolSurfaceMeta.slug]: youtubeToolSurfaceMeta,
	[tiktokToolSurfaceMeta.slug]: tiktokToolSurfaceMeta,
	[linkedinToolSurfaceMeta.slug]: linkedinToolSurfaceMeta,
	[xToolSurfaceMeta.slug]: xToolSurfaceMeta,
	[blueskyToolSurfaceMeta.slug]: blueskyToolSurfaceMeta,
	[devtoToolSurfaceMeta.slug]: devtoToolSurfaceMeta,
	[skoolToolSurfaceMeta.slug]: skoolToolSurfaceMeta
};

export function getToolSurfaceChannelMeta(slug: string): ToolSurfaceChannelMeta {
	const key = slug.trim().toLowerCase();
	const meta = TOOL_SURFACE_CHANNEL_META[key];
	if (!meta) {
		throw new Error(`Missing tool surface meta for channel slug: ${slug}`);
	}
	return meta;
}
