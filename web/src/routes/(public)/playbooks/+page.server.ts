import { loadPlaybooksHubPage } from '$lib/area-public/server/loadPlaybooksHubPage.server';

export const ssr = true;

export async function load(event) {
	return loadPlaybooksHubPage(event);
}
