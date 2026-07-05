import { loadBuildingBlocksHubPage } from '$lib/listings/utils/loadBuildingBlocksHubPage.server';

export const ssr = true;

export async function load(event) {
	return loadBuildingBlocksHubPage(event);
}