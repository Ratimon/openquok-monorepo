import { publicListingBookmarksPresenter } from '$lib/listings/index';

export async function hydratePublicListingBookmarksForHub(
	isLoggedIn: boolean,
	fetch?: typeof globalThis.fetch
): Promise<void> {
	await publicListingBookmarksPresenter.hydrate(isLoggedIn, fetch);
}
