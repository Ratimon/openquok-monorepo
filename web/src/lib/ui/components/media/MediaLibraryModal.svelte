<script lang="ts">
	import type { MediaLibraryItemViewModel } from '$lib/medias/GetMedia.presenter.svelte';
	import type { PostMediaProgrammerModel } from '$lib/posts';

	import { icons } from '$data/icons';
	import { getMediaPresenter, publicUrlForMediaStorageKey } from '$lib/medias';
	import { createRemotePagination } from '$lib/ui/helpers/createRemotePagination.svelte';
	import { toast } from '$lib/ui/sonner';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import PaginationComposite from '$lib/ui/pagination/pagination-composite.svelte';
	import * as Dialog from '$lib/ui/dialog';

	const PAGE_SIZE = 12;

	type Props = {
		open?: boolean;
		organizationId?: string | null;
		disabled?: boolean;
		/** When true, only one attachment is allowed (e.g. comments-only providers). */
		mediaLocked?: boolean;
		attachedPaths?: readonly string[];
		onAttach?: (items: PostMediaProgrammerModel[]) => void;
	};

	let {
		open = $bindable(false),
		organizationId = null,
		disabled = false,
		mediaLocked = false,
		attachedPaths = [],
		onAttach
	}: Props = $props();

	const pagination = createRemotePagination({ initialItemsPerPage: PAGE_SIZE });

	let loading = $state(false);
	let itemsVm = $state<MediaLibraryItemViewModel[]>([]);
	let totalPages = $state(1);
	let totalItems = $state(0);

	const attachedPathSet = $derived(new Set(attachedPaths));
	const pickerDisabled = $derived(disabled);
	const currentPage = $derived(pagination.currentPage);
	const itemsPerPage = $derived(pagination.itemsPerPage);
	const showPagination = $derived(totalPages > 1);

	function thumbSrc(item: MediaLibraryItemViewModel): string {
		const raw = item.thumbnailPublicUrl ?? item.publicUrl;
		if (raw?.trim()) return raw.trim();
		const thumb = item.thumbnail?.trim();
		if (thumb) {
			return thumb.startsWith('http://') || thumb.startsWith('https://')
				? thumb
				: publicUrlForMediaStorageKey(thumb);
		}
		return publicUrlForMediaStorageKey(item.path);
	}

	async function loadLibrary(page: number = pagination.currentPage): Promise<void> {
		const orgId = organizationId?.trim();
		if (!orgId) {
			itemsVm = [];
			totalItems = 0;
			totalPages = 1;
			return;
		}
		loading = true;
		try {
			const listVm = await getMediaPresenter.loadMediaLibraryListVm(
				orgId,
				page,
				pagination.itemsPerPage
			);
			itemsVm = listVm.results.filter((m) => m.kind === 'image');
			totalItems = listVm.total;
			totalPages = Math.max(listVm.pages, 1);
			pagination.currentPage = listVm.page;
		} finally {
			loading = false;
		}
	}

	function setCurrentPage(page: number): void {
		if (page < 1 || page === pagination.currentPage) return;
		pagination.currentPage = page;
		void loadLibrary(page);
	}

	function setItemsPerPage(size: number): void {
		pagination.setItemsPerPage(size);
		void loadLibrary(1);
	}

	function paginateFrontFF(): void {
		const tp = Math.max(totalPages, 1);
		if (tp > 1) setCurrentPage(tp);
	}

	function paginateBackFF(): void {
		setCurrentPage(1);
	}

	function attachItem(item: MediaLibraryItemViewModel): void {
		if (pickerDisabled) return;
		if (attachedPathSet.has(item.path)) {
			toast.info('This image is already attached.');
			return;
		}
		if (mediaLocked && attachedPaths.length > 0) {
			toast.error('Only one image is allowed for this channel.');
			return;
		}
		const row: PostMediaProgrammerModel = {
			id: crypto.randomUUID(),
			path: item.path,
			bucket: 'social_media'
		};
		onAttach?.([row]);
		toast.success('Image attached.');
		if (mediaLocked) {
			open = false;
		}
	}

	$effect(() => {
		if (!open) return;
		const orgId = organizationId?.trim();
		if (!orgId) {
			itemsVm = [];
			totalItems = 0;
			totalPages = 1;
			return;
		}
		pagination.resetToFirstPage();
		void loadLibrary(1);
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class="max-h-[90vh] max-w-lg gap-4 overflow-y-auto"
		onOpenAutoFocus={(e) => e.preventDefault()}
	>
		<Dialog.Header>
			<Dialog.Title>Media library</Dialog.Title>
			<Dialog.Description class="text-base-content/75 text-sm">
				Choose images already uploaded to this workspace. Click a thumbnail to attach it to your post.
			</Dialog.Description>
		</Dialog.Header>

		{#if !organizationId?.trim()}
			<p class="text-center text-sm text-base-content/70">Select a workspace to browse media.</p>
		{:else if loading && itemsVm.length === 0}
			<div class="flex items-center justify-center gap-2 py-10 text-sm text-base-content/70">
				<AbstractIcon
					name={icons.LoaderCircle.name}
					class="size-4 animate-spin"
					width="16"
					height="16"
				/>
				Loading library…
			</div>
		{:else if totalItems === 0 && !loading}
			<div class="flex flex-col items-center gap-3 py-8 text-center">
				<AbstractIcon name={icons.Image.name} class="size-10 text-base-content/45" width="40" height="40" />
				<p class="text-sm text-base-content/70">No images in your library yet.</p>
				<p class="text-base-content/55 max-w-xs text-xs">
					Upload images from your device or the account media page, then pick them here.
				</p>
			</div>
		{:else}
			<div class="relative">
				{#if loading}
					<div
						class="bg-base-100/70 absolute inset-0 z-10 flex items-center justify-center rounded-lg backdrop-blur-[1px]"
						aria-busy="true"
						aria-label="Loading page"
					>
						<AbstractIcon
							name={icons.LoaderCircle.name}
							class="size-5 animate-spin text-primary"
							width="20"
							height="20"
						/>
					</div>
				{/if}
				{#if itemsVm.length > 0}
					<div class="grid max-h-[min(48vh,20rem)] grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
						{#each itemsVm as item (item.id)}
							{@const alreadyAttached = attachedPathSet.has(item.path)}
							<button
								type="button"
								class="relative overflow-hidden rounded-lg border border-base-300 bg-base-100 transition-shadow hover:ring-2 hover:ring-primary disabled:cursor-not-allowed disabled:opacity-45 {alreadyAttached
									? 'ring-2 ring-primary/60'
									: ''}"
								disabled={pickerDisabled ||
									(mediaLocked && attachedPaths.length > 0 && !alreadyAttached)}
								title={alreadyAttached ? 'Already attached' : item.name}
								aria-label={alreadyAttached ? `${item.name} (attached)` : `Attach ${item.name}`}
								onclick={() => attachItem(item)}
							>
								<img
									src={thumbSrc(item)}
									alt=""
									class="aspect-square w-full object-cover"
									loading="lazy"
								/>
								{#if alreadyAttached}
									<span
										class="bg-primary/90 text-primary-content absolute inset-x-0 bottom-0 py-0.5 text-center text-[10px] font-medium"
									>
										Attached
									</span>
								{/if}
							</button>
						{/each}
					</div>
				{:else}
					<p class="py-8 text-center text-sm text-base-content/70">
						No images on this page. Try another page or upload new images.
					</p>
				{/if}
			</div>

			{#if showPagination}
				<PaginationComposite
					class="!mt-2 gap-3"
					{itemsPerPage}
					{totalItems}
					currentPage={currentPage}
					{totalPages}
					{setItemsPerPage}
					{setCurrentPage}
					{paginateFrontFF}
					{paginateBackFF}
					nameOfItems="media files"
					pageSizeOptions={[12, 24, 48]}
				/>
			{/if}
		{/if}

		<Dialog.Footer>
			<Button type="button" variant="ghost" onclick={() => (open = false)}>Done</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
