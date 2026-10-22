import { directorySiteKeyFromProviderSlug } from 'openquok-common';

import type { AutoLaunchDestinationDto } from '$lib/auto-launch/auto-launch.types';
import type { BrandedIconName } from '$data/icons';
import { resolveLinkDirectorySiteLogoDisplayUrl } from '$lib/link-directory/utils/linkDirectoryLogoImages';

export { directorySiteKeyFromProviderSlug };

/** Static logos under `web/static/icons/link-directory/{slug}.svg` (dev + prod). */
const BUNDLED_DIRECTORY_LOGO_SLUGS = new Set<string>(['peerpush', 'uneed']);

const DIRECTORY_SITE_BRANDED_ICONS: Record<string, BrandedIconName> = {
	peerpush: 'PeerPush',
	uneed: 'Uneed'
};

export type LinkDirectorySiteBranding = {
	title: string;
	logoUrl: string | null;
};

/** One Add Channel tile per directory site (groups extension destinations by provider slug prefix). */
export type DirectoryAddChannelTileVm = {
	siteKey: string;
	label: string;
	logoUrl: string | null;
	brandedIconName: BrandedIconName | null;
	providerSlugPrefix: string;
	dialogTitle: string;
};

export function directoryAddChannelBrandedIconName(siteKey: string): BrandedIconName | null {
	return DIRECTORY_SITE_BRANDED_ICONS[siteKey] ?? null;
}

function resolveDirectoryAddChannelLogoUrl(
	siteKey: string,
	rawLogo: string | null
): string | null {
	if (BUNDLED_DIRECTORY_LOGO_SLUGS.has(siteKey)) {
		return `/icons/link-directory/${siteKey}.svg`;
	}
	return rawLogo ? resolveLinkDirectorySiteLogoDisplayUrl(rawLogo) : null;
}

/** Short label when no uploaded logo is available (e.g. Uneed → `Un`). */
export function directoryAddChannelLogoFallbackLabel(siteLabel: string): string {
	const trimmed = siteLabel.trim();
	if (!trimmed) return '??';
	const words = trimmed.split(/\s+/).filter(Boolean);
	if (words.length >= 2) {
		return `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase();
	}
	return trimmed.slice(0, 2).toUpperCase();
}

export function buildDirectoryAddChannelTiles(
	destinations: AutoLaunchDestinationDto[],
	sitesBySlug: ReadonlyMap<string, LinkDirectorySiteBranding>
): DirectoryAddChannelTileVm[] {
	const extensionDestinations = destinations.filter((d) => d.submissionPath === 'extension');
	const bySiteKey = new Map<string, AutoLaunchDestinationDto[]>();

	const publishedSlugs = [...sitesBySlug.keys()];

	for (const destination of extensionDestinations) {
		const siteKey = directorySiteKeyFromProviderSlug(destination.providerSlug, publishedSlugs);
		if (!siteKey) continue;
		const bucket = bySiteKey.get(siteKey) ?? [];
		bucket.push(destination);
		bySiteKey.set(siteKey, bucket);
	}

	const tiles: DirectoryAddChannelTileVm[] = [];

	for (const [siteKey, siteDestinations] of bySiteKey) {
		const site = sitesBySlug.get(siteKey);
		const label = site?.title ?? siteDestinations[0]?.siteTitle ?? siteKey;
		const rawLogo = site?.logoUrl ?? null;
		tiles.push({
			siteKey,
			label,
			logoUrl: resolveDirectoryAddChannelLogoUrl(siteKey, rawLogo),
			brandedIconName: directoryAddChannelBrandedIconName(siteKey),
			providerSlugPrefix: `${siteKey}-`,
			dialogTitle: `${label} launches`
		});
	}

	tiles.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
	return tiles;
}
