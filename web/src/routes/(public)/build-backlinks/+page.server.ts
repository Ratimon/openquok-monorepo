import { loadBuildBacklinksHubPage } from '$lib/link-directory/server/loadBuildBacklinksHubPage.server';

export const ssr = true;

export async function load(event) {
	return loadBuildBacklinksHubPage(event);
}
