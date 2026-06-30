import type { ListingRepository } from '$lib/listings/Listing.repository.svelte';

import type {
	ListingEditorViewModel,
	ListingCategoryViewModel,
	ListingTagViewModel
} from '$lib/listings/GetListing.presenter.svelte';
import type { ListingGithubImportPreviewProgrammerModel } from '$lib/listings/Listing.repository.svelte';
import type {
	ListingFormSchemaType,
	ListingExtensionFormSchemaType,
	ListingStackFormSchemaType
} from '$lib/listings/listing.types';
import { listingExtensionFormSchema, listingStackFormSchema } from '$lib/listings/listing.types';
import {
	getDefaultSchemaTypeForListingKind,
	getSchemaTypeForExtensionCategory
} from '$lib/listings/constants/listingSchemaTypes';

export class AdminListingEditorPagePresenter {
	public listing: ListingEditorViewModel | null = $state(null);
	public categoryChoices: ListingCategoryViewModel[] = $state([]);
	public tagChoices: ListingTagViewModel[] = $state([]);
	public listingKind: 'extension' | 'stack' = $state('extension');
	public loadingListing = $state(false);
	public loadingTaxonomy = $state(false);
	public submitting = $state(false);
	public importingGithub = $state(false);
	public syncingGithub = $state(false);
	public showToastMessage = $state(false);
	public toastMessage = $state('');
	public redirectToList = $state(false);
	public extensionChoices: Array<{
		id: string;
		title: string;
		slug: string;
		extensionType: string | null;
	}> = $state([]);

	constructor(private readonly listingRepository: ListingRepository) {}

	async loadListingById(listingId: string, fetch?: typeof globalThis.fetch): Promise<boolean> {
		this.loadingListing = true;
		try {
			const listing = await this.listingRepository.getListingById(listingId, fetch);
			this.listing = listing;
			if (listing?.listingKind === 'stack' || listing?.listingKind === 'extension') {
				this.listingKind = listing.listingKind;
			}
			return listing != null;
		} finally {
			this.loadingListing = false;
		}
	}

	async loadTaxonomy(fetch?: typeof globalThis.fetch): Promise<void> {
		this.loadingTaxonomy = true;
		try {
			const [categories, tags] = await Promise.all([
				this.listingRepository.getAllCategories(fetch),
				this.listingRepository.getAllTags(fetch)
			]);
			this.categoryChoices = categories;
			this.tagChoices = tags;
		} finally {
			this.loadingTaxonomy = false;
		}
	}

	async init(
		listingId: string | undefined,
		listingKind: 'extension' | 'stack',
		fetch?: typeof globalThis.fetch
	): Promise<{ listingFound: boolean }> {
		this.listingKind = listingKind;
		if (!listingId) {
			this.listing = null;
		}
		const loadListing = listingId ? this.loadListingById(listingId, fetch) : Promise.resolve(false);
		const loadExtensions =
			listingKind === 'stack' ? this.loadExtensionChoices(fetch) : Promise.resolve();
		await Promise.all([loadListing, this.loadTaxonomy(fetch), loadExtensions]);
		const listingFound = !listingId || this.listing != null;
		return { listingFound };
	}

	async submit(formData: ListingFormSchemaType, fetch?: typeof globalThis.fetch): Promise<void> {
		this.submitting = true;
		this.showToastMessage = false;
		try {
			const id = formData.id ?? '';
			const isUpdate = !!id && id.length > 0;
			const tagSlugById = new Map(this.tagChoices.map((t) => [t.id, t.slug]));
			const listingTagsData = (formData.tag_ids ?? []).map((id) => ({
				id,
				slug: tagSlugById.get(id) ?? id
			}));
			const payload = {
				...formData,
				listing_kind: this.listingKind
			} as ListingFormSchemaType;
			const schema =
				this.listingKind === 'extension' ? listingExtensionFormSchema : listingStackFormSchema;
			const parsed = schema.safeParse(payload);
			if (!parsed.success) {
				this.toastMessage = parsed.error.issues.map((i) => i.message).join(' ');
				this.showToastMessage = true;
				return;
			}
			const resultPm = isUpdate
				? await this.listingRepository.updateListing(id, parsed.data, listingTagsData, fetch)
				: await this.listingRepository.createListing(parsed.data, listingTagsData, fetch);

			if (resultPm.ok) {
				this.toastMessage = isUpdate ? 'Listing updated.' : 'Listing created.';
				this.showToastMessage = true;
				this.redirectToList = true;
			} else {
				this.toastMessage = resultPm.error ?? 'Something went wrong.';
				this.showToastMessage = true;
			}
		} finally {
			this.submitting = false;
		}
	}

	async loadExtensionChoices(fetch?: typeof globalThis.fetch): Promise<void> {
		const listings = await this.listingRepository.getAdminListings(
			{ listingKind: 'extension', limit: 500 },
			fetch
		);
		this.extensionChoices = listings
			.filter((listing) => listing.listingKind === 'extension')
			.map((listing) => ({
				id: listing.id,
				title: listing.title,
				slug: listing.slug,
				extensionType: listing.extensionType
			}));
	}

	getFormDefaults(): Partial<ListingFormSchemaType> {
		const listing = this.listing;
		if (!listing) {
			return {
				title: '',
				excerpt: '',
				click_url: '',
				click_url_skills: '',
				click_url_mcp: '',
				description: '',
				description_skills: '',
				description_mcp: '',
				content: '',
				content_skills: '',
				content_mcp: '',
				listing_kind: this.listingKind,
				extension_type: this.listingKind === 'extension' ? 'skills' : undefined,
				install_command_skills: '',
				install_command_mcp: '',
				is_official: false,
				source_repo_url: '',
				skill_source_url: '',
				skill_name: '',
				license: '',
				version: '',
				mcp_tools: [],
				mcp_transport: null,
				mcp_server_config: null,
				listing_category_id: '',
				tag_ids: [],
				is_user_published: false,
				is_admin_published: false,
				schema_type: getDefaultSchemaTypeForListingKind(this.listingKind),
				faq: [],
				stack_members: []
			};
		}
		const categorySlug = listing.category?.slug;
		const schemaType =
			(listing.schemaType as ListingFormSchemaType['schema_type']) ??
			(this.listingKind === 'extension'
				? getSchemaTypeForExtensionCategory(categorySlug)
				: getDefaultSchemaTypeForListingKind('stack'));
		const faq = listing.faq?.map((item) => ({
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
			listing_kind: listing.listingKind as 'extension' | 'stack',
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
			mcp_tools: listing.mcpTools ?? [],
			mcp_transport: (listing.mcpTransport as 'stdio' | 'sse' | 'http' | null) ?? null,
			mcp_server_config: listing.mcpServerConfig,
			listing_category_id: listing.listingCategoryId ?? '',
			tag_ids: listing.tags.map((t) => t.id),
			is_user_published: listing.isUserPublished,
			is_admin_published: listing.isAdminPublished,
			schema_type: schemaType,
			faq,
			stack_members: (listing.stackMembers ?? []).map((member, index) => ({
				member_listing_id: member.memberListingId,
				member_role: member.memberRole as 'skills' | 'mcp',
				sort_order: member.sortOrder ?? index
			}))
		};
	}

	async importFromGithub(
		githubUrl: string,
		extensionType?: 'skills' | 'mcp' | 'both' | null,
		fetch?: typeof globalThis.fetch
	): Promise<{ ok: true; preview: ListingGithubImportPreviewProgrammerModel } | { ok: false; error: string }> {
		this.importingGithub = true;
		try {
			return await this.listingRepository.importFromGithub(githubUrl, extensionType, fetch);
		} finally {
			this.importingGithub = false;
		}
	}

	async syncFromGithub(
		listingId: string,
		fetch?: typeof globalThis.fetch
	): Promise<{ ok: true; message: string } | { ok: false; error: string }> {
		this.syncingGithub = true;
		try {
			const resultPm = await this.listingRepository.syncFromGithub(listingId, fetch);
			if (resultPm.ok) {
				await this.loadListingById(listingId, fetch);
				return {
					ok: true,
					message: resultPm.result.contentChanged
						? 'Content updated from GitHub.'
						: 'Already up to date with GitHub.'
				};
			}
			return { ok: false, error: resultPm.error };
		} finally {
			this.syncingGithub = false;
		}
	}
}
