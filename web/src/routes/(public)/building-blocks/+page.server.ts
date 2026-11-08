import { loadBuildingBlocksHubPage } from '$lib/area-public/server/loadBuildingBlocksHubPage.server';

export const ssr = true;

export async function load(event) {
	return loadBuildingBlocksHubPage(event);
}