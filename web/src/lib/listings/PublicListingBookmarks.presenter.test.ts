import type { ListingRepository } from '$lib/listings/Listing.repository.svelte';

import { describe, it, expect, vi, beforeEach } from 'vitest';

import { PublicListingBookmarksPresenter } from '$lib/listings/PublicListingBookmarks.presenter.svelte';

describe('PublicListingBookmarksPresenter', () => {
	let repository: ListingRepository;
	let presenter: PublicListingBookmarksPresenter;

	const extensionId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
	const stackId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

	beforeEach(() => {
		repository = {
			getMyBookmarks: vi.fn(),
			addBookmark: vi.fn(),
			removeBookmark: vi.fn()
		} as unknown as ListingRepository;

		presenter = new PublicListingBookmarksPresenter(repository);
	});

	it('loads local bookmarks when logged out', async () => {
		const getItem = vi.fn().mockReturnValue(
			JSON.stringify([{ listingId: extensionId, slug: 'my-block', listingKind: 'extension' }])
		);
		vi.stubGlobal('localStorage', { getItem, setItem: vi.fn(), removeItem: vi.fn() });

		await presenter.hydrate(false);

		expect(presenter.isBookmarked(extensionId)).toBe(true);
		expect(presenter.bookmarkedIdsMap()).toEqual({ [extensionId]: true });
		expect(repository.getMyBookmarks).not.toHaveBeenCalled();

		vi.unstubAllGlobals();
	});

	it('syncs server bookmarks for signed-in users without local entries', async () => {
		vi.stubGlobal('localStorage', {
			getItem: vi.fn().mockReturnValue(null),
			setItem: vi.fn(),
			removeItem: vi.fn()
		});

		(repository.getMyBookmarks as ReturnType<typeof vi.fn>).mockResolvedValue([
			{ id: extensionId, listingKind: 'extension' }
		]);

		await presenter.hydrate(true);

		expect(repository.getMyBookmarks).toHaveBeenCalled();
		expect(presenter.bookmarkedIds).toEqual([extensionId]);

		vi.unstubAllGlobals();
	});

	it('merges local bookmarks into server on authenticated hydrate', async () => {
		const getItem = vi.fn().mockReturnValue(JSON.stringify([{ listingId: stackId, listingKind: 'stack' }]));
		const removeItem = vi.fn();
		vi.stubGlobal('localStorage', { getItem, setItem: vi.fn(), removeItem });

		(repository.getMyBookmarks as ReturnType<typeof vi.fn>).mockResolvedValue([
			{ id: extensionId, listingKind: 'extension' }
		]);
		(repository.addBookmark as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });

		await presenter.hydrate(true);

		expect(repository.addBookmark).toHaveBeenCalledWith(stackId, undefined);
		expect(removeItem).toHaveBeenCalled();
		expect(presenter.bookmarkedIds).toEqual([extensionId, stackId]);

		vi.unstubAllGlobals();
	});

	it('persists toggle to localStorage when logged out', async () => {
		const setItem = vi.fn();
		vi.stubGlobal('localStorage', {
			getItem: vi.fn().mockReturnValue(null),
			setItem,
			removeItem: vi.fn()
		});

		await presenter.hydrate(false);

		const result = await presenter.toggleBookmark({
			listingId: extensionId,
			slug: 'saved-block',
			listingKind: 'extension'
		});

		expect(result).toEqual({ ok: true, bookmarked: true });
		expect(setItem).toHaveBeenCalledWith(
			'openquok:listing-bookmarks:v1',
			JSON.stringify([
				{ listingId: extensionId, slug: 'saved-block', listingKind: 'extension' }
			])
		);

		vi.unstubAllGlobals();
	});

	it('calls repository when toggling while signed in', async () => {
		(repository.getMyBookmarks as ReturnType<typeof vi.fn>).mockResolvedValue([]);
		await presenter.hydrate(true);

		(repository.addBookmark as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });

		const result = await presenter.toggleBookmark({ listingId: extensionId });

		expect(result).toEqual({ ok: true, bookmarked: true });
		expect(repository.addBookmark).toHaveBeenCalledWith(extensionId, undefined);
		expect(presenter.isBookmarked(extensionId)).toBe(true);
	});

	it('removes bookmark from localStorage when toggling off while logged out', async () => {
		const setItem = vi.fn();
		const removeItem = vi.fn();
		vi.stubGlobal('localStorage', {
			getItem: vi.fn().mockReturnValue(
				JSON.stringify([{ listingId: extensionId, listingKind: 'extension' }])
			),
			setItem,
			removeItem
		});

		await presenter.hydrate(false);

		const result = await presenter.toggleBookmark({ listingId: extensionId, listingKind: 'extension' });

		expect(result).toEqual({ ok: true, bookmarked: false });
		expect(presenter.isBookmarked(extensionId)).toBe(false);
		expect(removeItem).toHaveBeenCalledWith('openquok:listing-bookmarks:v1');
		expect(repository.addBookmark).not.toHaveBeenCalled();

		vi.unstubAllGlobals();
	});

	it('counts bookmarks per listing kind for sidebar tallies', async () => {
		vi.stubGlobal('localStorage', {
			getItem: vi.fn().mockReturnValue(null),
			setItem: vi.fn(),
			removeItem: vi.fn()
		});

		(repository.getMyBookmarks as ReturnType<typeof vi.fn>).mockResolvedValue([
			{ id: extensionId, listingKind: 'extension' },
			{ id: stackId, listingKind: 'stack' }
		]);

		await presenter.hydrate(true);

		expect(presenter.bookmarkCountForListingKind('extension')).toBe(1);
		expect(presenter.bookmarkCountForListingKind('stack')).toBe(1);
		expect(presenter.bookmarkedIds.length).toBe(2);

		vi.unstubAllGlobals();
	});

	it('does not call addBookmark for local ids already on the server during merge', async () => {
		const getItem = vi.fn().mockReturnValue(
			JSON.stringify([{ listingId: extensionId, listingKind: 'extension' }])
		);
		vi.stubGlobal('localStorage', { getItem, setItem: vi.fn(), removeItem: vi.fn() });

		(repository.getMyBookmarks as ReturnType<typeof vi.fn>).mockResolvedValue([
			{ id: extensionId, listingKind: 'extension' }
		]);

		await presenter.hydrate(true);

		expect(repository.addBookmark).not.toHaveBeenCalled();
		expect(presenter.bookmarkedIds).toEqual([extensionId]);

		vi.unstubAllGlobals();
	});
});
