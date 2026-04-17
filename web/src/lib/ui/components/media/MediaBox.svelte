<script lang="ts">
	import type {
		MediaLibraryItemProgrammerModel,
		MediaListProgrammerModel
	} from '$lib/core/Media.repository.svelte';

	import { onDestroy, onMount } from 'svelte';

	import { mediaRepository } from '$lib/core';
	import { MAX_MEDIA_UPLOAD_BYTES } from '$lib/core/Media.repository.svelte';
	import { createAccountMediaUppy } from '$lib/media/accountMediaUppy';
	import { resolveMediaPreviewUrl } from '$lib/posts/mediaPreview';
	import { authenticationRepository } from '$lib/user-auth';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { icons } from '$data/icon';
	import { toast } from '$lib/ui/sonner';

	import Button from '$lib/ui/buttons/Button.svelte';
	import MultiMedia from '$lib/ui/components/media/MultiMedia.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import * as Dialog from '$lib/ui/dialog';
	import PaginationComposite from '$lib/ui/pagination/pagination-composite.svelte';

	const DEFAULT_PAGE_SIZE = 24;
	const ACCEPTED_MEDIA_TYPES = ['image/', 'video/'];

	type Props = {
		standalone?: boolean;
	};

	let { standalone: _standalone = true }: Props = $props();

	let items = $state<MediaLibraryItemProgrammerModel[]>([]);
	let loading = $state(true);
	type UploadPhase = 'idle' | 'encoding' | 'uploading';
	let uploadPhase = $state<UploadPhase>('idle');
	let barPercent = $state(0);
	let uploadDetailLine = $state('');
	let deletingPath = $state<string | null>(null);
	let dragOver = $state(false);
	let currentPage = $state(1);
	let totalPages = $state(1);
	let totalItems = $state(0);
	let itemsPerPage = $state(DEFAULT_PAGE_SIZE);
	let fileInput = $state.raw<HTMLInputElement | null>(null);

	let previewOpen = $state(false);
	let previewItem = $state<MediaLibraryItemProgrammerModel | null>(null);
	let previewUrl = $state('');

	let deleteConfirmOpen = $state(false);
	let deleteTarget = $state<MediaLibraryItemProgrammerModel | null>(null);

	const hasItems = $derived(items.length > 0);
	const uploadLimitLabel = `${Math.round(MAX_MEDIA_UPLOAD_BYTES / (1024 * 1024))} MB`;
	const uploadBusy = $derived(uploadPhase !== 'idle');
	const organizationId = $derived(workspaceSettingsPresenter.currentWorkspaceId ?? '');
	let lastLoadedOrganizationId = $state<string>('');

	function formatBytes(bytes: number): string {
		if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
		const units = ['B', 'KB', 'MB', 'GB'];
		let index = 0;
		let value = bytes;
		while (value >= 1024 && index < units.length - 1) {
			value /= 1024;
			index += 1;
		}
		return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
	}

	function isSupportedUpload(file: File): boolean {
		return ACCEPTED_MEDIA_TYPES.some((prefix) => file.type.startsWith(prefix));
	}

	async function loadMedia(page = currentPage): Promise<void> {
		loading = true;
		try {
			if (!organizationId) {
				items = [];
				totalItems = 0;
				totalPages = 1;
				currentPage = 1;
				return;
			}
			const result: MediaListProgrammerModel = await mediaRepository.listMedia(organizationId, page, itemsPerPage);
			items = result.results;
			totalItems = result.total;
			totalPages = Math.max(result.pages, 1);
			currentPage = result.page;
		} finally {
			loading = false;
		}
	}

	// Workspace id is loaded async; refresh list whenever it becomes available or changes.
	$effect(() => {
		if (!organizationId) return;
		if (organizationId === lastLoadedOrganizationId) return;
		lastLoadedOrganizationId = organizationId;
		currentPage = 1;
		void loadMedia(1);
	});

	let uppy = $state.raw<ReturnType<typeof createAccountMediaUppy> | null>(null);

	function queueFilesForUpload(fileList: FileList | null): void {
		if (!fileList?.length || !uppy || uploadBusy) return;
		if (!organizationId) {
			toast.error('Select a workspace first.');
			return;
		}

		const files = Array.from(fileList).filter(isSupportedUpload);
		if (!files.length) {
			toast.error('Upload images or videos only.');
			return;
		}

		for (const file of files) {
			try {
				uppy.addFile({
					source: 'Media library',
					name: file.name,
					type: file.type,
					data: file
				});
			} catch (e) {
				toast.error(e instanceof Error ? e.message : 'Could not add file.');
			}
		}
	}

	function deleteConfirmationCopy(item: MediaLibraryItemProgrammerModel): string {
		if (item.kind === 'video') return 'Are you sure you want to delete this video?';
		if (item.kind === 'image') return 'Are you sure you want to delete this image?';
		return 'Are you sure you want to delete this file?';
	}

	function openDeleteConfirm(item: MediaLibraryItemProgrammerModel): void {
		deleteTarget = item;
		deleteConfirmOpen = true;
	}

	function closeDeleteConfirm(): void {
		if (deletingPath) return;
		deleteConfirmOpen = false;
		deleteTarget = null;
	}

	async function confirmDelete(): Promise<void> {
		const item = deleteTarget;
		if (!item) return;

		deletingPath = item.path;
		try {
			if (!organizationId) {
				toast.error('Select a workspace first.');
				return;
			}
			const result = await mediaRepository.deleteMedia({ organizationId, id: item.id, path: item.path });
			if (!result.success) {
				toast.error(result.message || 'Could not delete media.');
				return;
			}
			deleteConfirmOpen = false;
			deleteTarget = null;
			await loadMedia(currentPage);
			toast.success('Media deleted.');
		} finally {
			deletingPath = null;
		}
	}

	function openPreview(item: MediaLibraryItemProgrammerModel): void {
		previewItem = item;
		previewOpen = true;
	}

	function setCurrentPage(page: number): void {
		if (page < 1 || page === currentPage) return;
		currentPage = page;
		void loadMedia(page);
	}

	function setItemsPerPageAndReload(size: number): void {
		itemsPerPage = size;
		currentPage = 1;
		void loadMedia(1);
	}

	function paginateFrontFF(): void {
		if (totalPages > 1) setCurrentPage(totalPages);
	}

	function paginateBackFF(): void {
		setCurrentPage(1);
	}

	onMount(() => {
		void loadMedia(1);

		const storageProvider = String(import.meta.env?.VITE_STORAGE_PROVIDER ?? '').trim().toLowerCase();
		const provider = (storageProvider === 'local' ? 'local' : 'cloudflare') as 'local' | 'cloudflare';

		const instance = createAccountMediaUppy({
			getAccessToken: () => authenticationRepository.getToken(),
			onUploadError: (err) => toast.error(err.message || 'Upload failed.'),
			getOrganizationId: () => workspaceSettingsPresenter.currentWorkspaceId ?? '',
			provider
		});
		uppy = instance;
		if (organizationId) instance.setMeta({ organizationId });

		instance.on('file-added', (file) => {
			if (String(file?.type ?? '').startsWith('image/')) {
				uploadPhase = 'encoding';
			}
		});

		instance.on('upload', () => {
			uploadPhase = 'uploading';
		});

		instance.on('progress', (value) => {
			const n = typeof value === 'number' ? value : 0;
			barPercent = n > 0 && n <= 1 ? Math.round(n * 100) : Math.min(100, Math.round(n));
		});

		instance.on('upload-progress', (_file, progress) => {
			uploadPhase = 'uploading';
			const { bytesUploaded, bytesTotal } = progress;
			if (bytesTotal != null && bytesTotal > 0 && bytesUploaded != null) {
				uploadDetailLine = `${formatBytes(bytesUploaded)} of ${formatBytes(bytesTotal)}`;
			}
		});

		instance.on('complete', (result) => {
			uploadPhase = 'idle';
			barPercent = 0;
			uploadDetailLine = '';
			const successful = result.successful ?? [];
			const failed = result.failed ?? [];
			const ok = successful.length;
			if (ok > 0) {
				currentPage = 1;
				void loadMedia(1);
				toast.success(ok === 1 ? 'Media uploaded.' : `${ok} files uploaded.`);
			}
			if (failed.length) {
				toast.error('One or more uploads failed.');
			}
			if (fileInput) fileInput.value = '';
		});
	});

	onDestroy(() => {
		try {
			uppy?.cancelAll();
		} catch {
			// ignore
		}
		uppy?.destroy();
		uppy = null;
	});

	$effect(() => {
		if (!previewOpen) {
			previewItem = null;
			previewUrl = '';
			return;
		}
		if (!previewItem) return;

		let cancelled = false;
		let blobUrlToRevoke: string | null = null;
		const directHref =
			previewItem.publicUrl ||
			`/api/v1/media/download?organizationId=${encodeURIComponent(organizationId)}&id=${encodeURIComponent(previewItem.id)}`;

		void resolveMediaPreviewUrl(directHref).then((url) => {
			if (cancelled) {
				if (url.startsWith('blob:')) URL.revokeObjectURL(url);
				return;
			}
			previewUrl = url;
			if (url.startsWith('blob:')) blobUrlToRevoke = url;
		});

		return () => {
			cancelled = true;
			if (blobUrlToRevoke?.startsWith('blob:')) URL.revokeObjectURL(blobUrlToRevoke);
		};
	});
</script>

{#if uploadBusy}
	<div class="pointer-events-none fixed inset-x-0 top-0 z-50">
		<div class="h-1 w-full overflow-hidden bg-base-300">
			{#if uploadPhase === 'encoding'}
				<div class="h-full w-full bg-warning/90 animate-pulse"></div>
			{:else}
				<div
					class="h-full bg-primary transition-[width] duration-150 ease-out"
					style={`width: ${barPercent}%`}
				></div>
			{/if}
		</div>
		<div
			class="pointer-events-auto flex items-start gap-2 border-b border-base-300/80 bg-base-100/95 px-4 py-2 text-sm shadow-sm backdrop-blur-sm"
		>
			<AbstractIcon
				name={icons.LoaderCircle.name}
				class={`mt-0.5 size-4 shrink-0 ${uploadPhase === 'encoding' ? 'text-warning' : 'text-primary'} animate-spin`}
				width="16"
				height="16"
			/>
			<div class="min-w-0 flex-1">
				<div class="font-medium text-base-content">
					{#if uploadPhase === 'encoding'}
						Encoding…
					{:else}
						Uploading: {barPercent}%
					{/if}
				</div>
				{#if uploadPhase === 'uploading' && uploadDetailLine}
					<div class="truncate text-xs text-base-content/60">{uploadDetailLine}</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<div class="flex flex-col gap-5">
	<div class="rounded-[28px] border border-base-300/70 bg-base-100/70 p-5 shadow-sm backdrop-blur-sm sm:p-6">
		{#if hasItems}
			<div class="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h1 class="text-2xl font-semibold text-base-content">Media Library</h1>
					<p class="mt-1 text-sm text-base-content/70">
						Select or upload media files. Maximum {uploadLimitLabel} per file.
					</p>
				</div>

				<div class="flex items-center gap-3">
					<input
						bind:this={fileInput}
						type="file"
						accept="image/*,video/*"
						multiple
						class="hidden"
						onchange={(event) => queueFilesForUpload((event.currentTarget as HTMLInputElement).files)}
					/>
					<Button class="gap-2" onclick={() => fileInput?.click()} disabled={uploadBusy}>
						{#if uploadBusy}
							<AbstractIcon name={icons.LoaderCircle.name} class="size-4 animate-spin" width="16" height="16" />
						{:else}
							<AbstractIcon name={icons.Plus.name} class="size-4" width="16" height="16" />
						{/if}
						Upload
					</Button>
				</div>
			</div>

			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class={`rounded-3xl border-2 border-dashed p-3 transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-base-300/70 bg-base-200/20'}`}
				ondragover={(event) => {
					event.preventDefault();
					dragOver = true;
				}}
				ondragleave={() => (dragOver = false)}
				ondrop={(event) => {
					event.preventDefault();
					dragOver = false;
					queueFilesForUpload(event.dataTransfer?.files ?? null);
				}}
			>
				<!-- Dense grid (~6 columns on large viewports); reference uses calc(100% / 6) per tile -->
				<div
					class="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
				>
					{#each items as item (item.id)}
						<MultiMedia
							{item}
							onOpen={openPreview}
							onDelete={openDeleteConfirm}
							deleting={deletingPath === item.path}
						/>
					{/each}
				</div>
			</div>
		{:else}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class={`flex min-h-[520px] flex-col items-center justify-center rounded-[28px] border-2 border-dashed px-6 py-12 text-center transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-base-300/70 bg-base-200/20'}`}
				ondragover={(event) => {
					event.preventDefault();
					dragOver = true;
				}}
				ondragleave={() => (dragOver = false)}
				ondrop={(event) => {
					event.preventDefault();
					dragOver = false;
					queueFilesForUpload(event.dataTransfer?.files ?? null);
				}}
			>
				<div class="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-base-200 text-base-content/35">
					<AbstractIcon name={icons.Image.name} class="size-12" width="48" height="48" />
				</div>
				<h1 class="text-3xl font-semibold text-base-content">You don&apos;t have any media yet</h1>
				<p class="mt-4 max-w-xl whitespace-pre-line text-sm leading-6 text-base-content/65">
					Select or upload media files (maximum {uploadLimitLabel} per file).
					{'\n'}You can also drag and drop images or videos.
				</p>
				<input
					bind:this={fileInput}
					type="file"
					accept="image/*,video/*"
					multiple
					class="hidden"
					onchange={(event) => queueFilesForUpload((event.currentTarget as HTMLInputElement).files)}
				/>
				<Button class="mt-6 gap-2" onclick={() => fileInput?.click()} disabled={uploadBusy}>
					{#if uploadBusy}
						<AbstractIcon name={icons.LoaderCircle.name} class="size-4 animate-spin" width="16" height="16" />
					{:else}
						<AbstractIcon name={icons.Plus.name} class="size-4" width="16" height="16" />
					{/if}
					Upload
				</Button>
			</div>
		{/if}

		{#if loading}
			<div class="flex items-center justify-center py-10 text-base-content/65">
				<AbstractIcon name={icons.LoaderCircle.name} class="mr-2 size-4 animate-spin" width="16" height="16" />
				Loading media...
			</div>
		{/if}
	</div>

	{#if totalItems > 0 && totalPages > 1}
		<PaginationComposite
			itemsPerPage={itemsPerPage}
			totalItems={totalItems}
			currentPage={currentPage}
			totalPages={totalPages}
			setItemsPerPage={setItemsPerPageAndReload}
			setCurrentPage={setCurrentPage}
			paginateFrontFF={paginateFrontFF}
			paginateBackFF={paginateBackFF}
			nameOfItems="media files"
			pageSizeOptions={[12, 24, 48, 96]}
		/>
	{/if}
</div>

<Dialog.Root
	bind:open={deleteConfirmOpen}
	onOpenChange={(open) => {
		if (!open && !deletingPath) {
			deleteTarget = null;
		}
	}}
>
	<Dialog.Content class="max-w-md" showCloseButton={!deletingPath}>
		{#if deleteTarget}
			<Dialog.Header>
				<Dialog.Title>Are you sure?</Dialog.Title>
				<Dialog.Description class="text-base-content/80">
					{deleteConfirmationCopy(deleteTarget)}
					<span class="mt-2 block truncate text-sm font-medium text-base-content" title={deleteTarget.name}>
						{deleteTarget.name}
					</span>
				</Dialog.Description>
			</Dialog.Header>
			<Dialog.Footer class="gap-2 sm:justify-end">
				<Button type="button" variant="ghost" onclick={closeDeleteConfirm} disabled={Boolean(deletingPath)}>
					No, cancel!
				</Button>
				<Button
					type="button"
					variant="ghost"
					class="border-0 bg-primary text-primary-content hover:bg-primary/90"
					disabled={Boolean(deletingPath)}
					onclick={() => void confirmDelete()}
				>
					{#if deletingPath}
						<AbstractIcon name={icons.LoaderCircle.name} class="size-4 animate-spin" width="16" height="16" />
					{:else}
						Yes, delete it!
					{/if}
				</Button>
			</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={previewOpen}>
	<Dialog.Content class="w-[min(96vw,72rem)] max-w-[min(96vw,72rem)] p-0">
		{#if previewItem}
			<div class="border-b border-base-300 px-6 py-4">
				<Dialog.Title class="truncate text-lg font-semibold">{previewItem.name}</Dialog.Title>
				<div class="mt-1 text-sm text-base-content/65">
					{previewItem.kind} · {formatBytes(previewItem.size)}
				</div>
			</div>

			<div class="flex max-h-[80vh] min-h-[320px] items-center justify-center bg-base-200/30 p-6">
				{#if previewItem.kind === 'image' && previewUrl}
					<img src={previewUrl} alt={previewItem.name} class="max-h-[70vh] max-w-full rounded-xl object-contain shadow-lg" />
				{:else if previewItem.kind === 'video' && previewUrl}
					<!-- svelte-ignore a11y_media_has_caption -->
					<video src={previewUrl} controls class="max-h-[70vh] max-w-full rounded-xl shadow-lg"></video>
				{:else}
					<div class="flex flex-col items-center gap-4 text-base-content/65">
						<AbstractIcon name={icons.FileText.name} class="size-12" width="48" height="48" />
						<div>No preview available for this file type.</div>
					</div>
				{/if}
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
