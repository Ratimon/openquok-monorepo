<script lang="ts">
	import type { MediaLibraryItemProgrammerModel, MediaListProgrammerModel } from '$lib/media';
	import type { SocialPostMediaItem } from '$lib/posts/composerMedia.types';

	import { onDestroy, onMount } from 'svelte';

	import { formatBytes, MAX_MEDIA_UPLOAD_BYTES, mediaRepository } from '$lib/media';
	import { createAccountMediaUppy } from '$lib/media/utils/accountMediaUppy';
	import { authenticationRepository } from '$lib/user-auth';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { toast } from '$lib/ui/sonner';

	import MediaBox from '$lib/ui/components/media/MediaBox.svelte';
	import MediaLibraryToolbar from '$lib/ui/components/media/MediaLibraryToolbar.svelte';
	import MediaLibraryUploadOverlay from '$lib/ui/components/media/MediaLibraryUploadOverlay.svelte';
	import MediaSettings from '$lib/ui/components/media/MediaSettings.svelte';
	import PictureGeneration from '$lib/ui/components/posts/PictureGeneration.svelte';
	import PaginationComposite from '$lib/ui/pagination/pagination-composite.svelte';

	const DEFAULT_PAGE_SIZE = 24;
	const ACCEPTED_MEDIA_TYPES = ['image/', 'video/'];

	let items = $state<MediaLibraryItemProgrammerModel[]>([]);
	let loading = $state(true);
	type UploadPhase = 'idle' | 'encoding' | 'uploading';
	let uploadPhase = $state<UploadPhase>('idle');
	let barPercent = $state(0);
	let uploadDetailLine = $state('');
	let dragOver = $state(false);
	let currentPage = $state(1);
	let totalPages = $state(1);
	let totalItems = $state(0);
	let itemsPerPage = $state(DEFAULT_PAGE_SIZE);

	let designOpen = $state(false);
	let settingsOpen = $state(false);
	let settingsItem = $state<MediaLibraryItemProgrammerModel | null>(null);

	const uploadLimitLabel = `${Math.round(MAX_MEDIA_UPLOAD_BYTES / (1024 * 1024))} MB`;
	const uploadBusy = $derived(uploadPhase !== 'idle');
	const organizationId = $derived(workspaceSettingsPresenter.currentWorkspaceId ?? '');
	let lastLoadedOrganizationId = $state<string>('');

	let uppy = $state.raw<ReturnType<typeof createAccountMediaUppy> | null>(null);

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

	$effect(() => {
		if (!organizationId) return;
		if (organizationId === lastLoadedOrganizationId) return;
		lastLoadedOrganizationId = organizationId;
		currentPage = 1;
		void loadMedia(1);
	});

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

	function onDesignAdded(_items: SocialPostMediaItem[]): void {
		if (!_items.length) return;
		currentPage = 1;
		void loadMedia(1);
	}

	function openMediaSettings(entry: MediaLibraryItemProgrammerModel): void {
		settingsItem = entry;
		settingsOpen = true;
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
		if (!uppy || !organizationId) return;
		uppy.setMeta({ organizationId });
	});
</script>

<MediaLibraryUploadOverlay {uploadBusy} {uploadPhase} {barPercent} {uploadDetailLine} />

<div class="flex flex-col gap-5">
	<div class="rounded-[28px] border border-base-300/70 bg-base-100/70 p-5 shadow-sm backdrop-blur-sm sm:p-6">
		<div class="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
			<div>
				<h1 class="text-2xl font-semibold text-base-content">Media Library</h1>
				<p class="mt-1 text-sm text-base-content/70">
					Select or upload media files. Maximum {uploadLimitLabel} per file.
				</p>
			</div>
			<MediaLibraryToolbar
				{organizationId}
				{uploadBusy}
				onFilesSelected={queueFilesForUpload}
				onDesignClick={() => (designOpen = true)}
				onImported={() => void loadMedia(currentPage)}
			/>
		</div>

		<p class="text-base-content/75 mb-4 max-w-2xl text-sm">
			Drag files here or use <span class="font-medium text-base-content">Upload</span> above (maximum {uploadLimitLabel} per file).
		</p>

		<!-- Library grid: MultiMedia in "item" mode (see MediaBox.svelte). Composer posts use MultiMedia with `items`. -->
		<MediaBox
			{items}
			{loading}
			{organizationId}
			{uploadLimitLabel}
			{uploadBusy}
			onQueueFiles={queueFilesForUpload}
			onSetDragOver={(v) => {
				dragOver = v;
			}}
			onOpenSettings={openMediaSettings}
			onReload={() => loadMedia(currentPage)}
			{dragOver}
		/>
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

<PictureGeneration
	bind:open={designOpen}
	disabled={uploadBusy || !organizationId}
	uploadUid={organizationId}
	onAdd={onDesignAdded}
/>

<MediaSettings
	bind:open={settingsOpen}
	item={settingsItem}
	organizationId={organizationId}
	onSaved={() => void loadMedia(currentPage)}
	onClose={() => (settingsItem = null)}
/>
