import { alternativetoUploadsAdapter } from './alternativetoUploads.js';
import { devhuntScreenshotsAdapter } from './devhuntScreenshots.js';
import { headingSectionGalleryAdapter } from './headingSectionGallery.js';
import { indiehubUploadsAdapter } from './indiehubUploads.js';
import { startupinspireUploadsAdapter } from './startupinspireUploads.js';
import type { SiteMediaAdapter } from './types.js';

const SITE_MEDIA_ADAPTERS: readonly SiteMediaAdapter[] = [
	alternativetoUploadsAdapter,
	devhuntScreenshotsAdapter,
	headingSectionGalleryAdapter,
	indiehubUploadsAdapter,
	startupinspireUploadsAdapter,
];

export function getActiveSiteMediaAdapter(): SiteMediaAdapter | null {
	for (const adapter of SITE_MEDIA_ADAPTERS) {
		if (adapter.matchesPage()) return adapter;
	}
	return null;
}

export function getSiteMediaAdapterForGalleryPreview(
	field: import('openquok-common').LaunchStepField,
	readRoot: Element | null
): SiteMediaAdapter | null {
	if (field.key !== 'gallery' && !field.profilePath.includes('gallery_urls')) return null;
	for (const adapter of SITE_MEDIA_ADAPTERS) {
		if (!adapter.matchesPage()) continue;
		const section = adapter.resolveGalleryReadRoot(field);
		if (readRoot && section && readRoot !== section) continue;
		return adapter;
	}
	return null;
}