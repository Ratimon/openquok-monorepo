import type {
	ExtensionCardViewModel,
	ExtensionCategoryViewModel,
	ListingViewModel,
	StackCardViewModel
} from '$lib/listings/GetListing.presenter.svelte';
import type { GetListingPresenter } from '$lib/listings/GetListing.presenter.svelte';
import type {
	ListingProgrammerModel,
	ListingRepository,
	ListingUpsertProgrammerModel
} from '$lib/listings/Listing.repository.svelte';
import type { ExtensionsTagFilterViewModel } from '$lib/listings/listing.types';
import type { GetBillingPresenter } from '$lib/billing/GetBilling.presenter.svelte';

import { isPaidSubscriptionTier } from 'openquok-common';

export type AccountExtensionsBookmarkMutationViewModel =
	| { ok: true; bookmarked: boolean }
	| { ok: false; error: string };

export type AccountExploreListingKindFilter = 'all' | 'extension' | 'stack';

export type AccountExploreFilters = {
	search: string;
	category: string | null;
	tags: string[];
	tagGroup: string | null;
	listingKind: AccountExploreListingKindFilter;
	bookmarkedOnly: boolean;
};

export type AccountListingCollectionItemViewModel = {
	id: string;
	slug: string;
	title: string;
	subtitle: string;
	initials: string;
	logoImageUrl: string | null;
	listingKind: 'extension' | 'stack';
	extensionType: string | null;
	isUserPublished?: boolean;
	isAdminPublished?: boolean;
};

const DEFAULT_EXPLORE_FILTERS: AccountExploreFilters = {
	search: '',
	category: null,
	tags: [],
	tagGroup: null,
	listingKind: 'all',
	bookmarkedOnly: false
};

function listingInitials(title: string): string {
	const trimmed = title.trim();
	if (!trimmed) return '?';
	const parts = trimmed.split(/\s+/).filter(Boolean);
	if (parts.length >= 2) {
		return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
	}
	return trimmed.slice(0, 2).toUpperCase();
}

function mutationPmToVm(
	pm: ListingUpsertProgrammerModel,
	bookmarked: boolean
): AccountExtensionsBookmarkMutationViewModel {
	if (!pm.ok) return { ok: false, error: pm.error };
	return { ok: true, bookmarked };
}

function extensionSubtitle(extensionType: string | null): string {
	if (extensionType === 'mcp') return 'MCP extension';
	if (extensionType === 'skills') return 'Skills extension';
	if (extensionType === 'both') return 'Skills & MCP';
	return 'Extension';
}

function stackSubtitle(memberCount: number): string {
	const label = memberCount === 1 ? 'extension' : 'extensions';
	return `${memberCount} ${label}`;
}

function ownExtensionSubtitle(listing: ListingViewModel): string {
	return extensionSubtitle(listing.extensionType);
}

function ownListingSubtitle(listing: ListingViewModel, memberCount?: number): string {
	if (listing.listingKind === 'stack') {
		if (memberCount != null) return stackSubtitle(memberCount);
		return 'Stack';
	}
	return ownExtensionSubtitle(listing);
}

function toCollectionItemFromExtensionVm(
	extension: ExtensionCardViewModel,
	subtitle: string
): AccountListingCollectionItemViewModel {
	return {
		id: extension.id,
		slug: extension.slug,
		title: extension.title,
		subtitle,
		initials: listingInitials(extension.title),
		logoImageUrl: extension.logoImageUrl,
		listingKind: 'extension',
		extensionType: extension.extensionType
	};
}

function toCollectionItemFromStackVm(
	stack: StackCardViewModel,
	subtitle: string
): AccountListingCollectionItemViewModel {
	return {
		id: stack.id,
		slug: stack.slug,
		title: stack.title,
		subtitle,
		initials: listingInitials(stack.title),
		logoImageUrl: stack.logoImageUrl,
		listingKind: 'stack',
		extensionType: null
	};
}

function listingPmToViewModel(listing: ListingProgrammerModel): ListingViewModel {
	return {
		id: listing.id,
		title: listing.title,
		description: listing.description,
		excerpt: listing.excerpt,
		slug: listing.slug,
		listingKind: listing.listingKind,
		extensionType: listing.extensionType,
		categoryName: listing.category?.name ?? null,
		isOfficial: listing.isOfficial,
		isUserPublished: listing.isUserPublished,
		isAdminPublished: listing.isAdminPublished,
		logoImageUrl: listing.logoImageUrl,
		defaultImageUrl: listing.defaultImageUrl,
		content: listing.content,
		createdAt: listing.createdAt
	};
}

function toCollectionItemFromOwnListing(
	listing: ListingViewModel,
	memberCount?: number
): AccountListingCollectionItemViewModel {
	const subtitle = ownListingSubtitle(listing, memberCount);
	return {
		id: listing.id,
		slug: listing.slug,
		title: listing.title,
		subtitle,
		initials: listingInitials(listing.title),
		logoImageUrl: listing.logoImageUrl,
		listingKind: listing.listingKind === 'stack' ? 'stack' : 'extension',
		extensionType: listing.extensionType,
		isUserPublished: listing.isUserPublished,
		isAdminPublished: listing.isAdminPublished
	};
}

function stackToTagFilterExtensionVm(stack: StackCardViewModel): ExtensionCardViewModel {
	return {
		id: stack.id,
		title: stack.title,
		slug: stack.slug,
		excerpt: stack.excerpt,
		description: stack.description,
		logoImageUrl: stack.logoImageUrl,
		defaultImageUrl: null,
		extensionType: null,
		installCommandSkills: null,
		installCommandMcp: null,
		clickUrlSkills: null,
		clickUrlMcp: null,
		mcpTools: [],
		skillCommands: [],
		mcpServerConfig: null,
		isOfficial: false,
		likes: stack.likes,
		views: stack.views,
		createdAt: stack.createdAt,
		category: stack.category,
		tags: stack.tags
	};
}

function filterStacksByExploreFilters(
	stacks: StackCardViewModel[],
	filters: AccountExploreFilters,
	tagFilterVm?: ExtensionsTagFilterViewModel
): StackCardViewModel[] {
	let rows = [...stacks];

	if (filters.search.trim()) {
		const q = filters.search.trim().toLowerCase();
		rows = rows.filter(
			(row) =>
				row.title.toLowerCase().includes(q) ||
				(row.excerpt ?? '').toLowerCase().includes(q) ||
				(row.description ?? '').toLowerCase().includes(q)
		);
	}

	if (filters.category) {
		rows = rows.filter((row) => row.category?.slug === filters.category);
	}

	const selectedTagSlugs = new Set(filters.tags);
	if (selectedTagSlugs.size > 0) {
		rows = rows.filter((row) => row.tags.some((tag) => selectedTagSlugs.has(tag.slug)));
	} else if (filters.tagGroup && tagFilterVm) {
		const groupTagSlugs = new Set(
			tagFilterVm.groups.find((group) => group.slug === filters.tagGroup)?.tagSlugs ?? []
		);
		if (groupTagSlugs.size > 0) {
			rows = rows.filter((row) => row.tags.some((tag) => groupTagSlugs.has(tag.slug)));
		}
	}

	rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
	return rows;
}

export class ProtectedAccountExtensionsPagePresenter {
	public exploreExtensionCardsVm: ExtensionCardViewModel[] = $state([]);
	public exploreStackCardsVm: StackCardViewModel[] = $state([]);
	public exploreCategoriesVm: ExtensionCategoryViewModel[] = $state([]);
	public exploreTagFilterVm: ExtensionsTagFilterViewModel = $state({
		groups: [],
		tags: [],
		totalCount: 0
	});
	public exploreFilters: AccountExploreFilters = $state({ ...DEFAULT_EXPLORE_FILTERS });
	public loadingExplore = $state(false);

	public bookmarkedExtensionsVm: AccountListingCollectionItemViewModel[] = $state([]);
	public bookmarkedStacksVm: AccountListingCollectionItemViewModel[] = $state([]);
	public ownExtensionsVm: AccountListingCollectionItemViewModel[] = $state([]);
	public ownStacksVm: AccountListingCollectionItemViewModel[] = $state([]);
	public loadingBookmarks = $state(false);
	public loadingOwn = $state(false);
	public bookmarksPaidEnabled = $state<boolean | null>(null);
	public togglingBookmarkId = $state<string | null>(null);
	public selectedExtensionIds = $state<string[]>([]);

	constructor(
		private readonly getListingPresenter: GetListingPresenter,
		private readonly listingRepository: ListingRepository,
		private readonly getBillingPresenter: GetBillingPresenter
	) {}

	get bookmarkCount(): number {
		return this.bookmarkedExtensionsVm.length + this.bookmarkedStacksVm.length;
	}

	get selectedExtensionCount(): number {
		return this.selectedExtensionIds.length;
	}

	get filteredExploreExtensionsVm(): AccountListingCollectionItemViewModel[] {
		return this.applyExploreFiltersToExtensions();
	}

	get filteredExploreStacksVm(): AccountListingCollectionItemViewModel[] {
		return this.applyExploreFiltersToStacks();
	}

	get showExploreExtensions(): boolean {
		const kind = this.exploreFilters.listingKind;
		return kind === 'all' || kind === 'extension';
	}

	get showExploreStacks(): boolean {
		const kind = this.exploreFilters.listingKind;
		return kind === 'all' || kind === 'stack';
	}

	isBookmarked(listingId: string): boolean {
		return (
			this.bookmarkedExtensionsVm.some((row) => row.id === listingId) ||
			this.bookmarkedStacksVm.some((row) => row.id === listingId)
		);
	}

	isExtensionSelected(listingId: string): boolean {
		return this.selectedExtensionIds.includes(listingId);
	}

	toggleExtensionSelection(listingId: string): void {
		if (this.selectedExtensionIds.includes(listingId)) {
			this.selectedExtensionIds = this.selectedExtensionIds.filter((id) => id !== listingId);
			return;
		}
		this.selectedExtensionIds = [...this.selectedExtensionIds, listingId];
	}

	clearExtensionSelection(): void {
		this.selectedExtensionIds = [];
	}

	setExploreFilters(overrides: Partial<AccountExploreFilters>): void {
		this.exploreFilters = { ...this.exploreFilters, ...overrides };
	}

	toggleExploreTag(tagSlug: string): void {
		const tags = new Set(this.exploreFilters.tags);
		if (tags.has(tagSlug)) tags.delete(tagSlug);
		else tags.add(tagSlug);
		this.setExploreFilters({ tags: [...tags], tagGroup: null });
	}

	clearExploreFilters(): void {
		this.exploreFilters = { ...DEFAULT_EXPLORE_FILTERS };
	}

	getSelectedExtensions(): AccountListingCollectionItemViewModel[] {
		const selected = new Set(this.selectedExtensionIds);
		const pool = [
			...this.filteredExploreExtensionsVm,
			...this.bookmarkedExtensionsVm,
			...this.ownExtensionsVm
		];
		const seen = new Set<string>();
		return pool.filter((item) => {
			if (item.listingKind !== 'extension' || !selected.has(item.id) || seen.has(item.id)) {
				return false;
			}
			seen.add(item.id);
			return true;
		});
	}

	removeOwnListing(listingId: string): void {
		this.ownExtensionsVm = this.ownExtensionsVm.filter((row) => row.id !== listingId);
		this.ownStacksVm = this.ownStacksVm.filter((row) => row.id !== listingId);
		this.selectedExtensionIds = this.selectedExtensionIds.filter((id) => id !== listingId);
	}

	async loadBillingGateStateless(): Promise<boolean> {
		const vm = await this.getBillingPresenter.loadOwnedAccountBillingVmStateless();
		const paid = vm ? isPaidSubscriptionTier(vm.tier) : false;
		this.bookmarksPaidEnabled = paid;
		return paid;
	}

	async loadExploreCatalog(): Promise<void> {
		this.loadingExplore = true;
		try {
			const [extensionsResult, stacksResult, categories, tagsCatalog] = await Promise.all([
				this.listingRepository.getPublishedListings({
					limit: 500,
					skip: 0,
					listingKind: 'extension'
				}),
				this.listingRepository.getPublishedListings({
					limit: 500,
					skip: 0,
					listingKind: 'stack'
				}),
				this.listingRepository.getActiveCategories(),
				this.listingRepository.getAllTags()
			]);

			this.exploreExtensionCardsVm = extensionsResult.listings.map((listing) =>
				this.getListingPresenter.toExtensionCardVmStateless(listing)
			);
			this.exploreStackCardsVm = stacksResult.listings.map((listing) =>
				this.getListingPresenter.toStackCardVmStateless(listing)
			);
			this.exploreCategoriesVm = categories.map((category) => ({
				id: category.id,
				name: category.name,
				slug: category.slug
			}));
			this.exploreTagFilterVm = this.getListingPresenter.buildExtensionsTagFilterVm({
				tagsCatalog,
				extensions: [
					...this.exploreExtensionCardsVm,
					...this.exploreStackCardsVm.map(stackToTagFilterExtensionVm)
				]
			});
		} finally {
			this.loadingExplore = false;
		}
	}

	async loadBookmarks(): Promise<void> {
		if (this.bookmarksPaidEnabled !== true) return;
		this.loadingBookmarks = true;
		try {
			const listings = await this.listingRepository.getMyBookmarks();
			const extensions: AccountListingCollectionItemViewModel[] = [];
			const stacks: AccountListingCollectionItemViewModel[] = [];

			for (const listing of listings) {
				if (listing.listingKind === 'stack') {
					const stackVm = this.getListingPresenter.toStackCardVmStateless(listing);
					stacks.push(
						toCollectionItemFromStackVm(stackVm, stackSubtitle(stackVm.memberCount))
					);
				} else {
					const extensionVm = this.getListingPresenter.toExtensionCardVmStateless(listing);
					extensions.push(
						toCollectionItemFromExtensionVm(
							extensionVm,
							extensionSubtitle(extensionVm.extensionType)
						)
					);
				}
			}

			this.bookmarkedExtensionsVm = extensions;
			this.bookmarkedStacksVm = stacks;
		} finally {
			this.loadingBookmarks = false;
		}
	}

	async loadOwnListings(): Promise<void> {
		this.loadingOwn = true;
		try {
			const [extensionsResult, stacksResult] = await Promise.all([
				this.listingRepository.getMyListings({ listingKind: 'extension' }),
				this.listingRepository.getMyListings({ listingKind: 'stack' })
			]);
			this.ownExtensionsVm = extensionsResult.listings.map((listing) =>
				toCollectionItemFromOwnListing(listingPmToViewModel(listing))
			);
			this.ownStacksVm = stacksResult.listings.map((listing) =>
				toCollectionItemFromOwnListing(
					listingPmToViewModel(listing),
					listing.stackMembers?.length ?? 0
				)
			);
		} finally {
			this.loadingOwn = false;
		}
	}

	async toggleBookmark(listingId: string, bookmarked: boolean): Promise<AccountExtensionsBookmarkMutationViewModel> {
		this.togglingBookmarkId = listingId;
		try {
			const resultPm = bookmarked
				? await this.listingRepository.addBookmark(listingId)
				: await this.listingRepository.removeBookmark(listingId);
			const resultVm = mutationPmToVm(resultPm, bookmarked);
			if (resultVm.ok) {
				if (bookmarked) {
					await this.loadBookmarks();
				} else {
					this.bookmarkedExtensionsVm = this.bookmarkedExtensionsVm.filter((row) => row.id !== listingId);
					this.bookmarkedStacksVm = this.bookmarkedStacksVm.filter((row) => row.id !== listingId);
				}
			}
			return resultVm;
		} finally {
			this.togglingBookmarkId = null;
		}
	}

	async deleteOwnListing(listingId: string): Promise<{ ok: boolean; error?: string }> {
		const result = await this.listingRepository.deleteMyListing(listingId);
		if (result.ok) {
			this.removeOwnListing(listingId);
			return { ok: true };
		}
		return { ok: false, error: result.error };
	}

	async unpublishOwnListing(listingId: string): Promise<{ ok: boolean; error?: string }> {
		const result = await this.listingRepository.unpublishMyListing(listingId);
		if (result.ok) {
			this.markOwnListingUnpublished(listingId);
			return { ok: true };
		}
		return { ok: false, error: result.error };
	}

	markOwnListingUnpublished(listingId: string): void {
		const patchItems = (items: AccountListingCollectionItemViewModel[]) =>
			items.map((item) =>
				item.id === listingId
					? { ...item, isUserPublished: false, isAdminPublished: false }
					: item
			);
		this.ownExtensionsVm = patchItems(this.ownExtensionsVm);
		this.ownStacksVm = patchItems(this.ownStacksVm);
	}

	private bookmarkedIdSet(): Set<string> {
		return new Set(
			[...this.bookmarkedExtensionsVm, ...this.bookmarkedStacksVm].map((item) => item.id)
		);
	}

	private applyBookmarkedOnly<T extends { id: string }>(rows: T[]): T[] {
		if (!this.exploreFilters.bookmarkedOnly) return rows;
		const bookmarkedIds = this.bookmarkedIdSet();
		return rows.filter((row) => bookmarkedIds.has(row.id));
	}

	private applyExploreFiltersToExtensions(): AccountListingCollectionItemViewModel[] {
		const hubFilters = {
			type: 'all' as const,
			sort: 'newest' as const,
			search: this.exploreFilters.search || undefined,
			category: this.exploreFilters.category ?? undefined,
			tags: this.exploreFilters.tags.length ? this.exploreFilters.tags : undefined,
			tagGroup: this.exploreFilters.tagGroup ?? undefined
		};
		const filtered = this.getListingPresenter.filterAndSortExtensions(
			this.exploreExtensionCardsVm,
			hubFilters,
			this.exploreTagFilterVm
		);
		return this.applyBookmarkedOnly(filtered).map((extension) =>
			toCollectionItemFromExtensionVm(
				extension,
				extension.category?.name ?? extensionSubtitle(extension.extensionType)
			)
		);
	}

	private applyExploreFiltersToStacks(): AccountListingCollectionItemViewModel[] {
		const filtered = filterStacksByExploreFilters(
			this.exploreStackCardsVm,
			this.exploreFilters,
			this.exploreTagFilterVm
		);
		return this.applyBookmarkedOnly(filtered).map((stack) =>
			toCollectionItemFromStackVm(
				stack,
				stack.category?.name ?? stackSubtitle(stack.memberCount)
			)
		);
	}
}
