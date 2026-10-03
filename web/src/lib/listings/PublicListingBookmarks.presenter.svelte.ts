import type { ListingRepository } from '$lib/listings/Listing.repository.svelte';
import type { ListingBookmarkKind } from '$lib/listings/GetListing.presenter.svelte';

import {
	clearListingLocalBookmarks,
	readListingLocalBookmarks,
	writeListingLocalBookmarks,
	type ListingLocalBookmarkEntry
} from '$lib/listings/utils/listingBookmarksLocalStorage';

export type ListingBookmarkToggleResult =
	| { ok: true; bookmarked: boolean }
	| { ok: false; error: string };

export class PublicListingBookmarksPresenter {
	public bookmarkedIds = $state<string[]>([]);
	public isLoggedIn = $state(false);
	public hydrating = $state(false);

	private metaByListingId = new Map<string, { slug?: string; listingKind?: ListingBookmarkKind }>();

	constructor(private readonly listingRepository: ListingRepository) {}

	isBookmarked(listingId: string): boolean {
		return this.bookmarkedIds.includes(listingId);
	}

	bookmarkCountForListingKind(kind: ListingBookmarkKind): number {
		return this.bookmarkedIds.filter((id) => this.resolveListingKind(id) === kind).length;
	}

	bookmarkedIdsMap(): Record<string, boolean> {
		return Object.fromEntries(this.bookmarkedIds.map((id) => [id, true]));
	}

	getLocalBookmarkEntries(): ListingLocalBookmarkEntry[] {
		return this.bookmarkedIds.map((listingId) => {
			const meta = this.metaByListingId.get(listingId);
			return {
				listingId,
				...(meta?.slug ? { slug: meta.slug } : {}),
				...(meta?.listingKind ? { listingKind: meta.listingKind } : {})
			};
		});
	}

	async hydrate(isLoggedIn: boolean, fetch?: typeof globalThis.fetch): Promise<void> {
		this.isLoggedIn = isLoggedIn;
		this.hydrating = true;
		try {
			if (isLoggedIn) {
				await this.hydrateAuthenticated(fetch);
			} else {
				this.applyLocalState(readListingLocalBookmarks());
			}
		} finally {
			this.hydrating = false;
		}
	}

	async toggleBookmark(
		params: {
			listingId: string;
			slug?: string;
			listingKind?: ListingBookmarkKind;
		},
		fetch?: typeof globalThis.fetch
	): Promise<ListingBookmarkToggleResult> {
		const { listingId, slug, listingKind } = params;
		this.rememberMeta(listingId, { slug, listingKind });

		const nextBookmarked = !this.isBookmarked(listingId);
		if (nextBookmarked) {
			this.bookmarkedIds = [...this.bookmarkedIds, listingId];
		} else {
			this.bookmarkedIds = this.bookmarkedIds.filter((id) => id !== listingId);
			this.metaByListingId.delete(listingId);
		}

		if (this.isLoggedIn) {
			const resultPm = nextBookmarked
				? await this.listingRepository.addBookmark(listingId, fetch)
				: await this.listingRepository.removeBookmark(listingId, fetch);
			if (!resultPm.ok) {
				await this.hydrateAuthenticated(fetch);
				return { ok: false, error: resultPm.error ?? 'Failed to save bookmark.' };
			}
			return { ok: true, bookmarked: nextBookmarked };
		}

		writeListingLocalBookmarks(this.getLocalBookmarkEntries());
		return { ok: true, bookmarked: nextBookmarked };
	}

	private async hydrateAuthenticated(fetch?: typeof globalThis.fetch): Promise<void> {
		const localEntries = readListingLocalBookmarks();
		const serverRows = await this.listingRepository.getMyBookmarks(fetch);
		for (const row of serverRows) {
			this.rememberMeta(row.id, {
				listingKind: row.listingKind === 'stack' ? 'stack' : 'extension',
				slug: row.slug
			});
		}
		let serverIds = serverRows.map((row) => row.id);
		const serverIdSet = new Set(serverIds);

		if (localEntries.length > 0) {
			for (const entry of localEntries) {
				this.rememberMeta(entry.listingId, {
					slug: entry.slug,
					listingKind: entry.listingKind
				});
			}

			for (const entry of localEntries) {
				if (serverIdSet.has(entry.listingId)) continue;
				const resultPm = await this.listingRepository.addBookmark(entry.listingId, fetch);
				if (resultPm.ok) {
					serverIds = [...serverIds, entry.listingId];
					serverIdSet.add(entry.listingId);
				}
			}

			clearListingLocalBookmarks();
		}

		this.applyServerIds(serverIds);
	}

	private applyServerIds(ids: string[]): void {
		const unique = [...new Set(ids.filter((id) => id.trim()))];
		this.bookmarkedIds = unique;
	}

	private applyLocalState(entries: ListingLocalBookmarkEntry[]): void {
		this.metaByListingId.clear();
		for (const entry of entries) {
			this.rememberMeta(entry.listingId, {
				slug: entry.slug,
				listingKind: entry.listingKind
			});
		}
		this.bookmarkedIds = entries.map((entry) => entry.listingId);
	}

	private resolveListingKind(listingId: string): ListingBookmarkKind | undefined {
		return this.metaByListingId.get(listingId)?.listingKind;
	}

	private rememberMeta(
		listingId: string,
		meta: { slug?: string; listingKind?: ListingBookmarkKind }
	): void {
		const slug = meta.slug?.trim();
		const listingKind = meta.listingKind;
		if (!slug && !listingKind) return;
		const existing = this.metaByListingId.get(listingId) ?? {};
		this.metaByListingId.set(listingId, {
			...existing,
			...(slug ? { slug } : {}),
			...(listingKind ? { listingKind } : {})
		});
	}
}
