import { HttpGateway, HttpMethod } from '$lib/core/HttpGateway';

import { CONFIG_SCHEMA_LISTINGS } from '$lib/config/constants/config';
import {
	getDefaultSchemaTypeForListingKind,
	getSchemaTypeForExtensionCategory
} from '$lib/listings/constants/listingSchemaTypes';
import type {
	ListingCategoryFormSchemaType,
	ListingFaqItemProgrammerModel,
	ListingFormSchemaType,
	ListingTagFormSchemaType,
	SkillCommandProgrammerModel,
	StackBlueprintProgrammerModel
} from '$lib/listings/listing.types';

function listingPmToFormPayload(
	listing: ListingProgrammerModel,
	overrides?: Partial<Pick<ListingFormSchemaType, 'is_user_published' | 'is_admin_published'>>
): ListingFormSchemaType {
	const listingKind = listing.listingKind === 'stack' ? 'stack' : 'extension';
	const categorySlug = listing.category?.slug;
	const schemaType =
		(listing.schemaType as ListingFormSchemaType['schema_type']) ??
		(listingKind === 'extension'
			? getSchemaTypeForExtensionCategory(categorySlug)
			: getDefaultSchemaTypeForListingKind('stack'));
	const faq =
		listing.faq?.map((item) => ({
			question: item.question ?? '',
			answer: item.answer ?? ''
		})) ?? [];

	return {
		id: listing.id,
		title: listing.title,
		excerpt: listing.excerpt ?? '',
		click_url: listing.clickUrl ?? '',
		click_url_skills: listing.clickUrlSkills ?? '',
		click_url_mcp: listing.clickUrlMcp ?? '',
		description: listing.description ?? '',
		description_skills: listing.descriptionSkills ?? '',
		description_mcp: listing.descriptionMcp ?? '',
		content: listing.content ?? '',
		content_skills: listing.contentSkills ?? '',
		content_mcp: listing.contentMcp ?? '',
		listing_kind: listingKind,
		extension_type: (listing.extensionType as 'skills' | 'mcp' | 'both' | null) ?? 'skills',
		install_command_skills: listing.installCommandSkills ?? '',
		install_command_mcp: listing.installCommandMcp ?? '',
		is_official: listing.isOfficial,
		source_repo_url: listing.sourceRepoUrl ?? '',
		skill_source_url: listing.skillSourceUrl ?? '',
		skill_name: listing.skillName ?? '',
		skill_metadata: listing.skillMetadata,
		source_synced_at: listing.sourceSyncedAt,
		source_content_hash: listing.sourceContentHash,
		license: listing.license ?? '',
		version: listing.version ?? '',
		skill_commands: listing.skillCommands ?? [],
		mcp_tools: listing.mcpTools ?? [],
		mcp_transport: listing.mcpTransport,
		mcp_server_config: listing.mcpServerConfig,
		stack_blueprint: listing.stackBlueprint,
		listing_category_id: listing.listingCategoryId ?? '',
		tag_ids: listing.tags.map((tag) => tag.id),
		is_user_published: overrides?.is_user_published ?? listing.isUserPublished,
		is_admin_published: overrides?.is_admin_published ?? false,
		schema_type: schemaType,
		faq,
		stack_members: (listing.stackMembers ?? []).map((member, index) => ({
			member_listing_id: member.memberListingId,
			member_role: member.memberRole as 'skills' | 'mcp',
			sort_order: member.sortOrder ?? index
		}))
	};
}

/** API response shape for a single listing (camelCase from backend ListingDTOMapper). */
export interface ListingDto {
	id: string;
	ownerId: string | null;
	title: string;
	slug: string;
	description: string | null;
	descriptionSkills: string | null;
	descriptionMcp: string | null;
	excerpt: string | null;
	clickUrl: string | null;
	clickUrlSkills: string | null;
	clickUrlMcp: string | null;
	content: string | null;
	contentSkills: string | null;
	contentMcp: string | null;
	listingKind: string;
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
	skillCommands: SkillCommandProgrammerModel[];
	stackBlueprint: StackBlueprintProgrammerModel | null;
	mcpTransport: McpTransport | null;
	mcpServerConfig: Record<string, unknown> | null;
	likes: number;
	views: number;
	clicks: number;
	bookmarkCount: number;
	averageRating: number;
	ratingsCount: number;
	isUserPublished: boolean;
	isAdminPublished: boolean;
	schemaType: string | null;
	schemaJson: Record<string, unknown> | null;
	listingCategoryId: string | null;
	defaultImageUrl: string | null;
	listingImageUrls: string[];
	logoImageUrl: string | null;
	faq: unknown;
	listingTagSlugs: string[];
	createdAt: string;
	updatedAt: string | null;
	publishedAt: string | null;
	category: { id: string; name: string; slug: string; parentPath?: string } | null;
	tags: Array<{ id: string; name: string; slug: string }>;
	owner: {
		id: string;
		fullName: string | null;
		username: string | null;
		avatarUrl: string | null;
		tagLine: string | null;
	} | null;
	stackMembers?: StackMemberDto[];
}

export interface StackMemberDto {
	id: string;
	memberListingId: string;
	memberRole: string;
	sortOrder: number;
	member: {
		id: string;
		title: string;
		slug: string;
		extensionType: string | null;
		excerpt: string | null;
		logoImageUrl: string | null;
		isOfficial: boolean;
		installCommandSkills: string | null;
		installCommandMcp: string | null;
		clickUrlSkills: string | null;
		clickUrlMcp: string | null;
	} | null;
}

export interface ListingCommentDto {
	id: string;
	content: string;
	isApproved: boolean;
	createdAt: string;
	updatedAt: string | null;
	parentId: string | null;
	userId: string;
	author: {
		id: string;
		fullName: string | null;
		avatarUrl: string | null;
	} | null;
}

export interface ListingCategoryDto {
	id: string;
	name: string;
	slug: string;
	headline?: string | null;
	description?: string | null;
	image_url_hero?: string | null;
	image_url_small?: string | null;
	href?: string | null;
	color?: string | null;
	emoji?: string | null;
	parent_id?: string | null;
	parent_path?: string;
}

export interface ListingTagGroupDto {
	id: string;
	name: string;
}

export interface ListingTagDto {
	id: string;
	name: string;
	slug: string;
	headline?: string | null;
	description?: string | null;
	image_url_hero?: string | null;
	image_url_small?: string | null;
	href?: string | null;
	color?: string | null;
	emoji?: string | null;
	listing_tag_groups?: Array<
		| ListingTagGroupDto
		| { listing_tag_groups: ListingTagGroupDto | null }
	> | null;
}

export interface AdminListingCommentDto {
	id: string;
	content: string;
	isApproved: boolean;
	createdAt: string;
	updatedAt: string | null;
	parentId: string | null;
	userId: string;
	listingId: string;
	author: {
		id: string;
		fullName: string | null;
		avatarUrl: string | null;
	} | null;
	listing: { id: string; title: string; slug: string } | null;
}

export interface AdminListingActivityDto {
	id: string;
	activityType: string;
	createdAt: string;
	userId: string | null;
	listingId: string;
	author: {
		id: string;
		fullName: string | null;
		avatarUrl: string | null;
	} | null;
	listing: { id: string; title: string; slug: string } | null;
}

export interface ListingConfig {
	endpoints: {
		getListingInformation: string;
		getPublishedListings: string;
		getPublishedBySlug: (slug: string) => string;
		getPublishedStacks: string;
		getPublishedStackBySlug: (slug: string) => string;
		getListingCreators: string;
		getCreatorListings: (username: string) => string;
		getAdminListings: string;
		getListingById: (id: string) => string;
		createListing: string;
		updateListing: (id: string) => string;
		deleteListing: (id: string) => string;
		getAllCategories: string;
		getActiveCategories: string;
		createCategory: string;
		updateCategory: (id: string) => string;
		deleteCategory: (id: string) => string;
		getAllTags: string;
		createTag: string;
		updateTag: (id: string) => string;
		deleteTag: (id: string) => string;
		getAdminComments: string;
		getAdminActivities: string;
		approveComment: (id: string) => string;
		deleteComment: (id: string) => string;
		trackView: (listingId: string) => string;
		trackLike: (listingId: string) => string;
		trackClick: (listingId: string) => string;
		importFromGithub: string;
		syncFromGithub: (id: string) => string;
		getListingComments: (listingId: string) => string;
		createListingComment: string;
		upsertListingRating: (listingId: string) => string;
		getMyBookmarks: string;
		getMyListingStats: string;
		getMyListings: string;
		getMyListingById: (id: string) => string;
		createMyListing: string;
		updateMyListing: (id: string) => string;
		deleteMyListing: (id: string) => string;
		addBookmark: (listingId: string) => string;
		removeBookmark: (listingId: string) => string;
	};
}

export interface GetListingResponseDto {
	success: boolean;
	data: ListingDto;
	message?: string;
}

export interface GetOwnedListingStatsResponseDto {
	success: boolean;
	data: OwnedListingStatsProgrammerModel;
	message?: string;
}

export interface OwnedListingStatsProgrammerModel {
	totalListings: number;
	totalLikes: number;
	totalViews: number;
	totalClicks: number;
	totalRatings: number;
	totalBookmarks: number;
}

export interface GetListingsCollectionResponseDto {
	success: boolean;
	data: ListingDto[];
	count: number;
	message?: string;
}

export interface ListingCreatorDto {
	id: string;
	username: string | null;
	full_name: string | null;
	avatar_url: string | null;
	tag_line: string | null;
	extension_count: number;
	stack_count: number;
	total_likes: number;
	total_bookmarks: number;
}

export interface GetListingCreatorsResponseDto {
	success: boolean;
	data: ListingCreatorDto[];
	message?: string;
}

export interface GetListingCategoriesResponseDto {
	success: boolean;
	data: ListingCategoryDto[];
	message?: string;
}

export interface GetListingTagsResponseDto {
	success: boolean;
	data: ListingTagDto[];
	message?: string;
}

export interface UpsertListingResponseDto {
	success: boolean;
	data: { id: string };
	message?: string;
}

export interface DeleteListingResponseDto {
	success: boolean;
	message?: string;
}

export interface ListingGithubImportResponseDto {
	success: boolean;
	data: ListingGithubImportPreviewProgrammerModel;
	message?: string;
}

export interface ListingGithubSyncResponseDto {
	success: boolean;
	data: ListingGithubSyncResultProgrammerModel;
	message?: string;
}

export interface UpsertCategoryResponseDto {
	success: boolean;
	data: { id: string };
	message?: string;
}

export interface DeleteCategoryResponseDto {
	success: boolean;
	message?: string;
}

export interface UpsertTagResponseDto {
	success: boolean;
	data: { id: string };
	message?: string;
}

export interface DeleteTagResponseDto {
	success: boolean;
	message?: string;
}

export interface GetAdminListingCommentsResponseDto {
	success: boolean;
	data: {
		commentsResult: AdminListingCommentDto[];
		countResult: number;
	};
	message?: string;
}

export interface GetAdminListingActivitiesResponseDto {
	success: boolean;
	data: {
		activitiesResult: AdminListingActivityDto[];
		countResult: number;
	};
	message?: string;
}

export interface ApproveListingCommentResponseDto {
	success: boolean;
	data?: { id: string };
	message?: string;
}

export interface DeleteListingCommentResponseDto {
	success: boolean;
	message?: string;
}

export interface TrackListingStatResponseDto {
	success: boolean;
	message?: string;
}

export interface GetListingInformationResponseDto {
	success: boolean;
	data: ListingInformationProgrammerModel;
	message?: string;
}

export type ListingUpsertProgrammerModel =
	| { ok: true; id?: string }
	| { ok: false; error: string };

/** Alias used by public extension page presenters for stat mutations. */
export type ListingMutationProgrammerModel = ListingUpsertProgrammerModel;

/** MCP tool row for the tools table on MCP detail pages. */
export interface McpToolProgrammerModel {
	name: string;
	description: string;
}

export type McpTransport = 'stdio' | 'sse' | 'http';

/** Fields specific to skills extensions (SKILL.md import + detail pages). */
export interface SkillsExtensionFieldsProgrammerModel {
	skillName: string | null;
	skillSourceUrl: string | null;
	skillMetadata: Record<string, unknown> | null;
	sourceSyncedAt: string | null;
	sourceContentHash: string | null;
	license: string | null;
	version: string | null;
}

/** Fields specific to MCP server listings. */
export interface McpExtensionFieldsProgrammerModel {
	mcpTools: McpToolProgrammerModel[];
	skillCommands: SkillCommandProgrammerModel[];
	stackBlueprint: StackBlueprintProgrammerModel | null;
	mcpTransport: McpTransport | null;
	mcpServerConfig: Record<string, unknown> | null;
}

/** Preview returned by POST /listings/import/github (admin one-link import). */
export interface ListingGithubImportPreviewProgrammerModel {
	title: string;
	slug: string;
	description: string | null;
	excerpt: string | null;
	content: string | null;
	extensionType: 'skills' | 'mcp' | 'both';
	descriptionSkills?: string | null;
	descriptionMcp?: string | null;
	contentSkills?: string | null;
	contentMcp?: string | null;
	skillName: string | null;
	skillMetadata: Record<string, unknown> | null;
	sourceRepoUrl: string;
	skillSourceUrl: string;
	installCommandSkills: string | null;
	license: string | null;
	version: string | null;
	sourceContentHash: string;
}

/** Result of POST /listings/:id/sync-github. */
export interface ListingGithubSyncResultProgrammerModel {
	updated: boolean;
	contentChanged: boolean;
	sourceSyncedAt: string;
	sourceContentHash: string;
}

export interface ListingInformationProgrammerModel {
	[key: string]: string;
}

export interface ListingProgrammerModel {
	id: string;
	ownerId: string | null;
	title: string;
	slug: string;
	description: string | null;
	descriptionSkills: string | null;
	descriptionMcp: string | null;
	excerpt: string | null;
	clickUrl: string | null;
	clickUrlSkills: string | null;
	clickUrlMcp: string | null;
	content: string | null;
	contentSkills: string | null;
	contentMcp: string | null;
	listingKind: string;
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
	skillCommands: SkillCommandProgrammerModel[];
	stackBlueprint: StackBlueprintProgrammerModel | null;
	mcpTransport: McpTransport | null;
	mcpServerConfig: Record<string, unknown> | null;
	likes: number;
	views: number;
	clicks: number;
	bookmarkCount: number;
	averageRating: number;
	ratingsCount: number;
	isUserPublished: boolean;
	isAdminPublished: boolean;
	schemaType: string | null;
	schemaJson: Record<string, unknown> | null;
	listingCategoryId: string | null;
	defaultImageUrl: string | null;
	listingImageUrls: string[];
	logoImageUrl: string | null;
	faq: ListingFaqItemProgrammerModel[] | null;
	listingTagSlugs: string[];
	createdAt: string;
	updatedAt: string | null;
	publishedAt: string | null;
	category: { id: string; name: string; slug: string; parentPath?: string } | null;
	tags: Array<{ id: string; name: string; slug: string }>;
	owner: {
		id: string;
		fullName: string | null;
		username: string | null;
		avatarUrl: string | null;
		tagLine: string | null;
	} | null;
	stackMembers: StackMemberProgrammerModel[];
}

export interface StackMemberProgrammerModel {
	id: string;
	memberListingId: string;
	memberRole: string;
	sortOrder: number;
	member: {
		id: string;
		title: string;
		slug: string;
		extensionType: string | null;
		excerpt: string | null;
		logoImageUrl: string | null;
		isOfficial: boolean;
		installCommandSkills: string | null;
		installCommandMcp: string | null;
		clickUrlSkills: string | null;
		clickUrlMcp: string | null;
	} | null;
}

export interface ListingCommentProgrammerModel {
	id: string;
	content: string;
	isApproved: boolean;
	createdAt: string;
	updatedAt: string | null;
	parentId: string | null;
	userId: string;
	author: {
		id: string;
		fullName: string | null;
		avatarUrl: string | null;
	} | null;
}

export interface ListingCategoryProgrammerModel {
	id: string;
	name: string;
	slug: string;
	parentPath: string;
	description: string | null;
	parentId: string | null;
	parent: { id: string; name: string; slug: string } | null;
	headline: string | null;
	emoji: string | null;
	color: string | null;
	imageUrlHero: string | null;
	imageUrlSmall: string | null;
	href: string | null;
}

export interface ListingTagGroupProgrammerModel {
	id: string;
	name: string;
}

export interface ListingTagProgrammerModel {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	headline: string | null;
	emoji: string | null;
	color: string | null;
	imageUrlHero: string | null;
	imageUrlSmall: string | null;
	href: string | null;
	tagGroups: ListingTagGroupProgrammerModel[];
}

export interface ListingCreatorProgrammerModel {
	id: string;
	username: string | null;
	fullName: string | null;
	avatarUrl: string | null;
	tagLine: string | null;
	extensionCount: number;
	stackCount: number;
	totalLikes: number;
	totalBookmarks: number;
}

export interface AdminListingCommentProgrammerModel {
	id: string;
	content: string;
	isApproved: boolean;
	createdAt: string;
	updatedAt: string | null;
	parentId: string | null;
	userId: string;
	listingId: string;
	author: {
		id: string;
		fullName: string | null;
		avatarUrl: string | null;
	} | null;
	listing: { id: string; title: string; slug: string } | null;
}

export interface AdminListingActivityProgrammerModel {
	id: string;
	activityType: string;
	createdAt: string;
	userId: string | null;
	listingId: string;
	author: {
		id: string;
		fullName: string | null;
		avatarUrl: string | null;
	} | null;
	listing: { id: string; title: string; slug: string } | null;
}

export class ListingRepository {
	constructor(
		private readonly httpGateway: HttpGateway,
		private readonly config: ListingConfig
	) {}

	async getListingInformation(fetch?: typeof globalThis.fetch): Promise<ListingInformationProgrammerModel> {
		const fallback: ListingInformationProgrammerModel = {
			LISTING_SCHEMA_TYPE: String(CONFIG_SCHEMA_LISTINGS.LISTING_SCHEMA_TYPE.default ?? 'SoftwareApplication')
		};

		try {
			const { data: getListingInformationDto, ok } =
				await this.httpGateway.get<GetListingInformationResponseDto>(
					this.config.endpoints.getListingInformation,
					undefined,
					{ withCredentials: false, fetch }
				);

			if (ok && getListingInformationDto?.success && getListingInformationDto.data) {
				return getListingInformationDto.data;
			}
			return fallback;
		} catch {
			return fallback;
		}
	}

	async getPublishedListings(
		{
			limit,
			skip,
			skipId,
			searchTerm,
			tagSlugs,
			categorySlug,
			extensionType,
			listingKind,
			sortByKey,
			sortByOrder,
			fetch: customFetch
		}: {
			limit: number;
			skip: number;
			skipId?: string | null;
			searchTerm?: string | null;
			tagSlugs?: string[] | null;
			categorySlug?: string | null;
			extensionType?: string | null;
			listingKind?: string | null;
			sortByKey?: string | null;
			sortByOrder?: boolean | null;
			fetch?: typeof globalThis.fetch;
		}
	): Promise<{ listings: ListingProgrammerModel[]; count: number }> {
		const params: Record<string, string | number | boolean> = { limit, skip };
		if (skipId) params.skipId = skipId;
		const term = searchTerm?.trim();
		if (term) params.searchTerm = term;
		if (tagSlugs?.length) params.tagSlugs = tagSlugs.join(',');
		if (categorySlug) params.categorySlug = categorySlug;
		if (extensionType) params.extensionType = extensionType;
		if (listingKind) params.listingKind = listingKind;
		if (sortByKey) params.sortByKey = sortByKey;
		if (sortByOrder != null) params.sortByOrder = sortByOrder;

		const { data: getPublishedListingsDto, ok } =
			await this.httpGateway.get<GetListingsCollectionResponseDto>(
				this.config.endpoints.getPublishedListings,
				params,
				{ withCredentials: false, fetch: customFetch }
			);

		if (ok && getPublishedListingsDto?.success && Array.isArray(getPublishedListingsDto.data)) {
			return {
				listings: getPublishedListingsDto.data.map((row) => this.toListingPm(row)),
				count: getPublishedListingsDto.count ?? 0
			};
		}
		return { listings: [], count: 0 };
	}

	async getPublishedBySlug(slug: string, fetch?: typeof globalThis.fetch): Promise<ListingProgrammerModel | null> {
		const { data: getPublishedBySlugDto, ok } = await this.httpGateway.get<GetListingResponseDto>(
			this.config.endpoints.getPublishedBySlug(slug),
			undefined,
			{ withCredentials: false, fetch }
		);
		if (ok && getPublishedBySlugDto?.success && getPublishedBySlugDto.data) {
			return this.toListingPm(getPublishedBySlugDto.data);
		}
		return null;
	}

	async getPublishedStacks(
		params: {
			limit?: number;
			skip?: number;
			searchTerm?: string | null;
			sortByKey?: string | null;
			sortByOrder?: boolean | null;
			fetch?: typeof globalThis.fetch;
		} = {}
	): Promise<{ listings: ListingProgrammerModel[]; count: number }> {
		const query: Record<string, string | number | boolean> = {
			limit: params.limit ?? 50,
			skip: params.skip ?? 0
		};
		const term = params.searchTerm?.trim();
		if (term) query.searchTerm = term;
		if (params.sortByKey) query.sortByKey = params.sortByKey;
		if (params.sortByOrder != null) query.sortByOrder = params.sortByOrder;

		const { data: getPublishedStacksDto, ok } = await this.httpGateway.get<GetListingsCollectionResponseDto>(
			this.config.endpoints.getPublishedStacks,
			query,
			{ withCredentials: false, fetch: params.fetch }
		);

		if (ok && getPublishedStacksDto?.success && Array.isArray(getPublishedStacksDto.data)) {
			return {
				listings: getPublishedStacksDto.data.map((row) => this.toListingPm(row)),
				count: getPublishedStacksDto.count ?? 0
			};
		}
		return { listings: [], count: 0 };
	}

	async getPublishedStackBySlug(
		slug: string,
		fetch?: typeof globalThis.fetch
	): Promise<ListingProgrammerModel | null> {
		const { data: getPublishedStackDto, ok } = await this.httpGateway.get<GetListingResponseDto>(
			this.config.endpoints.getPublishedStackBySlug(slug),
			undefined,
			{ withCredentials: false, fetch }
		);
		if (ok && getPublishedStackDto?.success && getPublishedStackDto.data) {
			return this.toListingPm(getPublishedStackDto.data);
		}
		return null;
	}

	async getListingCreators(fetch?: typeof globalThis.fetch): Promise<ListingCreatorProgrammerModel[]> {
		const { data: getListingCreatorsDto, ok } = await this.httpGateway.get<GetListingCreatorsResponseDto>(
			this.config.endpoints.getListingCreators,
			undefined,
			{ withCredentials: false, fetch }
		);

		if (ok && getListingCreatorsDto?.success && Array.isArray(getListingCreatorsDto.data)) {
			return getListingCreatorsDto.data.map((row) => this.toListingCreatorPm(row));
		}
		return [];
	}

	async getCreatorListings(
		username: string,
		fetch?: typeof globalThis.fetch
	): Promise<ListingProgrammerModel[]> {
		const { data: getCreatorListingsDto, ok } = await this.httpGateway.get<GetListingsCollectionResponseDto>(
			this.config.endpoints.getCreatorListings(username),
			undefined,
			{ withCredentials: false, fetch }
		);

		if (ok && getCreatorListingsDto?.success && Array.isArray(getCreatorListingsDto.data)) {
			return getCreatorListingsDto.data.map((row) => this.toListingPm(row));
		}
		return [];
	}

	async getListingComments(
		listingId: string,
		fetch?: typeof globalThis.fetch
	): Promise<ListingCommentProgrammerModel[]> {
		const { data: getCommentsDto, ok } = await this.httpGateway.get<{
			success: boolean;
			data: ListingCommentDto[];
		}>(this.config.endpoints.getListingComments(listingId), undefined, {
			withCredentials: false,
			fetch
		});
		if (ok && getCommentsDto?.success && Array.isArray(getCommentsDto.data)) {
			return getCommentsDto.data.map((row) => this.toListingCommentPm(row));
		}
		return [];
	}

	async createListingComment(params: {
		listingId: string;
		content: string;
		parentId: string | null;
		fetch?: typeof globalThis.fetch;
	}): Promise<ListingUpsertProgrammerModel> {
		try {
			const { data: createCommentDto, ok } = await this.httpGateway.post<{
				success: boolean;
				data?: { id: string };
				message?: string;
			}>(
				this.config.endpoints.createListingComment,
				{
					listing_id: params.listingId,
					content: params.content,
					parent_id: params.parentId
				},
				{ withCredentials: true, fetch: params.fetch }
			);
			if (ok && createCommentDto?.success && createCommentDto.data?.id) {
				return { ok: true, id: createCommentDto.data.id };
			}
			return { ok: false, error: createCommentDto?.message ?? 'Failed to submit comment.' };
		} catch (err) {
			return { ok: false, error: this.extractMessage(err) };
		}
	}

	async upsertListingRating(
		listingId: string,
		rating: number,
		fetch?: typeof globalThis.fetch
	): Promise<ListingUpsertProgrammerModel> {
		try {
			const { data: ratingDto, ok } = await this.httpGateway.post<{
				success: boolean;
				data?: { id: string };
				message?: string;
			}>(
				this.config.endpoints.upsertListingRating(listingId),
				{ rating },
				{ withCredentials: true, fetch }
			);
			if (ok && ratingDto?.success) {
				return { ok: true, id: ratingDto.data?.id };
			}
			return { ok: false, error: ratingDto?.message ?? 'Failed to save rating.' };
		} catch (err) {
			return { ok: false, error: this.extractMessage(err) };
		}
	}

	async getMyBookmarks(fetch?: typeof globalThis.fetch): Promise<ListingProgrammerModel[]> {
		const { data: getMyBookmarksDto, ok } = await this.httpGateway.get<GetListingsCollectionResponseDto>(
			this.config.endpoints.getMyBookmarks,
			undefined,
			{ withCredentials: true, fetch }
		);
		if (ok && getMyBookmarksDto?.success && Array.isArray(getMyBookmarksDto.data)) {
			return getMyBookmarksDto.data.map((row) => this.toListingPm(row));
		}
		return [];
	}

	async addBookmark(listingId: string, fetch?: typeof globalThis.fetch): Promise<ListingUpsertProgrammerModel> {
		try {
			const { data: addBookmarkDto, ok } = await this.httpGateway.post<{ success: boolean; message?: string }>(
				this.config.endpoints.addBookmark(listingId),
				undefined,
				{ withCredentials: true, fetch }
			);
			if (ok && addBookmarkDto?.success) return { ok: true };
			return { ok: false, error: addBookmarkDto?.message ?? 'Failed to bookmark extension.' };
		} catch (err) {
			return { ok: false, error: this.extractMessage(err) };
		}
	}

	async removeBookmark(listingId: string, fetch?: typeof globalThis.fetch): Promise<ListingUpsertProgrammerModel> {
		try {
			const { data: removeBookmarkDto, ok } = await this.httpGateway.delete<{ success: boolean; message?: string }>(
				this.config.endpoints.removeBookmark(listingId),
				{ withCredentials: true, fetch }
			);
			if (ok && removeBookmarkDto?.success) return { ok: true };
			return { ok: false, error: removeBookmarkDto?.message ?? 'Failed to remove bookmark.' };
		} catch (err) {
			return { ok: false, error: this.extractMessage(err) };
		}
	}

	async getAdminListings(
		params?: {
			limit?: number;
			searchTerm?: string | null;
			listingKind?: string | null;
			sortByKey?: string | null;
			sortByOrder?: boolean | null;
		},
		fetch?: typeof globalThis.fetch
	): Promise<ListingProgrammerModel[]> {
		const query: Record<string, string | number | boolean> = {
			limit: params?.limit ?? 500
		};
		const term = params?.searchTerm?.trim();
		if (term) query.searchTerm = term;
		if (params?.listingKind) query.listingKind = params.listingKind;
		if (params?.sortByKey) query.sortByKey = params.sortByKey;
		if (params?.sortByOrder != null) query.sortByOrder = params.sortByOrder;

		const { data: getAdminListingsDto, ok } = await this.httpGateway.get<GetListingsCollectionResponseDto>(
			this.config.endpoints.getAdminListings,
			query,
			{ withCredentials: true, fetch }
		);

		if (ok && getAdminListingsDto?.success && Array.isArray(getAdminListingsDto.data)) {
			return getAdminListingsDto.data.map((row) => this.toListingPm(row));
		}
		return [];
	}

	async getListingById(id: string, fetch?: typeof globalThis.fetch): Promise<ListingProgrammerModel | null> {
		const { data: getListingByIdDto, ok } = await this.httpGateway.get<GetListingResponseDto>(
			this.config.endpoints.getListingById(id),
			undefined,
			{ withCredentials: true, fetch }
		);
		if (ok && getListingByIdDto?.success && getListingByIdDto.data) {
			return this.toListingPm(getListingByIdDto.data);
		}
		return null;
	}

	async createListing(
		payload: ListingFormSchemaType,
		listingTagsData: Array<{ id: string; slug: string }>,
		fetch?: typeof globalThis.fetch
	): Promise<ListingUpsertProgrammerModel> {
		try {
			const body = this.toListingUpsertBody(payload, listingTagsData);
			const { data: createListingDto, ok } = await this.httpGateway.post<UpsertListingResponseDto>(
				this.config.endpoints.createListing,
				body,
				{ withCredentials: true, fetch }
			);
			if (ok && createListingDto?.success && createListingDto.data?.id) {
				return { ok: true, id: createListingDto.data.id };
			}
			return { ok: false, error: createListingDto?.message ?? 'Failed to create listing.' };
		} catch (err) {
			return { ok: false, error: this.extractMessage(err) };
		}
	}

	async updateListing(
		id: string,
		payload: ListingFormSchemaType,
		listingTagsData: Array<{ id: string; slug: string }>,
		fetch?: typeof globalThis.fetch
	): Promise<ListingUpsertProgrammerModel> {
		try {
			const body = this.toListingUpsertBody({ ...payload, id }, listingTagsData);
			const { data: updateListingDto, ok } = await this.httpGateway.put<UpsertListingResponseDto>(
				this.config.endpoints.updateListing(id),
				body,
				{ withCredentials: true, fetch }
			);
			if (ok && updateListingDto?.success) {
				return { ok: true, id: updateListingDto.data?.id ?? id };
			}
			return { ok: false, error: updateListingDto?.message ?? 'Failed to update listing.' };
		} catch (err) {
			return { ok: false, error: this.extractMessage(err) };
		}
	}

	async deleteListing(listingId: string, fetch?: typeof globalThis.fetch): Promise<ListingUpsertProgrammerModel> {
		try {
			const { data: deleteListingDto, ok } = await this.httpGateway.delete<DeleteListingResponseDto>(
				this.config.endpoints.deleteListing(listingId),
				{ withCredentials: true, fetch }
			);
			if (ok && deleteListingDto?.success) return { ok: true };
			return { ok: false, error: deleteListingDto?.message ?? 'Failed to delete listing.' };
		} catch (err) {
			return { ok: false, error: this.extractMessage(err) };
		}
	}

	async getMyListings(
		params: { listingKind?: 'extension' | 'stack'; limit?: number } = {},
		fetch?: typeof globalThis.fetch
	): Promise<{ listings: ListingProgrammerModel[]; count: number }> {
		const query: Record<string, string> = {};
		if (params.listingKind) query.listing_kind = params.listingKind;
		if (params.limit != null) query.limit = String(params.limit);

		const { data: getMyListingsDto, ok } = await this.httpGateway.get<GetListingsCollectionResponseDto>(
			this.config.endpoints.getMyListings,
			query,
			{ withCredentials: true, fetch }
		);
		if (ok && getMyListingsDto?.success && Array.isArray(getMyListingsDto.data)) {
			return {
				listings: getMyListingsDto.data.map((row) => this.toListingPm(row)),
				count: getMyListingsDto.count ?? 0
			};
		}
		return { listings: [], count: 0 };
	}

	async getOwnedListingStats(
		fetch?: typeof globalThis.fetch
	): Promise<OwnedListingStatsProgrammerModel | null> {
		const { data: ownedListingStatsDto, ok } = await this.httpGateway.get<GetOwnedListingStatsResponseDto>(
			this.config.endpoints.getMyListingStats,
			undefined,
			{ withCredentials: true, fetch }
		);
		if (ok && ownedListingStatsDto?.success && ownedListingStatsDto.data) {
			return ownedListingStatsDto.data;
		}
		return null;
	}

	async getMyListingById(id: string, fetch?: typeof globalThis.fetch): Promise<ListingProgrammerModel | null> {
		const { data: getMyListingDto, ok } = await this.httpGateway.get<GetListingResponseDto>(
			this.config.endpoints.getMyListingById(id),
			undefined,
			{ withCredentials: true, fetch }
		);
		if (ok && getMyListingDto?.success && getMyListingDto.data) {
			return this.toListingPm(getMyListingDto.data);
		}
		return null;
	}

	async createMyListing(
		payload: ListingFormSchemaType,
		listingTagsData: Array<{ id: string; slug: string }>,
		fetch?: typeof globalThis.fetch
	): Promise<ListingUpsertProgrammerModel> {
		try {
			const body = this.toListingUpsertBody(payload, listingTagsData);
			const { data: createMyListingDto, ok } = await this.httpGateway.post<UpsertListingResponseDto>(
				this.config.endpoints.createMyListing,
				body,
				{ withCredentials: true, fetch }
			);
			if (ok && createMyListingDto?.success && createMyListingDto.data?.id) {
				return { ok: true, id: createMyListingDto.data.id };
			}
			return { ok: false, error: createMyListingDto?.message ?? 'Failed to create listing.' };
		} catch (err) {
			return { ok: false, error: this.extractMessage(err) };
		}
	}

	async updateMyListing(
		id: string,
		payload: ListingFormSchemaType,
		listingTagsData: Array<{ id: string; slug: string }>,
		fetch?: typeof globalThis.fetch
	): Promise<ListingUpsertProgrammerModel> {
		try {
			const body = this.toListingUpsertBody({ ...payload, id }, listingTagsData);
			const { data: updateMyListingDto, ok } = await this.httpGateway.put<UpsertListingResponseDto>(
				this.config.endpoints.updateMyListing(id),
				body,
				{ withCredentials: true, fetch }
			);
			if (ok && updateMyListingDto?.success) {
				return { ok: true, id: updateMyListingDto.data?.id ?? id };
			}
			return { ok: false, error: updateMyListingDto?.message ?? 'Failed to update listing.' };
		} catch (err) {
			return { ok: false, error: this.extractMessage(err) };
		}
	}

	async unpublishMyListing(
		listingId: string,
		fetch?: typeof globalThis.fetch
	): Promise<ListingUpsertProgrammerModel> {
		const listing = await this.getMyListingById(listingId, fetch);
		if (!listing) {
			return { ok: false, error: 'Listing not found.' };
		}
		if (!listing.isUserPublished) {
			return { ok: false, error: 'Listing is already a draft.' };
		}

		const payload = listingPmToFormPayload(listing, {
			is_user_published: false,
			is_admin_published: false
		});
		return this.updateMyListing(listingId, payload, listing.tags, fetch);
	}

	async deleteMyListing(listingId: string, fetch?: typeof globalThis.fetch): Promise<ListingUpsertProgrammerModel> {
		try {
			const { data: deleteMyListingDto, ok } = await this.httpGateway.delete<DeleteListingResponseDto>(
				this.config.endpoints.deleteMyListing(listingId),
				{ withCredentials: true, fetch }
			);
			if (ok && deleteMyListingDto?.success) return { ok: true };
			return { ok: false, error: deleteMyListingDto?.message ?? 'Failed to delete listing.' };
		} catch (err) {
			return { ok: false, error: this.extractMessage(err) };
		}
	}

	async getAllCategories(fetch?: typeof globalThis.fetch): Promise<ListingCategoryProgrammerModel[]> {
		const { data: getAllCategoriesDto, ok } = await this.httpGateway.get<GetListingCategoriesResponseDto>(
			this.config.endpoints.getAllCategories,
			undefined,
			{ withCredentials: true, fetch }
		);
		if (ok && getAllCategoriesDto?.success && Array.isArray(getAllCategoriesDto.data)) {
			return getAllCategoriesDto.data.map((row) => this.toCategoryPm(row));
		}
		return [];
	}

	/** @deprecated Use {@link getAllCategories}. */
	async getAllFullCategories(fetch?: typeof globalThis.fetch): Promise<ListingCategoryProgrammerModel[]> {
		return this.getAllCategories(fetch);
	}

	async getActiveCategories(fetch?: typeof globalThis.fetch): Promise<ListingCategoryProgrammerModel[]> {
		const { data: getActiveCategoriesDto, ok } = await this.httpGateway.get<GetListingCategoriesResponseDto>(
			this.config.endpoints.getActiveCategories,
			undefined,
			{ withCredentials: false, fetch }
		);
		if (ok && getActiveCategoriesDto?.success && Array.isArray(getActiveCategoriesDto.data)) {
			return getActiveCategoriesDto.data.map((row) => this.toCategoryPm(row));
		}
		return [];
	}

	async createCategory(
		payload: ListingCategoryFormSchemaType,
		categoryGroupIds: string[] = [],
		fetch?: typeof globalThis.fetch
	): Promise<ListingUpsertProgrammerModel> {
		try {
			const { data: createCategoryDto, ok } = await this.httpGateway.post<UpsertCategoryResponseDto>(
				this.config.endpoints.createCategory,
				{ categoryData: payload, categoryGroupIds },
				{ withCredentials: true, fetch }
			);
			if (ok && createCategoryDto?.success && createCategoryDto.data?.id) {
				return { ok: true, id: createCategoryDto.data.id };
			}
			return { ok: false, error: createCategoryDto?.message ?? 'Failed to create category.' };
		} catch (err) {
			return { ok: false, error: this.extractMessage(err) };
		}
	}

	async updateCategory(
		id: string,
		payload: ListingCategoryFormSchemaType,
		categoryGroupIds: string[] = [],
		fetch?: typeof globalThis.fetch
	): Promise<ListingUpsertProgrammerModel> {
		try {
			const { data: updateCategoryDto, ok } = await this.httpGateway.put<UpsertCategoryResponseDto>(
				this.config.endpoints.updateCategory(id),
				{ categoryData: { ...payload, id }, categoryGroupIds },
				{ withCredentials: true, fetch }
			);
			if (ok && updateCategoryDto?.success) {
				return { ok: true, id: updateCategoryDto.data?.id ?? id };
			}
			return { ok: false, error: updateCategoryDto?.message ?? 'Failed to update category.' };
		} catch (err) {
			return { ok: false, error: this.extractMessage(err) };
		}
	}

	async upsertListingCategory(
		payload: ListingCategoryFormSchemaType,
		fetch?: typeof globalThis.fetch
	): Promise<ListingUpsertProgrammerModel> {
		const id = payload.id?.trim();
		if (id) return this.updateCategory(id, payload, [], fetch);
		return this.createCategory(payload, [], fetch);
	}

	async deleteCategory(categoryId: string, fetch?: typeof globalThis.fetch): Promise<ListingUpsertProgrammerModel> {
		try {
			const { data: deleteCategoryDto, ok } = await this.httpGateway.delete<DeleteCategoryResponseDto>(
				this.config.endpoints.deleteCategory(categoryId),
				{ withCredentials: true, fetch }
			);
			if (ok && deleteCategoryDto?.success) return { ok: true };
			return { ok: false, error: deleteCategoryDto?.message ?? 'Failed to delete category.' };
		} catch (err) {
			return { ok: false, error: this.extractMessage(err) };
		}
	}

	/** @deprecated Use {@link deleteCategory}. */
	async deleteListingCategory(categoryId: string, fetch?: typeof globalThis.fetch): Promise<ListingUpsertProgrammerModel> {
		return this.deleteCategory(categoryId, fetch);
	}

	async getAllTags(fetch?: typeof globalThis.fetch): Promise<ListingTagProgrammerModel[]> {
		const { data: getAllTagsDto, ok } = await this.httpGateway.get<GetListingTagsResponseDto>(
			this.config.endpoints.getAllTags,
			undefined,
			{ withCredentials: true, fetch }
		);
		if (ok && getAllTagsDto?.success && Array.isArray(getAllTagsDto.data)) {
			return getAllTagsDto.data.map((row) => this.toTagPm(row));
		}
		return [];
	}

	/** @deprecated Use {@link getAllTags}. */
	async getAllFullTags(fetch?: typeof globalThis.fetch): Promise<ListingTagProgrammerModel[]> {
		return this.getAllTags(fetch);
	}

	async createTag(
		payload: ListingTagFormSchemaType,
		tagGroupIds: string[] = [],
		fetch?: typeof globalThis.fetch
	): Promise<ListingUpsertProgrammerModel> {
		try {
			const { data: createTagDto, ok } = await this.httpGateway.post<UpsertTagResponseDto>(
				this.config.endpoints.createTag,
				{ tagData: payload, tagGroupIds },
				{ withCredentials: true, fetch }
			);
			if (ok && createTagDto?.success && createTagDto.data?.id) {
				return { ok: true, id: createTagDto.data.id };
			}
			return { ok: false, error: createTagDto?.message ?? 'Failed to create tag.' };
		} catch (err) {
			return { ok: false, error: this.extractMessage(err) };
		}
	}

	async updateTag(
		id: string,
		payload: ListingTagFormSchemaType,
		tagGroupIds: string[] = [],
		fetch?: typeof globalThis.fetch
	): Promise<ListingUpsertProgrammerModel> {
		try {
			const { data: updateTagDto, ok } = await this.httpGateway.put<UpsertTagResponseDto>(
				this.config.endpoints.updateTag(id),
				{ tagData: { ...payload, id }, tagGroupIds },
				{ withCredentials: true, fetch }
			);
			if (ok && updateTagDto?.success) {
				return { ok: true, id: updateTagDto.data?.id ?? id };
			}
			return { ok: false, error: updateTagDto?.message ?? 'Failed to update tag.' };
		} catch (err) {
			return { ok: false, error: this.extractMessage(err) };
		}
	}

	async upsertListingTag(
		payload: ListingTagFormSchemaType,
		fetch?: typeof globalThis.fetch
	): Promise<ListingUpsertProgrammerModel> {
		const id = payload.id?.trim();
		if (id) return this.updateTag(id, payload, [], fetch);
		return this.createTag(payload, [], fetch);
	}

	async deleteTag(tagId: string, fetch?: typeof globalThis.fetch): Promise<ListingUpsertProgrammerModel> {
		try {
			const { data: deleteTagDto, ok } = await this.httpGateway.delete<DeleteTagResponseDto>(
				this.config.endpoints.deleteTag(tagId),
				{ withCredentials: true, fetch }
			);
			if (ok && deleteTagDto?.success) return { ok: true };
			return { ok: false, error: deleteTagDto?.message ?? 'Failed to delete tag.' };
		} catch (err) {
			return { ok: false, error: this.extractMessage(err) };
		}
	}

	/** @deprecated Use {@link deleteTag}. */
	async deleteListingTag(tagId: string, fetch?: typeof globalThis.fetch): Promise<ListingUpsertProgrammerModel> {
		return this.deleteTag(tagId, fetch);
	}

	async getAdminComments(
		params?: { limit?: number; searchTerm?: string | null },
		fetch?: typeof globalThis.fetch
	): Promise<AdminListingCommentProgrammerModel[]> {
		const query: Record<string, string | number> = {
			limit: params?.limit ?? 100
		};
		const term = params?.searchTerm?.trim();
		if (term) query.searchTerm = term;

		const { data: getAdminCommentsDto, ok } = await this.httpGateway.get<GetAdminListingCommentsResponseDto>(
			this.config.endpoints.getAdminComments,
			query,
			{ withCredentials: true, fetch }
		);

		if (ok && getAdminCommentsDto?.success && Array.isArray(getAdminCommentsDto.data?.commentsResult)) {
			return getAdminCommentsDto.data.commentsResult.map((row) => this.toAdminCommentPm(row));
		}
		return [];
	}

	/** @deprecated Use {@link getAdminComments}. */
	async getAdminListingComments(
		params?: { limit?: number; searchTerm?: string | null },
		fetch?: typeof globalThis.fetch
	): Promise<AdminListingCommentProgrammerModel[]> {
		return this.getAdminComments(params, fetch);
	}

	async getAdminActivities(
		params?: { limit?: number },
		fetch?: typeof globalThis.fetch
	): Promise<AdminListingActivityProgrammerModel[]> {
		const query: Record<string, string | number> = {
			limit: params?.limit ?? 100
		};

		const { data: getAdminActivitiesDto, ok } = await this.httpGateway.get<GetAdminListingActivitiesResponseDto>(
			this.config.endpoints.getAdminActivities,
			query,
			{ withCredentials: true, fetch }
		);

		if (ok && getAdminActivitiesDto?.success && Array.isArray(getAdminActivitiesDto.data?.activitiesResult)) {
			return getAdminActivitiesDto.data.activitiesResult.map((row) => this.toAdminActivityPm(row));
		}
		return [];
	}

	/** @deprecated Use {@link getAdminActivities}. */
	async getAdminListingActivities(
		params?: { limit?: number },
		fetch?: typeof globalThis.fetch
	): Promise<AdminListingActivityProgrammerModel[]> {
		return this.getAdminActivities(params, fetch);
	}

	async approveComment(commentId: string, fetch?: typeof globalThis.fetch): Promise<ListingUpsertProgrammerModel> {
		try {
			const { data: approveCommentDto, ok } = await this.httpGateway.request<ApproveListingCommentResponseDto>({
				method: HttpMethod.PATCH,
				url: this.config.endpoints.approveComment(commentId),
				withCredentials: true,
				fetch
			});
			if (ok && approveCommentDto?.success) {
				return { ok: true, id: approveCommentDto.data?.id ?? commentId };
			}
			return { ok: false, error: approveCommentDto?.message ?? 'Failed to approve comment.' };
		} catch (err) {
			return { ok: false, error: this.extractMessage(err) };
		}
	}

	/** @deprecated Use {@link approveComment}. */
	async approveListingComment(commentId: string, fetch?: typeof globalThis.fetch): Promise<ListingUpsertProgrammerModel> {
		return this.approveComment(commentId, fetch);
	}

	async deleteComment(commentId: string, fetch?: typeof globalThis.fetch): Promise<ListingUpsertProgrammerModel> {
		try {
			const { data: deleteCommentDto, ok } = await this.httpGateway.delete<DeleteListingCommentResponseDto>(
				this.config.endpoints.deleteComment(commentId),
				{ withCredentials: true, fetch }
			);
			if (ok && deleteCommentDto?.success) return { ok: true };
			return { ok: false, error: deleteCommentDto?.message ?? 'Failed to delete comment.' };
		} catch (err) {
			return { ok: false, error: this.extractMessage(err) };
		}
	}

	/** @deprecated Use {@link deleteComment}. */
	async deleteListingComment(commentId: string, fetch?: typeof globalThis.fetch): Promise<ListingUpsertProgrammerModel> {
		return this.deleteComment(commentId, fetch);
	}

	async trackView(listingId: string, fetch?: typeof globalThis.fetch): Promise<ListingUpsertProgrammerModel> {
		return this.incrementViews(listingId, fetch);
	}

	async incrementViews(listingId: string, fetch?: typeof globalThis.fetch): Promise<ListingUpsertProgrammerModel> {
		try {
			const { data: trackViewDto, ok } = await this.httpGateway.put<TrackListingStatResponseDto>(
				this.config.endpoints.trackView(listingId),
				undefined,
				{ withCredentials: true, fetch }
			);
			if (ok && trackViewDto?.success) return { ok: true };
			return { ok: false, error: trackViewDto?.message ?? 'Failed to record view.' };
		} catch (err) {
			return { ok: false, error: this.extractMessage(err) };
		}
	}

	async incrementLikes(listingId: string, fetch?: typeof globalThis.fetch): Promise<ListingUpsertProgrammerModel> {
		try {
			const { data: trackLikeDto, ok } = await this.httpGateway.put<TrackListingStatResponseDto>(
				this.config.endpoints.trackLike(listingId),
				undefined,
				{ withCredentials: true, fetch }
			);
			if (ok && trackLikeDto?.success) return { ok: true };
			return { ok: false, error: trackLikeDto?.message ?? 'Failed to record like.' };
		} catch (err) {
			return { ok: false, error: this.extractMessage(err) };
		}
	}

	async incrementClicks(listingId: string, fetch?: typeof globalThis.fetch): Promise<ListingUpsertProgrammerModel> {
		try {
			const { data: trackClickDto, ok } = await this.httpGateway.put<TrackListingStatResponseDto>(
				this.config.endpoints.trackClick(listingId),
				undefined,
				{ withCredentials: true, fetch }
			);
			if (ok && trackClickDto?.success) return { ok: true };
			return { ok: false, error: trackClickDto?.message ?? 'Failed to record click.' };
		} catch (err) {
			return { ok: false, error: this.extractMessage(err) };
		}
	}

	async importFromGithub(
		githubUrl: string,
		extensionType?: 'skills' | 'mcp' | 'both' | null,
		fetch?: typeof globalThis.fetch
	): Promise<
		| { ok: true; preview: ListingGithubImportPreviewProgrammerModel }
		| { ok: false; error: string }
	> {
		try {
			const { data: importDto, ok } = await this.httpGateway.post<ListingGithubImportResponseDto>(
				this.config.endpoints.importFromGithub,
				{ githubUrl, ...(extensionType ? { extensionType } : {}) },
				{ withCredentials: true, fetch }
			);
			if (ok && importDto?.success && importDto.data) {
				return { ok: true, preview: importDto.data };
			}
			return { ok: false, error: importDto?.message ?? 'GitHub import failed.' };
		} catch (err) {
			return { ok: false, error: this.extractMessage(err) };
		}
	}

	async syncFromGithub(
		listingId: string,
		fetch?: typeof globalThis.fetch
	): Promise<
		| { ok: true; result: ListingGithubSyncResultProgrammerModel }
		| { ok: false; error: string }
	> {
		try {
			const { data: syncDto, ok } = await this.httpGateway.post<ListingGithubSyncResponseDto>(
				this.config.endpoints.syncFromGithub(listingId),
				undefined,
				{ withCredentials: true, fetch }
			);
			if (ok && syncDto?.success && syncDto.data) {
				return { ok: true, result: syncDto.data };
			}
			return { ok: false, error: syncDto?.message ?? 'GitHub sync failed.' };
		} catch (err) {
			return { ok: false, error: this.extractMessage(err) };
		}
	}

	private toListingUpsertBody(
		payload: ListingFormSchemaType,
		listingTagsData: Array<{ id: string; slug: string }>
	): {
		listingData: Record<string, unknown>;
		listingTagsData: Array<{ id: string; slug: string }>;
		stackMembersData: Array<{ member_listing_id: string; member_role: string; sort_order: number }>;
	} {
		const { tag_ids: _tagIds, stack_members: stackMembers, ...listingFields } = payload as ListingFormSchemaType & {
			stack_members?: Array<{ member_listing_id: string; member_role: string; sort_order: number }>;
		};
		return {
			listingData: listingFields,
			listingTagsData,
			stackMembersData: (stackMembers ?? []).map((member, index) => ({
				member_listing_id: member.member_listing_id,
				member_role: member.member_role,
				sort_order: member.sort_order ?? index
			}))
		};
	}

	private toListingCreatorPm(row: ListingCreatorDto): ListingCreatorProgrammerModel {
		return {
			id: row.id,
			username: row.username ?? null,
			fullName: row.full_name ?? null,
			avatarUrl: row.avatar_url ?? null,
			tagLine: row.tag_line ?? null,
			extensionCount: row.extension_count ?? 0,
			stackCount: row.stack_count ?? 0,
			totalLikes: row.total_likes ?? 0,
			totalBookmarks: row.total_bookmarks ?? 0
		};
	}

	private toListingPm(row: ListingDto): ListingProgrammerModel {
		return {
			id: row.id,
			ownerId: row.ownerId ?? null,
			title: row.title,
			slug: row.slug,
			description: row.description ?? null,
			descriptionSkills: row.descriptionSkills ?? null,
			descriptionMcp: row.descriptionMcp ?? null,
			excerpt: row.excerpt ?? null,
			clickUrl: row.clickUrl ?? null,
			clickUrlSkills: row.clickUrlSkills ?? null,
			clickUrlMcp: row.clickUrlMcp ?? null,
			content: row.content ?? null,
			contentSkills: row.contentSkills ?? null,
			contentMcp: row.contentMcp ?? null,
			listingKind: row.listingKind,
			extensionType: row.extensionType ?? null,
			installCommandSkills: row.installCommandSkills ?? null,
			installCommandMcp: row.installCommandMcp ?? null,
			isOfficial: row.isOfficial,
			sourceRepoUrl: row.sourceRepoUrl ?? null,
			skillSourceUrl: row.skillSourceUrl ?? null,
			skillName: row.skillName ?? null,
			skillMetadata: row.skillMetadata ?? null,
			sourceSyncedAt: row.sourceSyncedAt ?? null,
			sourceContentHash: row.sourceContentHash ?? null,
			license: row.license ?? null,
			version: row.version ?? null,
			mcpTools: row.mcpTools ?? [],
			skillCommands: row.skillCommands ?? [],
			stackBlueprint: row.stackBlueprint ?? null,
			mcpTransport: row.mcpTransport ?? null,
			mcpServerConfig: row.mcpServerConfig ?? null,
			likes: row.likes ?? 0,
			views: row.views ?? 0,
			clicks: row.clicks ?? 0,
			bookmarkCount: row.bookmarkCount ?? 0,
			averageRating: row.averageRating ?? 0,
			ratingsCount: row.ratingsCount ?? 0,
			isUserPublished: row.isUserPublished,
			isAdminPublished: row.isAdminPublished,
			schemaType: row.schemaType ?? null,
			schemaJson: row.schemaJson ?? null,
			listingCategoryId: row.listingCategoryId ?? null,
			defaultImageUrl: row.defaultImageUrl ?? null,
			listingImageUrls: row.listingImageUrls ?? [],
			logoImageUrl: row.logoImageUrl ?? null,
			faq: Array.isArray(row.faq) ? (row.faq as ListingFaqItemProgrammerModel[]) : null,
			listingTagSlugs: row.listingTagSlugs ?? [],
			createdAt: row.createdAt,
			updatedAt: row.updatedAt ?? null,
			publishedAt: row.publishedAt ?? null,
			category: row.category ? { ...row.category } : null,
			tags: row.tags?.map((t) => ({ ...t })) ?? [],
			owner: row.owner
				? {
						id: row.owner.id,
						fullName: row.owner.fullName ?? null,
						username: row.owner.username ?? null,
						avatarUrl: row.owner.avatarUrl ?? null,
						tagLine: row.owner.tagLine ?? null
					}
				: null,
			stackMembers: (row.stackMembers ?? []).map((member) => ({
				id: member.id,
				memberListingId: member.memberListingId,
				memberRole: member.memberRole,
				sortOrder: member.sortOrder,
				member: member.member
					? {
							id: member.member.id,
							title: member.member.title,
							slug: member.member.slug,
							extensionType: member.member.extensionType ?? null,
							excerpt: member.member.excerpt ?? null,
							logoImageUrl: member.member.logoImageUrl ?? null,
							isOfficial: member.member.isOfficial,
							installCommandSkills: member.member.installCommandSkills ?? null,
							installCommandMcp: member.member.installCommandMcp ?? null,
							clickUrlSkills: member.member.clickUrlSkills ?? null,
							clickUrlMcp: member.member.clickUrlMcp ?? null
						}
					: null
			}))
		};
	}

	private toListingCommentPm(row: ListingCommentDto): ListingCommentProgrammerModel {
		return {
			id: row.id,
			content: row.content,
			isApproved: row.isApproved,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt ?? null,
			parentId: row.parentId ?? null,
			userId: row.userId,
			author: row.author
				? {
						id: row.author.id,
						fullName: row.author.fullName ?? null,
						avatarUrl: row.author.avatarUrl ?? null
					}
				: null
		};
	}

	private toCategoryPm(row: ListingCategoryDto): ListingCategoryProgrammerModel {
		return {
			id: row.id,
			name: row.name,
			slug: row.slug,
			parentPath: row.parent_path ?? '/',
			description: row.description ?? null,
			parentId: row.parent_id ?? null,
			parent: null,
			headline: row.headline ?? null,
			emoji: row.emoji ?? null,
			color: row.color ?? null,
			imageUrlHero: row.image_url_hero ?? null,
			imageUrlSmall: row.image_url_small ?? null,
			href: row.href ?? null
		};
	}

	private toTagPm(row: ListingTagDto): ListingTagProgrammerModel {
		return {
			id: row.id,
			name: row.name,
			slug: row.slug,
			description: row.description ?? null,
			headline: row.headline ?? null,
			emoji: row.emoji ?? null,
			color: row.color ?? null,
			imageUrlHero: row.image_url_hero ?? null,
			imageUrlSmall: row.image_url_small ?? null,
			href: row.href ?? null,
			tagGroups: this.normalizeTagGroups(row.listing_tag_groups)
		};
	}

	private normalizeTagGroups(
		raw: ListingTagDto['listing_tag_groups']
	): ListingTagGroupProgrammerModel[] {
		if (!raw?.length) return [];

		const groups: ListingTagGroupProgrammerModel[] = [];
		const seen = new Set<string>();

		for (const entry of raw) {
			const group =
				entry && 'listing_tag_groups' in entry
					? entry.listing_tag_groups
					: entry;
			if (!group?.id || seen.has(group.id)) continue;
			seen.add(group.id);
			groups.push({ id: group.id, name: group.name });
		}

		return groups.sort((a, b) => a.name.localeCompare(b.name));
	}

	private toAdminCommentPm(row: AdminListingCommentDto): AdminListingCommentProgrammerModel {
		return {
			id: row.id,
			content: row.content,
			isApproved: row.isApproved,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
			parentId: row.parentId,
			userId: row.userId,
			listingId: row.listingId,
			author: row.author
				? {
						id: row.author.id,
						fullName: row.author.fullName ?? null,
						avatarUrl: row.author.avatarUrl ?? null
					}
				: null,
			listing: row.listing ? { ...row.listing } : null
		};
	}

	private toAdminActivityPm(row: AdminListingActivityDto): AdminListingActivityProgrammerModel {
		return {
			id: row.id,
			activityType: row.activityType,
			createdAt: row.createdAt,
			userId: row.userId,
			listingId: row.listingId,
			author: row.author
				? {
						id: row.author.id,
						fullName: row.author.fullName ?? null,
						avatarUrl: row.author.avatarUrl ?? null
					}
				: null,
			listing: row.listing ? { ...row.listing } : null
		};
	}

	private extractMessage(err: unknown): string {
		if (err && typeof err === 'object' && 'data' in err) {
			const data = (err as { data?: unknown }).data;
			if (data && typeof data === 'object' && 'message' in data && typeof (data as { message?: string }).message === 'string') {
				return (data as { message: string }).message;
			}
		}
		if (err instanceof Error) return err.message;
		return 'An error occurred. Please try again.';
	}
}
