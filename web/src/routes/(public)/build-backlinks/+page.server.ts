import { loadBuildBacklinksHubPage } from '$lib/area-public/server/loadBuildBacklinksHubPage.server';

export const ssr = true;

export async function load(event) {
	return loadBuildBacklinksHubPage(event);
}
