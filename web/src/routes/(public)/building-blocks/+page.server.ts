import { loadBuildingBlocksHubPage } from '$lib/listings/server/loadBuildingBlocksHubPage.server';

export const ssr = true;

export async function load(event) {
	return loadBuildingBlocksHubPage(event);
}