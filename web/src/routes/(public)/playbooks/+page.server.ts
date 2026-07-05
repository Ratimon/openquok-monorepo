import { loadPlaybooksHubPage } from '$lib/listings/utils/loadPlaybooksHubPage.server';

export const ssr = true;

export async function load(event) {
	return loadPlaybooksHubPage(event);
}
