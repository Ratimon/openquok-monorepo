import { directorySiteKeyFromProviderSlug } from 'openquok-common';

import type { AutoLaunchDestinationDto } from '$lib/auto-launch/auto-launch.types';

export type DirectorySiteCatalogSnapshot = {
	siteDomainRating: number | null;
	siteMetricsUpdatedAt: string | null;
};

export function indexDirectoryCatalogBySiteKey(
	destinations: readonly AutoLaunchDestinationDto[]
): Map<string, DirectorySiteCatalogSnapshot> {
	const bySite = new Map<string, DirectorySiteCatalogSnapshot>();
	for (const destination of destinations) {
		const siteKey = directorySiteKeyFromProviderSlug(destination.providerSlug);
		if (bySite.has(siteKey)) continue;
		bySite.set(siteKey, {
			siteDomainRating: destination.siteDomainRating,
			siteMetricsUpdatedAt: destination.siteMetricsUpdatedAt
		});
	}
	return bySite;
}

export function indexDestinationsByProviderSlug(
	destinations: readonly AutoLaunchDestinationDto[]
): Map<string, AutoLaunchDestinationDto> {
	const map = new Map<string, AutoLaunchDestinationDto>();
	for (const destination of destinations) {
		map.set(destination.providerSlug, destination);
	}
	return map;
}

export function formatCatalogDomainRating(value: number | null | undefined): string {
	if (value == null || !Number.isFinite(value)) return '—';
	return String(Math.round(value));
}

export function formatCatalogMetricsUpdatedAt(iso: string | null | undefined): string {
	if (!iso?.trim()) return '—';
	const parsed = Date.parse(iso);
	if (!Number.isFinite(parsed)) return '—';
	return new Intl.DateTimeFormat(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	}).format(new Date(parsed));
}
