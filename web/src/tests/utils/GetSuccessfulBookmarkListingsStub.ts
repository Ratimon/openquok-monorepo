import type { ListingProgrammerModel } from '$lib/listings/Listing.repository.svelte';

/** Minimal bookmark rows for `getMyBookmarks` presenter tests. */
export function GetSuccessfulBookmarkListingsStub(): Pick<ListingProgrammerModel, 'id'>[] {
	return [{ id: 'stack-1' }, { id: 'stack-2' }];
}
