import { autoLaunchRepository } from '$lib/auto-launch';
import {
	buildDirectoryAddChannelTiles,
	type DirectoryAddChannelTileVm
} from '$lib/auto-launch/buildDirectoryAddChannelTiles';
import { linkDirectoryRepository } from '$lib/link-directory';

export async function fetchDirectoryAddChannelTiles(): Promise<DirectoryAddChannelTileVm[]> {
	try {
		const [destinations, publishedSites] = await Promise.all([
			autoLaunchRepository.listDestinations(),
			linkDirectoryRepository.getPublishedSites({ limit: 500, skip: 0 })
		]);
		const sitesBySlug = new Map(
			publishedSites.sites.map((site) => [
				site.slug,
				{ title: site.title, logoUrl: site.logoUrl }
			])
		);
		return buildDirectoryAddChannelTiles(destinations, sitesBySlug);
	} catch {
		return [];
	}
}
