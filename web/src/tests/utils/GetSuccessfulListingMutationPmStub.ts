import type { ListingUpsertProgrammerModel } from '$lib/listings/Listing.repository.svelte';

export function GetSuccessfulListingMutationPmStub(): ListingUpsertProgrammerModel {
	return { ok: true };
}
