<script lang="ts">
	import type { MediaLibraryItemViewModel } from '$lib/medias/GetMedia.presenter.svelte';
	import type { PostMediaProgrammerModel } from '$lib/posts';

	import { icons } from '$data/icons';
	import {
		getMediaPresenter,
		MEDIA_VIRTUAL_GENERAL,
		normalizeMediaVirtualPath,
		publicUrlForMediaStorageKey
	} from '$lib/medias';
	import {
		childVirtualFolders,
		folderPickerLabel,
		isWithinVirtualFolder,
		mediaVirtualBreadcrumbs,
		topLevelVirtualFolders
	} from '$lib/medias/utils/mediaVirtualFolderBrowse';
	import { createRemotePagination } from '$lib/ui/helpers/createRemotePagination.svelte';
	import { toast } from '$lib/ui/sonner';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import PaginationComposite from '$lib/ui/pagination/pagination-composite.svelte';
	import * as Dialog from '$lib/ui/dialog';
	import * as InputGroup from '$lib/ui/input-group';

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
	let allImagesVm = $state<MediaLibraryItemViewModel[]>([]);
	let folderPaths = $state<string[]>([MEDIA_VIRTUAL_GENERAL]);
	let currentVirtualPath = $state(MEDIA_VIRTUAL_GENERAL);
	let searchQuery = $state('');
	let searchInput = $state.raw<HTMLInputElement | null>(null);

	const attachedPathSet = $derived(new Set(attachedPaths));
	const pickerDisabled = $derived(disabled);
	const currentPage = $derived(pagination.currentPage);
	const itemsPerPage = $derived(pagination.itemsPerPage);
	const searchActive = $derived(searchQuery.trim().length > 0);
	const breadcrumbs = $derived(mediaVirtualBreadcrumbs(currentVirtualPath));
	const topLevelFolders = $derived(
		searchActive ? [] : topLevelVirtualFolders(folderPaths)
	);
	const subFolders = $derived(
		searchActive ? [] : childVirtualFolders(currentVirtualPath, folderPaths)
	);

	const filteredImages = $derived.by(() => {
		const q = searchQuery.trim().toLowerCase();
		let rows = allImagesVm;
		if (q) {
			rows = rows.filter((item) => item.name.toLowerCase().includes(q));
		} else {
			const folder = normalizeMediaVirtualPath(currentVirtualPath);
			rows = rows.filter(
				(item) => normalizeMediaVirtualPath(item.virtualPath) === folder
			);
		}
		return rows;
	});

	const totalItems = $derived(filteredImages.length);
	const totalPages = $derived(Math.max(1, Math.ceil(totalItems / Math.max(itemsPerPage, 1))));
	const showPagination = $derived(totalPages > 1);
	const itemsVm = $derived(
		filteredImages.slice(
			(currentPage - 1) * itemsPerPage,
			currentPage * itemsPerPage
		)
	);

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

	async function loadLibrary(): Promise<void> {
		const orgId = organizationId?.trim();
		if (!orgId) {
			allImagesVm = [];
			folderPaths = [MEDIA_VIRTUAL_GENERAL];
			return;
		}
		loading = true;
		try {
			const browseVm = await getMediaPresenter.loadMediaPickerBrowseVm(orgId);
			allImagesVm = browseVm.images;
			folderPaths = browseVm.folderPaths;
		} finally {
			loading = false;
		}
	}

	function resetBrowseState(): void {
		searchQuery = '';
		currentVirtualPath = MEDIA_VIRTUAL_GENERAL;
		pagination.resetToFirstPage();
	}

	function navigateToFolder(path: string): void {
		searchQuery = '';
		currentVirtualPath = normalizeMediaVirtualPath(path);
		pagination.resetToFirstPage();
	}

	function setCurrentPage(page: number): void {
		if (page < 1 || page === pagination.currentPage) return;
		pagination.currentPage = page;
	}

	function setItemsPerPage(size: number): void {
		pagination.setItemsPerPage(size);
		pagination.resetToFirstPage();
	}

	function paginateFrontFF(): void {
		const tp = Math.max(totalPages, 1);
		if (tp > 1) setCurrentPage(tp);
	}

	function paginateBackFF(): void {
		setCurrentPage(1);
	}

	function onSearchInput(e: Event): void {
		searchQuery = (e.currentTarget as HTMLInputElement).value;
		pagination.resetToFirstPage();
	}

	function focusSearch(): void {
		searchInput?.focus();
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
		if (!open) {
			resetBrowseState();
			return;
		}
		const orgId = organizationId?.trim();
		if (!orgId) {
			allImagesVm = [];
			folderPaths = [MEDIA_VIRTUAL_GENERAL];
			return;
		}
		resetBrowseState();
		void loadLibrary();
	});

	$effect(() => {
		if (pagination.currentPage > totalPages) {
			pagination.currentPage = totalPages;
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class="max-h-[90vh] max-w-xl gap-4 overflow-y-auto"
		onOpenAutoFocus={(e) => e.preventDefault()}
	>
		<Dialog.Header>
			<Dialog.Title>Media library</Dialog.Title>
			<Dialog.Description class="text-base-content/75 text-sm">
				Browse folders or search by name, then click a thumbnail to attach it to your post.
			</Dialog.Description>
		</Dialog.Header>

		{#if !organizationId?.trim()}
			<p class="text-center text-sm text-base-content/70">Select a workspace to browse media.</p>
		{:else}
			<label class="sr-only" for="composer-media-library-search">Search media library</label>
			<InputGroup.Root class="shadow-xs">
				<InputGroup.Addon align="inline-start" class="pl-2.5">
					<button
						type="button"
						tabindex="-1"
						class="text-base-content/50 hover:text-base-content/80 flex touch-manipulation items-center justify-center rounded p-0.5 transition-colors"
						aria-label="Focus search"
						onclick={focusSearch}
					>
						<AbstractIcon
							name={icons.Search.name}
							class="pointer-events-none size-4"
							width="16"
							height="16"
						/>
					</button>
				</InputGroup.Addon>
				<InputGroup.Input
					bind:ref={searchInput}
					id="composer-media-library-search"
					type="search"
					bind:value={searchQuery}
					placeholder="Search by file name…"
					autocomplete="off"
					disabled={loading && allImagesVm.length === 0}
					oninput={onSearchInput}
				/>
			</InputGroup.Root>

			{#if !searchActive}
				<nav
					class="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs text-base-content/80"
					aria-label="Current folder"
				>
					{#each breadcrumbs as crumb, index (crumb.path)}
						{#if index > 0}
							<span class="text-base-content/35 select-none px-0.5" aria-hidden="true">›</span>
						{/if}
						{#if index === breadcrumbs.length - 1}
							<span class="font-medium text-base-content">{crumb.label}</span>
						{:else}
							<button
								type="button"
								class="link link-hover text-primary font-normal"
								onclick={() => navigateToFolder(crumb.path)}
							>
								{crumb.label}
							</button>
						{/if}
					{/each}
				</nav>

				<div class="flex flex-col gap-1.5">
					{#if topLevelFolders.length > 0}
						<div class="flex gap-2 overflow-x-auto pb-0.5" aria-label="Library folders">
							{#each topLevelFolders as folder (folder)}
								{@const active = isWithinVirtualFolder(currentVirtualPath, folder)}
								<button
									type="button"
									class="btn btn-sm shrink-0 gap-1.5 rounded-lg border font-mono text-xs {active
										? 'btn-primary border-primary'
										: 'btn-ghost border-base-300/80'}"
									aria-current={active ? 'location' : undefined}
									onclick={() => navigateToFolder(folder)}
								>
									<AbstractIcon
										name={icons.FolderInput.name}
										class="size-4 shrink-0 {active
											? 'text-primary-content'
											: 'text-primary/80'}"
										width="16"
										height="16"
									/>
									{folderPickerLabel(folder)}
								</button>
							{/each}
						</div>
					{/if}

					{#if subFolders.length > 0}
						<div class="flex gap-2 overflow-x-auto pb-0.5" aria-label="Subfolders">
							{#each subFolders as folder (folder)}
								<button
									type="button"
									class="btn btn-sm btn-ghost border-base-300/80 shrink-0 gap-1.5 rounded-lg border font-mono text-xs"
									onclick={() => navigateToFolder(folder)}
								>
									<AbstractIcon
										name={icons.FolderInput.name}
										class="size-4 shrink-0 text-primary/80"
										width="16"
										height="16"
									/>
									{folderPickerLabel(folder)}
								</button>
							{/each}
						</div>
					{/if}
				</div>
			{:else}
				<p class="text-base-content/60 text-xs">Searching all folders</p>
			{/if}

			{#if loading && allImagesVm.length === 0}
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
					<AbstractIcon
						name={icons.Image.name}
						class="size-10 text-base-content/45"
						width="40"
						height="40"
					/>
					{#if searchActive}
						<p class="text-sm text-base-content/70">No images match your search.</p>
					{:else if allImagesVm.length === 0}
						<p class="text-sm text-base-content/70">No images in your library yet.</p>
						<p class="text-base-content/55 max-w-xs text-xs">
							Upload images from your device or the account media page, then pick them here.
						</p>
					{:else}
						<p class="text-sm text-base-content/70">No images in this folder.</p>
						<p class="text-base-content/55 max-w-xs text-xs">
							Open another folder above or search by file name.
						</p>
					{/if}
				</div>
			{:else}
				<div class="relative">
					{#if loading}
						<div
							class="bg-base-100/70 absolute inset-0 z-10 flex items-center justify-center rounded-lg backdrop-blur-[1px]"
							aria-busy="true"
							aria-label="Loading library"
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
									aria-label={alreadyAttached
										? `${item.name} (attached)`
										: `Attach ${item.name}`}
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
							No images on this page. Try another page.
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
						nameOfItems="images"
						pageSizeOptions={[12, 24, 48]}
					/>
				{/if}
			{/if}
		{/if}

		<Dialog.Footer>
			<Button type="button" variant="ghost" onclick={() => (open = false)}>Done</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
