import type { GetListingPresenter } from '$lib/listings/GetListing.presenter.svelte';
import type { ListingRepository } from '$lib/listings/Listing.repository.svelte';

import { describe, it, expect, vi, beforeAll } from 'vitest';

import {
	PublicPlaybookBySlugPagePresenter,
	PublicPlaybooksPagePresenter
} from '$lib/area-public/PublicPlaybooksPage.presenter.svelte';

import { GetFailedListingMutationPmStub } from '$tests/utils/GetFailedListingMutationPmStub';
import { GetSuccessfulBookmarkListingsStub } from '$tests/utils/GetSuccessfulBookmarkListingsStub';
import { GetSuccessfulListingCommentsStub } from '$tests/utils/GetSuccessfulListingCommentsStub';
import { GetSuccessfulListingMutationPmStub } from '$tests/utils/GetSuccessfulListingMutationPmStub';
import { GetSuccessfulStackDetailStub } from '$tests/utils/GetSuccessfulStackDetailStub';
import { GetSuccessfulStacksHubStub } from '$tests/utils/GetSuccessfulStacksHubStub';

describe('PublicPlaybooksPagePresenter', () => {
	let getListingPresenter: GetListingPresenter;
	let listingRepository: ListingRepository;
	let presenter: PublicPlaybooksPagePresenter;

	beforeAll(() => {
		getListingPresenter = {
			filterAndSortStacks: vi.fn(),
			loadStacksHubStateless: vi.fn(),
			loadPublishedStacksVm: vi.fn()
		} as unknown as GetListingPresenter;

		listingRepository = {
			getMyBookmarks: vi.fn(),
			addBookmark: vi.fn(),
			removeBookmark: vi.fn()
		} as unknown as ListingRepository;

		presenter = new PublicPlaybooksPagePresenter(getListingPresenter, listingRepository);
	});

	describe('parseFiltersFromUrl', () => {
		it('should parse sort and search from query params', () => {
			const filters = presenter.parseFiltersFromUrl(
				new URLSearchParams('sort=popular&search=workflow')
			);

			expect(filters).toEqual({ sort: 'popular', search: 'workflow' });
		});

		it('should default sort to newest when query param is invalid', () => {
			const filters = presenter.parseFiltersFromUrl(new URLSearchParams('sort=invalid'));

			expect(filters).toEqual({ sort: 'newest' });
		});
	});

	describe('buildFilterUrl', () => {
		it('should build category path with sort query', () => {
			const url = presenter.buildFilterUrl(
				{ sort: 'newest', category: 'automation' },
				{ sort: 'popular' }
			);

			expect(url).toBe('/playbooks/categories/automation?sort=popular');
		});
	});

	describe('applyClientFilters', () => {
		it('should delegate stack filtering to GetListingPresenter', () => {
			const hubStub = GetSuccessfulStacksHubStub();
			const filteredStacks = [hubStub.stacks[0]];

			(getListingPresenter.filterAndSortStacks as ReturnType<typeof vi.fn>).mockReturnValue(
				filteredStacks
			);

			const filters = { sort: 'newest' as const, category: 'automation' };
			const result = presenter.applyClientFilters(hubStub.stacks, filters);

			expect(getListingPresenter.filterAndSortStacks).toHaveBeenCalledWith(
				hubStub.stacks,
				filters,
				undefined
			);
			expect(result).toEqual(filteredStacks);
		});
	});

	describe('loadPlaybooksHubStateless', () => {
		it('should load playbooks hub data without mutating presenter state', async () => {
			const hubStub = GetSuccessfulStacksHubStub();

			(getListingPresenter.loadStacksHubStateless as ReturnType<typeof vi.fn>).mockResolvedValue(
				hubStub
			);

			const result = await presenter.loadPlaybooksHubStateless({ limit: 25 });

			expect(getListingPresenter.loadStacksHubStateless).toHaveBeenCalledWith({ limit: 25 });
			expect(result).toEqual(hubStub);
			expect(result.stacks).toHaveLength(2);
			expect(result.totalCount).toBe(2);
		});
	});

	describe('loadPublishedPlaybooksStateless', () => {
		it('should map published stacks to playbooks payload', async () => {
			const hubStub = GetSuccessfulStacksHubStub();

			(getListingPresenter.loadPublishedStacksVm as ReturnType<typeof vi.fn>).mockResolvedValue({
				stacks: hubStub.stacks,
				count: hubStub.totalCount
			});

			const result = await presenter.loadPublishedPlaybooksStateless({
				limit: 10,
				searchTerm: 'workflow'
			});

			expect(getListingPresenter.loadPublishedStacksVm).toHaveBeenCalledWith({
				limit: 10,
				fetch: undefined,
				searchTerm: 'workflow'
			});
			expect(result.playbooks).toEqual(hubStub.stacks);
			expect(result.count).toBe(2);
		});

		it('should default limit to 50 when not provided', async () => {
			(getListingPresenter.loadPublishedStacksVm as ReturnType<typeof vi.fn>).mockResolvedValue({
				stacks: [],
				count: 0
			});

			await presenter.loadPublishedPlaybooksStateless({});

			expect(getListingPresenter.loadPublishedStacksVm).toHaveBeenCalledWith({
				limit: 50,
				fetch: undefined,
				searchTerm: undefined
			});
		});
	});

	describe('loadBookmarkedIdsMap', () => {
		it('should return bookmark id map from repository listings', async () => {
			(listingRepository.getMyBookmarks as ReturnType<typeof vi.fn>).mockResolvedValue(
				GetSuccessfulBookmarkListingsStub()
			);

			const result = await presenter.loadBookmarkedIdsMap();

			expect(listingRepository.getMyBookmarks).toHaveBeenCalledWith(undefined);
			expect(result).toEqual({
				'stack-1': true,
				'stack-2': true
			});
		});
	});

	describe('toggleBookmark', () => {
		it('should add bookmark and return success view model', async () => {
			(listingRepository.addBookmark as ReturnType<typeof vi.fn>).mockResolvedValue(
				GetSuccessfulListingMutationPmStub()
			);

			const result = await presenter.toggleBookmark('stack-1', true);

			expect(listingRepository.addBookmark).toHaveBeenCalledWith('stack-1');
			expect(result).toEqual({ ok: true, bookmarked: true });
		});

		it('should remove bookmark and return success view model', async () => {
			(listingRepository.removeBookmark as ReturnType<typeof vi.fn>).mockResolvedValue(
				GetSuccessfulListingMutationPmStub()
			);

			const result = await presenter.toggleBookmark('stack-1', false);

			expect(listingRepository.removeBookmark).toHaveBeenCalledWith('stack-1');
			expect(result).toEqual({ ok: true, bookmarked: false });
		});

		it('should map repository failure to error view model', async () => {
			(listingRepository.addBookmark as ReturnType<typeof vi.fn>).mockResolvedValue(
				GetFailedListingMutationPmStub('Failed to bookmark extension.')
			);

			const result = await presenter.toggleBookmark('stack-1', true);

			expect(result).toEqual({ ok: false, error: 'Failed to bookmark extension.' });
		});
	});
});

describe('PublicPlaybookBySlugPagePresenter', () => {
	let getListingPresenter: GetListingPresenter;
	let listingRepository: ListingRepository;
	let presenter: PublicPlaybookBySlugPagePresenter;

	beforeAll(() => {
		getListingPresenter = {
			loadPublishedStackBySlugVm: vi.fn(),
			loadListingCommentsVm: vi.fn()
		} as unknown as GetListingPresenter;

		listingRepository = {
			trackView: vi.fn(),
			incrementLikes: vi.fn(),
			createListingComment: vi.fn(),
			upsertListingRating: vi.fn(),
			addBookmark: vi.fn(),
			removeBookmark: vi.fn()
		} as unknown as ListingRepository;

		presenter = new PublicPlaybookBySlugPagePresenter(getListingPresenter, listingRepository);
	});

	describe('loadPlaybookBySlugStateless', () => {
		it('should load playbook detail by slug', async () => {
			const playbookVm = GetSuccessfulStackDetailStub();

			(getListingPresenter.loadPublishedStackBySlugVm as ReturnType<typeof vi.fn>).mockResolvedValue(
				playbookVm
			);

			const result = await presenter.loadPlaybookBySlugStateless({ slug: 'test-playbook' });

			expect(getListingPresenter.loadPublishedStackBySlugVm).toHaveBeenCalledWith(
				'test-playbook',
				undefined
			);
			expect(result).toEqual(playbookVm);
		});

		it('should return null when slug is not found', async () => {
			(getListingPresenter.loadPublishedStackBySlugVm as ReturnType<typeof vi.fn>).mockResolvedValue(
				null
			);

			const result = await presenter.loadPlaybookBySlugStateless({ slug: 'missing-playbook' });

			expect(result).toBeNull();
		});

		it('should return null when user slug does not match owner username', async () => {
			const playbookVm = GetSuccessfulStackDetailStub();

			(getListingPresenter.loadPublishedStackBySlugVm as ReturnType<typeof vi.fn>).mockResolvedValue(
				playbookVm
			);

			const result = await presenter.loadPlaybookBySlugStateless({
				slug: 'test-playbook',
				userSlug: 'other-user'
			});

			expect(result).toBeNull();
		});

		it('should return playbook when user slug matches owner username', async () => {
			const playbookVm = GetSuccessfulStackDetailStub();

			(getListingPresenter.loadPublishedStackBySlugVm as ReturnType<typeof vi.fn>).mockResolvedValue(
				playbookVm
			);

			const result = await presenter.loadPlaybookBySlugStateless({
				slug: 'test-playbook',
				userSlug: 'testuser'
			});

			expect(result).toEqual(playbookVm);
		});
	});

	describe('trackPlaybookView', () => {
		it('should map successful view tracking to ok view model', async () => {
			(listingRepository.trackView as ReturnType<typeof vi.fn>).mockResolvedValue(
				GetSuccessfulListingMutationPmStub()
			);

			const result = await presenter.trackPlaybookView('stack-1');

			expect(listingRepository.trackView).toHaveBeenCalledWith('stack-1');
			expect(result).toEqual({ ok: true });
		});

		it('should map failed view tracking to error view model', async () => {
			(listingRepository.trackView as ReturnType<typeof vi.fn>).mockResolvedValue(
				GetFailedListingMutationPmStub('Failed to record view.')
			);

			const result = await presenter.trackPlaybookView('stack-1');

			expect(result).toEqual({ ok: false, error: 'Failed to record view.' });
		});
	});

	describe('trackPlaybookLike', () => {
		it('should toggle submittingLike while liking and return success view model', async () => {
			(listingRepository.incrementLikes as ReturnType<typeof vi.fn>).mockResolvedValue(
				GetSuccessfulListingMutationPmStub()
			);

			const pending = presenter.trackPlaybookLike('stack-1');
			expect(presenter.submittingLike).toBe(true);

			const result = await pending;

			expect(presenter.submittingLike).toBe(false);
			expect(listingRepository.incrementLikes).toHaveBeenCalledWith('stack-1');
			expect(result).toEqual({ ok: true });
		});
	});

	describe('loadListingCommentsStateless', () => {
		it('should load listing comments for a playbook', async () => {
			const commentsVm = GetSuccessfulListingCommentsStub();

			(getListingPresenter.loadListingCommentsVm as ReturnType<typeof vi.fn>).mockResolvedValue(
				commentsVm
			);

			const result = await presenter.loadListingCommentsStateless({ listingId: 'stack-1' });

			expect(getListingPresenter.loadListingCommentsVm).toHaveBeenCalledWith('stack-1', undefined);
			expect(result).toEqual(commentsVm);
			expect(result).toHaveLength(2);
		});
	});

	describe('submitListingComment', () => {
		it('should submit comment and return success view model', async () => {
			(listingRepository.createListingComment as ReturnType<typeof vi.fn>).mockResolvedValue(
				GetSuccessfulListingMutationPmStub()
			);

			const pending = presenter.submitListingComment({
				listingId: 'stack-1',
				content: 'Nice playbook',
				parentId: null
			});
			expect(presenter.submittingComment).toBe(true);

			const result = await pending;

			expect(presenter.submittingComment).toBe(false);
			expect(listingRepository.createListingComment).toHaveBeenCalledWith({
				listingId: 'stack-1',
				content: 'Nice playbook',
				parentId: null
			});
			expect(result).toEqual({ ok: true });
		});
	});

	describe('submitListingRating', () => {
		it('should submit rating and return success view model', async () => {
			(listingRepository.upsertListingRating as ReturnType<typeof vi.fn>).mockResolvedValue(
				GetSuccessfulListingMutationPmStub()
			);

			const pending = presenter.submitListingRating('stack-1', 5);
			expect(presenter.submittingRating).toBe(true);

			const result = await pending;

			expect(presenter.submittingRating).toBe(false);
			expect(listingRepository.upsertListingRating).toHaveBeenCalledWith('stack-1', 5);
			expect(result).toEqual({ ok: true });
		});
	});

	describe('toggleBookmark', () => {
		it('should add bookmark and include bookmarked flag on success', async () => {
			(listingRepository.addBookmark as ReturnType<typeof vi.fn>).mockResolvedValue(
				GetSuccessfulListingMutationPmStub()
			);

			const pending = presenter.toggleBookmark('stack-1', true);
			expect(presenter.submittingBookmark).toBe(true);

			const result = await pending;

			expect(presenter.submittingBookmark).toBe(false);
			expect(listingRepository.addBookmark).toHaveBeenCalledWith('stack-1');
			expect(result).toEqual({ ok: true, bookmarked: true });
		});

		it('should remove bookmark and include bookmarked flag on success', async () => {
			(listingRepository.removeBookmark as ReturnType<typeof vi.fn>).mockResolvedValue(
				GetSuccessfulListingMutationPmStub()
			);

			const result = await presenter.toggleBookmark('stack-1', false);

			expect(listingRepository.removeBookmark).toHaveBeenCalledWith('stack-1');
			expect(result).toEqual({ ok: true, bookmarked: false });
		});

		it('should return error view model without bookmarked flag on failure', async () => {
			(listingRepository.addBookmark as ReturnType<typeof vi.fn>).mockResolvedValue(
				GetFailedListingMutationPmStub('Failed to bookmark extension.')
			);

			const result = await presenter.toggleBookmark('stack-1', true);

			expect(result).toEqual({ ok: false, error: 'Failed to bookmark extension.' });
		});
	});
});
