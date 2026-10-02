import type { LinkDirectoryRepository } from '$lib/link-directory/LinkDirectory.repository';

import { describe, it, expect, vi, beforeEach } from 'vitest';

import { PublicBuildBacklinksBookmarksPresenter } from '$lib/link-directory/PublicBuildBacklinksBookmarks.presenter.svelte';
import { mergeBuildBacklinksBookmarkSlugs } from '$lib/link-directory/utils/mergeBuildBacklinksBookmarkSlugs';

describe('mergeBuildBacklinksBookmarkSlugs', () => {
	it('keeps server order and appends local-only slugs', () => {
		expect(mergeBuildBacklinksBookmarkSlugs(['reddit', 'bluesky'], ['uneed', 'reddit'])).toEqual([
			'reddit',
			'bluesky',
			'uneed'
		]);
	});
});

describe('PublicBuildBacklinksBookmarksPresenter', () => {
	let repository: LinkDirectoryRepository;
	let presenter: PublicBuildBacklinksBookmarksPresenter;

	beforeEach(() => {
		repository = {
			getMyBookmarks: vi.fn(),
			replaceMyBookmarks: vi.fn(),
			reorderMyBookmarks: vi.fn(),
			getPublishedSiteBySlug: vi.fn()
		} as unknown as LinkDirectoryRepository;

		presenter = new PublicBuildBacklinksBookmarksPresenter(repository);
	});

	it('merges local bookmarks into server on authenticated hydrate', async () => {
		const getItem = vi.fn().mockReturnValue(
			JSON.stringify([{ slug: 'uneed', siteId: '11111111-1111-4111-8111-111111111111' }])
		);
		const removeItem = vi.fn();
		vi.stubGlobal('localStorage', { getItem, setItem: vi.fn(), removeItem });

		(repository.getMyBookmarks as ReturnType<typeof vi.fn>).mockResolvedValue([
			{
				id: 'b1',
				siteId: '22222222-2222-4222-8222-222222222222',
				sortOrder: 0,
				createdAt: '',
				site: { slug: 'reddit', id: '22222222-2222-4222-8222-222222222222' }
			}
		]);

		(repository.replaceMyBookmarks as ReturnType<typeof vi.fn>).mockResolvedValue({
			ok: true,
			bookmarks: [
				{
					id: 'b1',
					siteId: '22222222-2222-4222-8222-222222222222',
					sortOrder: 0,
					createdAt: '',
					site: { slug: 'reddit', id: '22222222-2222-4222-8222-222222222222' }
				},
				{
					id: 'b2',
					siteId: '11111111-1111-4111-8111-111111111111',
					sortOrder: 1,
					createdAt: '',
					site: { slug: 'uneed', id: '11111111-1111-4111-8111-111111111111' }
				}
			]
		});

		await presenter.hydrate(true);

		expect(repository.replaceMyBookmarks).toHaveBeenCalledWith(
			[
				'22222222-2222-4222-8222-222222222222',
				'11111111-1111-4111-8111-111111111111'
			],
			undefined
		);
		expect(removeItem).toHaveBeenCalled();
		expect(presenter.orderedSlugs).toEqual(['reddit', 'uneed']);

		vi.unstubAllGlobals();
	});
});
