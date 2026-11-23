import type { PublicChannelSiblingGridItem } from '$lib/content/utils/buildPublicChannelSiblingGridCopy';
import type { LinkDirectorySiteDto } from '$lib/link-directory/link-directory.types';

import { getRootPathPublicBuildBacklinksSite } from '$lib/area-public/constants/getRootPathPublicBuildBacklinks';
import { resolveBuildBacklinksSiblingGridIcon } from '$lib/link-directory/utils/site/resolveBuildBacklinksSiblingGridIcon';
import { route } from '$lib/utils/path';

export function buildBuildBacklinksCategorySiblingGridItems(
	sites: readonly LinkDirectorySiteDto[]
): PublicChannelSiblingGridItem[] {
	return sites.map((site) => ({
		slug: site.slug,
		platformLabel: site.title.trim(),
		icon: resolveBuildBacklinksSiblingGridIcon(site),
		href: route(getRootPathPublicBuildBacklinksSite(site.slug)),
		available: true
	}));
}