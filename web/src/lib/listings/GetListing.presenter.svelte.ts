import type {
	AdminListingActivityVm,
	AdminListingCommentVm,
	ExtensionSort,
	ExtensionTypeFilter,
	ExtensionsHubFilters,
	ExtensionsTagFilterViewModel
} from '$lib/listings/listing.types';
import type {
	AdminListingActivityProgrammerModel,
	AdminListingCommentProgrammerModel,
	ListingCategoryProgrammerModel,
	ListingProgrammerModel,
	ListingRepository,
	ListingTagProgrammerModel,
	McpToolProgrammerModel,
	McpTransport
} from '$lib/listings/Listing.repository.svelte';
import type { ListingFaqItemProgrammerModel } from '$lib/listings/listing.types';
import { buildExtensionsTagFilterVm } from '$lib/listings/utils/buildExtensionsTagFilterVm';

/** View model for admin listings list (e.g. extensions manager page). */
export interface ListingViewModel {
	id: string;
	title: string;
	description: string | null;
	excerpt: string | null;
	slug: string;
	listingKind: string;
	extensionType: string | null;
	categoryName: string | null;
	isOfficial: boolean;
	isUserPublished: boolean;
	isAdminPublished: boolean;
	logoImageUrl: string | null;
	defaultImageUrl: string | null;
	content: string | null;
	createdAt: string;
}

/** View model for admin listing editor detail. */
export type ListingEditorViewModel = ListingProgrammerModel;

/** Public listing card view model (extensions overview). */
export interface ListingPublicViewModel {
	id: string;
	title: string;
	slug: string;
	excerpt: string | null;
	description: string | null;
	logoImageUrl: string | null;
	defaultImageUrl: string | null;
	extensionType: string | null;
	installCommandSkills: string | null;
	installCommandMcp: string | null;
	clickUrlSkills: string | null;
	clickUrlMcp: string | null;
	mcpServerConfig: Record<string, unknown> | null;
	isOfficial: boolean;
	likes: number;
	views: number;
	createdAt: string;
	category: { id: string; name: string; slug: string } | null;
	tags: Array<{ id: string; name: string; slug: string }>;
}

/** Public listing detail view model (extension slug page). */
export interface ListingDetailPublicViewModel {
	id: string;
	title: string;
	slug: string;
	excerpt: string | null;
	description: string | null;
	descriptionSkills: string | null;
	descriptionMcp: string | null;
	clickUrl: string | null;
	clickUrlSkills: string | null;
	clickUrlMcp: string | null;
	content: string | null;
	contentSkills: string | null;
	contentMcp: string | null;
	logoImageUrl: string | null;
	defaultImageUrl: string | null;
	listingImageUrls: string[];
	extensionType: string | null;
	installCommandSkills: string | null;
	installCommandMcp: string | null;
	isOfficial: boolean;
	sourceRepoUrl: string | null;
	skillSourceUrl: string | null;
	skillName: string | null;
	skillMetadata: Record<string, unknown> | null;
	sourceSyncedAt: string | null;
	sourceContentHash: string | null;
	license: string | null;
	version: string | null;
	mcpTools: McpToolProgrammerModel[];
	mcpTransport: McpTransport | null;
	mcpServerConfig: Record<string, unknown> | null;
	likes: number;
	views: number;
	clicks: number;
	bookmarkCount: number;
	averageRating: number;
	ratingsCount: number;
	createdAt: string;
	publishedAt: string | null;
	updatedAt: string | null;
	schemaType: string | null;
	schemaJson: Record<string, unknown> | null;
	faq: ListingFaqItemProgrammerModel[] | null;
	category: { id: string; name: string; slug: string; parentPath?: string } | null;
	tags: Array<{ id: string; name: string; slug: string }>;
	owner: {
		id: string;
		fullName: string | null;
		username: string | null;
		avatarUrl: string | null;
		tagLine: string | null;
	} | null;
}

/** Alias used by extensions hub UI templates. */
export type ExtensionCardViewModel = ListingPublicViewModel;

/** Alias used by extension detail page. */
export type ExtensionDetailViewModel = ListingDetailPublicViewModel;

/** Category row for extensions hub sidebar. */
export interface ExtensionCategoryViewModel {
	id: string;
	name: string;
	slug: string;
}

/** Stats summary for extensions hub header. */
export interface ExtensionsHubStatsViewModel {
	official: number;
	community: number;
	categories: number;
}

/** Full extensions hub load payload. */
export interface ExtensionsHubViewModel {
	metaTitle: string;
	metaDescription: string;
	extensions: ExtensionCardViewModel[];
	categories: ExtensionCategoryViewModel[];
	totalCount: number;
}

/** View model for listing category options in editor and filters. */
export type CategoryViewModel = ListingCategoryProgrammerModel;
export type ListingCategoryViewModel = CategoryViewModel;

/** View model for listing tag options in editor and filters. */
export type TagViewModel = ListingTagProgrammerModel;
export type ListingTagViewModel = TagViewModel;

export type { ExtensionSort, ExtensionTypeFilter, ExtensionsHubFilters, ExtensionsTagFilterViewModel };

export class GetListingPresenter {
	constructor(private readonly listingRepository: ListingRepository) {}

	public async loadAdminListings(
		kind: 'extension' | 'stack' | null,
		fetch?: typeof globalThis.fetch
	): Promise<ListingViewModel[]> {
		const listingsPm = await this.listingRepository.getAdminListings(
			{ listingKind: kind ?? undefined },
			fetch
		);
		return listingsPm.map((listing: ListingProgrammerModel): ListingViewModel => this.toListingVm(listing));
	}

	public async loadAdminCommentsVm(
		params?: { limit?: number; searchTerm?: string | null },
		fetch?: typeof globalThis.fetch
	): Promise<AdminListingCommentVm[]> {
		const listPm = await this.listingRepository.getAdminComments(
			{ limit: params?.limit ?? 100, searchTerm: params?.searchTerm },
			fetch
		);
		return listPm.map(
			(pm: AdminListingCommentProgrammerModel): AdminListingCommentVm => this.toAdminListingCommentVm(pm)
		);
	}

	public async loadAdminActivitiesVm(
		params?: { limit?: number },
		fetch?: typeof globalThis.fetch
	): Promise<AdminListingActivityVm[]> {
		const listPm = await this.listingRepository.getAdminActivities({ limit: params?.limit ?? 100 }, fetch);
		return listPm.map(
			(pm: AdminListingActivityProgrammerModel): AdminListingActivityVm => this.toAdminListingActivityVm(pm)
		);
	}

	public async loadPublishedExtensionsVm({
		fetch,
		limit,
		skip,
		skipId,
		searchTerm,
		tagSlugs,
		categorySlug,
		extensionType
	}: {
		fetch?: typeof globalThis.fetch;
		limit: number;
		skip: number;
		skipId?: string | null;
		searchTerm?: string | null;
		tagSlugs?: string[] | null;
		categorySlug?: string | null;
		extensionType?: string | null;
	}): Promise<{ listings: ListingPublicViewModel[]; count: number }> {
		const result = await this.listingRepository.getPublishedListings({
			limit,
			skip,
			skipId,
			searchTerm,
			tagSlugs,
			categorySlug,
			extensionType,
			listingKind: 'extension',
			fetch
		});

		return {
			listings: result.listings.map(
				(listing: ListingProgrammerModel): ListingPublicViewModel => this.toListingPublicVm(listing)
			),
			count: result.count
		};
	}

	public async loadPublishedExtensionBySlugVm(
		slug: string,
		fetch?: typeof globalThis.fetch
	): Promise<ListingDetailPublicViewModel | null> {
		const pm = await this.listingRepository.getPublishedBySlug(slug, fetch);
		if (!pm) return null;
		return this.toListingDetailPublicVm(pm);
	}

	public async loadPublishedExtensionBySlugStateless(
		slug: string,
		fetch?: typeof globalThis.fetch
	): Promise<ExtensionDetailViewModel | null> {
		return this.loadPublishedExtensionBySlugVm(slug, fetch);
	}

	public async loadActiveCategoriesVm(fetch?: typeof globalThis.fetch): Promise<CategoryViewModel[]> {
		const categoriesPm = await this.listingRepository.getActiveCategories(fetch);
		return categoriesPm.map(
			(category: ListingCategoryProgrammerModel): CategoryViewModel => this.toCategoryVm(category)
		);
	}

	public async loadExtensionsHubStateless(params: {
		fetch?: typeof globalThis.fetch;
		limit?: number;
	}): Promise<ExtensionsHubViewModel> {
		const limit = params.limit ?? 50;
		const [information, published, categories] = await Promise.all([
			this.listingRepository.getListingInformation(params.fetch),
			this.listingRepository.getPublishedListings({
				limit,
				skip: 0,
				listingKind: 'extension',
				fetch: params.fetch
			}),
			this.listingRepository.getActiveCategories(params.fetch)
		]);

		return {
			metaTitle: information.EXTENSIONS_META_TITLE ?? 'Extensions Hub',
			metaDescription:
				information.EXTENSIONS_META_DESCRIPTION ??
				'Browse skills and MCP server extensions for your agent stack.',
			extensions: published.listings.map((listing) => this.toListingPublicVm(listing)),
			categories: categories.map((category) => this.toExtensionCategoryVm(category)),
			totalCount: published.count
		};
	}

	public async loadRelatedExtensionsStateless(params: {
		categorySlug?: string | null;
		excludeId: string;
		limit?: number;
		fetch?: typeof globalThis.fetch;
	}): Promise<ExtensionCardViewModel[]> {
		if (!params.categorySlug) return [];

		const { listings } = await this.listingRepository.getPublishedListings({
			limit: (params.limit ?? 4) + 1,
			skip: 0,
			categorySlug: params.categorySlug,
			listingKind: 'extension',
			sortByKey: 'likes',
			sortByOrder: false,
			fetch: params.fetch
		});

		return listings
			.filter((listing) => listing.id !== params.excludeId)
			.slice(0, params.limit ?? 4)
			.map((listing) => this.toListingPublicVm(listing));
	}

	public async loadAllTagsVm(fetch?: typeof globalThis.fetch): Promise<TagViewModel[]> {
		const tagsPm = await this.listingRepository.getAllTags(fetch);
		return tagsPm.map((tag) => this.toTagVm(tag));
	}

	public buildExtensionsTagFilterVm(params: {
		tagsCatalog: TagViewModel[];
		extensions: ExtensionCardViewModel[];
	}): ExtensionsTagFilterViewModel {
		return buildExtensionsTagFilterVm(params);
	}

	public parseHubFiltersFromUrl(searchParams: URLSearchParams): ExtensionsHubFilters {
		const type = searchParams.get('type');
		const sort = searchParams.get('sort');
		const search = searchParams.get('search')?.trim();
		const category = searchParams.get('category')?.trim();
		const tagGroup = searchParams.get('tagGroup')?.trim();
		const tagsParam = searchParams.get('tags')?.trim();
		const tags = tagsParam
			? tagsParam
					.split(',')
					.map((slug) => slug.trim())
					.filter(Boolean)
			: undefined;

		const typeFilter: ExtensionTypeFilter =
			type === 'skills' || type === 'mcp' || type === 'both' || type === 'official' ? type : 'all';
		const sortFilter: ExtensionSort =
			sort === 'oldest' || sort === 'popular' || sort === 'views' ? sort : 'newest';

		return {
			type: typeFilter,
			sort: sortFilter,
			...(search ? { search } : {}),
			...(category ? { category } : {}),
			...(tags?.length ? { tags } : {}),
			...(tagGroup ? { tagGroup } : {})
		};
	}

	public buildHubFilterUrl(
		pathname: string,
		current: ExtensionsHubFilters,
		overrides: Partial<ExtensionsHubFilters>
	): string {
		const next: ExtensionsHubFilters = { ...current, ...overrides };
		const params = new URLSearchParams();
		if (next.type !== 'all') params.set('type', next.type);
		if (next.sort !== 'newest') params.set('sort', next.sort);
		if (next.search?.trim()) params.set('search', next.search.trim());
		if (next.category?.trim()) params.set('category', next.category.trim());
		if (next.tags?.length) params.set('tags', next.tags.join(','));
		if (next.tagGroup?.trim()) params.set('tagGroup', next.tagGroup.trim());
		const query = params.toString();
		return query ? `${pathname}?${query}` : pathname;
	}

	public filterAndSortExtensions(
		extensions: ExtensionCardViewModel[],
		filters: ExtensionsHubFilters,
		tagFilterVm?: ExtensionsTagFilterViewModel
	): ExtensionCardViewModel[] {
		let rows = [...extensions];

		if (filters.search?.trim()) {
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

		const selectedTagSlugs = new Set(filters.tags ?? []);
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

		switch (filters.type) {
			case 'official':
				rows = rows.filter((row) => row.isOfficial);
				break;
			case 'skills':
				rows = rows.filter((row) => row.extensionType === 'skills');
				break;
			case 'mcp':
				rows = rows.filter((row) => row.extensionType === 'mcp');
				break;
			case 'both':
				rows = rows.filter((row) => row.extensionType === 'both');
				break;
			default:
				break;
		}

		switch (filters.sort) {
			case 'oldest':
				rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
				break;
			case 'popular':
				rows.sort((a, b) => b.likes - a.likes || b.views - a.views);
				break;
			case 'views':
				rows.sort((a, b) => b.views - a.views || b.likes - a.likes);
				break;
			case 'newest':
			default:
				rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
				break;
		}

		return rows;
	}

	public computeHubStats(
		extensions: ExtensionCardViewModel[],
		categories: ExtensionCategoryViewModel[]
	): ExtensionsHubStatsViewModel {
		return {
			official: extensions.filter((row) => row.isOfficial).length,
			community: extensions.filter((row) => !row.isOfficial).length,
			categories: categories.length
		};
	}

	private toListingVm(listing: ListingProgrammerModel): ListingViewModel {
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

	private toListingPublicVm(listing: ListingProgrammerModel): ListingPublicViewModel {
		return {
			id: listing.id,
			title: listing.title,
			slug: listing.slug,
			excerpt: listing.excerpt,
			description: listing.description,
			logoImageUrl: listing.logoImageUrl,
			defaultImageUrl: listing.defaultImageUrl,
			extensionType: listing.extensionType,
			installCommandSkills: listing.installCommandSkills,
			installCommandMcp: listing.installCommandMcp,
			clickUrlSkills: listing.clickUrlSkills,
			clickUrlMcp: listing.clickUrlMcp,
			mcpServerConfig: listing.mcpServerConfig,
			isOfficial: listing.isOfficial,
			likes: listing.likes,
			views: listing.views,
			createdAt: listing.createdAt,
			category: listing.category ? { ...listing.category } : null,
			tags: listing.tags.map((t) => ({ ...t }))
		};
	}

	private toListingDetailPublicVm(listing: ListingProgrammerModel): ListingDetailPublicViewModel {
		return {
			id: listing.id,
			title: listing.title,
			slug: listing.slug,
			excerpt: listing.excerpt,
			description: listing.description,
			descriptionSkills: listing.descriptionSkills,
			descriptionMcp: listing.descriptionMcp,
			clickUrl: listing.clickUrl,
			clickUrlSkills: listing.clickUrlSkills,
			clickUrlMcp: listing.clickUrlMcp,
			content: listing.content,
			contentSkills: listing.contentSkills,
			contentMcp: listing.contentMcp,
			logoImageUrl: listing.logoImageUrl,
			defaultImageUrl: listing.defaultImageUrl,
			listingImageUrls: listing.listingImageUrls,
			extensionType: listing.extensionType,
			installCommandSkills: listing.installCommandSkills,
			installCommandMcp: listing.installCommandMcp,
			isOfficial: listing.isOfficial,
			sourceRepoUrl: listing.sourceRepoUrl,
			skillSourceUrl: listing.skillSourceUrl,
			skillName: listing.skillName,
			skillMetadata: listing.skillMetadata,
			sourceSyncedAt: listing.sourceSyncedAt,
			sourceContentHash: listing.sourceContentHash,
			license: listing.license,
			version: listing.version,
			mcpTools: listing.mcpTools.map((tool) => ({ ...tool })),
			mcpTransport: listing.mcpTransport,
			mcpServerConfig: listing.mcpServerConfig,
			likes: listing.likes,
			views: listing.views,
			clicks: listing.clicks,
			bookmarkCount: listing.bookmarkCount,
			averageRating: listing.averageRating,
			ratingsCount: listing.ratingsCount,
			createdAt: listing.createdAt,
			publishedAt: listing.publishedAt,
			updatedAt: listing.updatedAt,
			schemaType: listing.schemaType,
			schemaJson: listing.schemaJson,
			faq: listing.faq,
			category: listing.category ? { ...listing.category } : null,
			tags: listing.tags.map((t) => ({ ...t })),
			owner: listing.owner ? { ...listing.owner } : null
		};
	}

	private toCategoryVm(category: ListingCategoryProgrammerModel): CategoryViewModel {
		return { ...category };
	}

	private toTagVm(tag: ListingTagProgrammerModel): TagViewModel {
		return {
			...tag,
			tagGroups: tag.tagGroups.map((group) => ({ ...group }))
		};
	}

	private toExtensionCategoryVm(category: ListingCategoryProgrammerModel): ExtensionCategoryViewModel {
		return {
			id: category.id,
			name: category.name,
			slug: category.slug
		};
	}

	private toAdminListingCommentVm(pm: AdminListingCommentProgrammerModel): AdminListingCommentVm {
		return {
			id: pm.id,
			content: pm.content,
			isApproved: pm.isApproved,
			createdAt: pm.createdAt,
			updatedAt: pm.updatedAt,
			parentId: pm.parentId,
			userId: pm.userId,
			listingId: pm.listingId,
			author: pm.author ? { ...pm.author } : null,
			listing: pm.listing ? { ...pm.listing } : null
		};
	}

	private toAdminListingActivityVm(pm: AdminListingActivityProgrammerModel): AdminListingActivityVm {
		return {
			id: pm.id,
			activityType: pm.activityType,
			createdAt: pm.createdAt,
			userId: pm.userId,
			listingId: pm.listingId,
			author: pm.author ? { ...pm.author } : null,
			listing: pm.listing ? { ...pm.listing } : null
		};
	}
}
