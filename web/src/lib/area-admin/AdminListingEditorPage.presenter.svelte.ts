import type { ListingRepository } from '$lib/listings/Listing.repository.svelte';

import type {
	ListingEditorViewModel,
	ListingCategoryViewModel,
	ListingTagViewModel
} from '$lib/listings/GetListing.presenter.svelte';
import type { ListingFormSchemaType, ListingExtensionFormSchemaType, ListingStackFormSchemaType } from '$lib/listings/listing.types';
import { listingExtensionFormSchema, listingStackFormSchema } from '$lib/listings/listing.types';

export class AdminListingEditorPagePresenter {
	public listing: ListingEditorViewModel | null = $state(null);
	public categoryChoices: ListingCategoryViewModel[] = $state([]);
	public tagChoices: ListingTagViewModel[] = $state([]);
	public listingKind: 'extension' | 'stack' = $state('extension');
	public loadingListing = $state(false);
	public loadingTaxonomy = $state(false);
	public submitting = $state(false);
	public showToastMessage = $state(false);
	public toastMessage = $state('');
	public redirectToList = $state(false);

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
		await Promise.all([loadListing, this.loadTaxonomy(fetch)]);
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

	getFormDefaults(): Partial<ListingFormSchemaType> {
		const listing = this.listing;
		if (!listing) {
			return {
				title: '',
				excerpt: '',
				description: '',
				content: '',
				listing_kind: this.listingKind,
				extension_type: null,
				install_command_skills: '',
				install_command_mcp: '',
				is_official: false,
				listing_category_id: null,
				tag_ids: [],
				is_user_published: false,
				is_admin_published: false
			};
		}
		return {
			id: listing.id,
			title: listing.title,
			excerpt: listing.excerpt ?? '',
			description: listing.description ?? '',
			content: listing.content ?? '',
			listing_kind: listing.listingKind as 'extension' | 'stack',
			extension_type: (listing.extensionType as 'skills' | 'mcp' | 'both' | null) ?? null,
			install_command_skills: listing.installCommandSkills ?? '',
			install_command_mcp: listing.installCommandMcp ?? '',
			is_official: listing.isOfficial,
			listing_category_id: listing.listingCategoryId,
			tag_ids: listing.tags.map((t) => t.id),
			is_user_published: listing.isUserPublished,
			is_admin_published: listing.isAdminPublished
		};
	}
}
