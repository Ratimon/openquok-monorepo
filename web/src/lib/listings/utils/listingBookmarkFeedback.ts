import { listingRepository } from '$lib/listings';
import { toast } from '$lib/ui/sonner';

export type ListingBookmarkKind = 'extension' | 'stack';

export type BookmarkToggleResult =
	| { ok: true; bookmarked: boolean }
	| { ok: false; error: string };

export function bookmarkIdsFromListings(listings: { id: string }[]): Record<string, boolean> {
	return Object.fromEntries(listings.map((listing) => [listing.id, true]));
}

export async function loadBookmarkedIdsMap(): Promise<Record<string, boolean>> {
	const listings = await listingRepository.getMyBookmarks();
	return bookmarkIdsFromListings(listings);
}

export function showListingBookmarkToast(
	bookmarked: boolean,
	listingKind: ListingBookmarkKind = 'extension'
): void {
	const label = listingKind === 'stack' ? 'Stack' : 'Extension';
	if (bookmarked) {
		toast.success(`${label} bookmarked. View it under Viral Formats → Explore → Bookmarked.`);
	} else {
		toast.success('Bookmark removed.');
	}
}

export async function toggleListingBookmark(
	listingId: string,
	nextBookmarked: boolean,
	options?: { listingKind?: ListingBookmarkKind; showToast?: boolean }
): Promise<BookmarkToggleResult> {
	const resultPm = nextBookmarked
		? await listingRepository.addBookmark(listingId)
		: await listingRepository.removeBookmark(listingId);

	if (!resultPm.ok) {
		toast.error(resultPm.error);
		return { ok: false, error: resultPm.error };
	}

	if (options?.showToast !== false) {
		showListingBookmarkToast(nextBookmarked, options?.listingKind ?? 'extension');
	}

	return { ok: true, bookmarked: nextBookmarked };
}
