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
			getMySavedSites: vi.fn(),
			replaceMySavedSites: vi.fn(),
			reorderMySavedSites: vi.fn(),
			setSavedSiteOutreachCompletion: vi.fn(),
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

		(repository.getMySavedSites as ReturnType<typeof vi.fn>).mockResolvedValue([
			{
				id: 'b1',
				siteId: '22222222-2222-4222-8222-222222222222',
				sortOrder: 0,
				createdAt: '',
				site: { slug: 'reddit', id: '22222222-2222-4222-8222-222222222222' }
			}
		]);

		(repository.replaceMySavedSites as ReturnType<typeof vi.fn>).mockResolvedValue({
			ok: true,
			savedSites: [
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

		expect(repository.replaceMySavedSites).toHaveBeenCalledWith(
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

	it('toggles completion locally without calling the API until saveShortlist', async () => {
		const siteId = '22222222-2222-4222-8222-222222222222';
		(repository.getMySavedSites as ReturnType<typeof vi.fn>).mockResolvedValue([
			{
				id: 'b1',
				siteId,
				sortOrder: 0,
				createdAt: '',
				outreachCompletedAt: null,
				site: { slug: 'reddit', id: siteId, title: 'Reddit' }
			}
		]);

		await presenter.hydrate(true);

		(repository.setSavedSiteOutreachCompletion as ReturnType<typeof vi.fn>).mockResolvedValue({
			ok: true,
			savedSites: [
				{
					id: 'b1',
					siteId,
					sortOrder: 0,
					createdAt: '',
					outreachCompletedAt: '2026-03-01T00:00:00.000Z',
					site: { slug: 'reddit', id: siteId, title: 'Reddit' }
				}
			]
		});

		const toggleResult = presenter.toggleCompleted('reddit');

		expect(toggleResult.ok).toBe(true);
		expect(repository.setSavedSiteOutreachCompletion).not.toHaveBeenCalled();
		expect(presenter.isCompleted('reddit')).toBe(true);
		expect(presenter.hasUnsavedShortlistChanges()).toBe(true);

		(repository.getMySavedSites as ReturnType<typeof vi.fn>).mockResolvedValue([
			{
				id: 'b1',
				siteId,
				sortOrder: 0,
				createdAt: '',
				outreachCompletedAt: '2026-03-01T00:00:00.000Z',
				site: { slug: 'reddit', id: siteId, title: 'Reddit' }
			}
		]);

		const saveResult = await presenter.saveShortlist();
		expect(saveResult.ok).toBe(true);
		expect(repository.setSavedSiteOutreachCompletion).toHaveBeenCalledWith(siteId, true, undefined);
		expect(presenter.hasUnsavedShortlistChanges()).toBe(false);
	});

	it('returns sign-in error when toggling completion while logged out', async () => {
		await presenter.hydrate(false);

		const result = await presenter.toggleCompleted('reddit');

		expect(result).toEqual({ ok: false, error: 'Sign in to track progress.' });
		expect(repository.setSavedSiteOutreachCompletion).not.toHaveBeenCalled();
	});

	it('reorders locally without calling the API until saveShortlist', async () => {
		const redditId = '22222222-2222-4222-8222-222222222222';
		const githubId = '33333333-3333-4333-8333-333333333333';
		(repository.getMySavedSites as ReturnType<typeof vi.fn>).mockResolvedValue([
			{
				id: 'b1',
				siteId: redditId,
				sortOrder: 0,
				createdAt: '',
				site: { slug: 'reddit', id: redditId, title: 'Reddit' }
			},
			{
				id: 'b2',
				siteId: githubId,
				sortOrder: 1,
				createdAt: '',
				site: { slug: 'github', id: githubId, title: 'GitHub' }
			}
		]);

		await presenter.hydrate(true);

		presenter.moveBookmark('github', 'up');
		expect(presenter.orderedSlugs).toEqual(['github', 'reddit']);
		expect(presenter.hasUnsavedOrderChanges()).toBe(true);
		expect(repository.reorderMySavedSites).not.toHaveBeenCalled();

		(repository.reorderMySavedSites as ReturnType<typeof vi.fn>).mockResolvedValue({
			ok: true,
			savedSites: [
				{
					id: 'b2',
					siteId: githubId,
					sortOrder: 0,
					createdAt: '',
					site: { slug: 'github', id: githubId, title: 'GitHub' }
				},
				{
					id: 'b1',
					siteId: redditId,
					sortOrder: 1,
					createdAt: '',
					site: { slug: 'reddit', id: redditId, title: 'Reddit' }
				}
			]
		});

		const saveResult = await presenter.saveShortlist();
		expect(saveResult.ok).toBe(true);
		expect(repository.reorderMySavedSites).toHaveBeenCalledWith([githubId, redditId], undefined);
		expect(presenter.hasUnsavedShortlistChanges()).toBe(false);
	});
});
