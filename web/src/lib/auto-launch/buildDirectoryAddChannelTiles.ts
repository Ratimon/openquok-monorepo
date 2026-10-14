import type { AutoLaunchDestinationDto } from '$lib/auto-launch/auto-launch.types';
import { resolveLinkDirectorySiteLogoDisplayUrl } from '$lib/link-directory/utils/linkDirectoryLogoImages';

export type LinkDirectorySiteBranding = {
	title: string;
	logoUrl: string | null;
};

/** One Add Channel tile per directory site (groups extension destinations by provider slug prefix). */
export type DirectoryAddChannelTileVm = {
	siteKey: string;
	label: string;
	logoUrl: string | null;
	providerSlugPrefix: string;
	dialogTitle: string;
};

/**
 * Site key for grouping destinations with `link_directory_sites.slug`.
 * Prefers longest published slug prefix (`product-hunt-launch` + slug `product-hunt` → `product-hunt`).
 */
export function directorySiteKeyFromProviderSlug(
	providerSlug: string,
	publishedSiteSlugs: Iterable<string> = []
): string {
	const trimmed = providerSlug.trim();
	const slugs = [...publishedSiteSlugs].sort((a, b) => b.length - a.length);
	for (const slug of slugs) {
		if (trimmed === slug || trimmed.startsWith(`${slug}-`)) {
			return slug;
		}
	}
	const dash = trimmed.indexOf('-');
	return dash === -1 ? trimmed : trimmed.slice(0, dash);
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
			logoUrl: rawLogo ? resolveLinkDirectorySiteLogoDisplayUrl(rawLogo) : null,
			providerSlugPrefix: `${siteKey}-`,
			dialogTitle: `${label} launches`
		});
	}

	tiles.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
	return tiles;
}
