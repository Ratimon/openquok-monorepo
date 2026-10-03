import { LISTING_BOOKMARKS_STORAGE_KEY } from '$lib/listings/constants/listingBookmarksStorage';

import type { ListingBookmarkKind } from '$lib/listings/GetListing.presenter.svelte';

export type ListingLocalBookmarkEntry = {
	listingId: string;
	slug?: string;
	listingKind?: ListingBookmarkKind;
};

function isListingKind(value: unknown): value is ListingBookmarkKind {
	return value === 'extension' || value === 'stack';
}

function parseStoredEntries(raw: string | null): ListingLocalBookmarkEntry[] {
	if (!raw) return [];
	try {
		const parsed = JSON.parse(raw) as unknown;
		if (!Array.isArray(parsed)) return [];
		const entries: ListingLocalBookmarkEntry[] = [];
		for (const item of parsed) {
			if (
				item &&
				typeof item === 'object' &&
				'listingId' in item &&
				typeof (item as { listingId: unknown }).listingId === 'string'
			) {
				const listingId = (item as { listingId: string }).listingId.trim();
				if (!listingId) continue;

				const entry: ListingLocalBookmarkEntry = { listingId };
				if ('slug' in item && typeof (item as { slug: unknown }).slug === 'string') {
					const slug = (item as { slug: string }).slug.trim();
					if (slug) entry.slug = slug;
				}
				if ('listingKind' in item && isListingKind((item as { listingKind: unknown }).listingKind)) {
					entry.listingKind = (item as { listingKind: ListingBookmarkKind }).listingKind;
				}
				entries.push(entry);
			}
		}
		return entries;
	} catch {
		return [];
	}
}

export function readListingLocalBookmarks(): ListingLocalBookmarkEntry[] {
	if (typeof localStorage === 'undefined') return [];
	return parseStoredEntries(localStorage.getItem(LISTING_BOOKMARKS_STORAGE_KEY));
}

export function writeListingLocalBookmarks(entries: ListingLocalBookmarkEntry[]): void {
	if (typeof localStorage === 'undefined') return;
	try {
		if (entries.length === 0) {
			localStorage.removeItem(LISTING_BOOKMARKS_STORAGE_KEY);
			return;
		}
		localStorage.setItem(LISTING_BOOKMARKS_STORAGE_KEY, JSON.stringify(entries));
	} catch {
		// Best-effort persistence.
	}
}

export function clearListingLocalBookmarks(): void {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.removeItem(LISTING_BOOKMARKS_STORAGE_KEY);
	} catch {
		// ignore
	}
}
