<script lang="ts">
	import type { PageData } from './$types';
	import type { ProtectedMediaPagePresenterMediaSettingsVmPublic } from '$lib/area-protected';
	import type { MediaLibraryItemViewModel } from '$lib/medias/GetMedia.presenter.svelte';
	import type { PostMediaProgrammerModel } from '$lib/posts';

	import { onDestroy, onMount } from 'svelte';

	import { mediaLibraryMediaModalPresenter, protectedMediaPagePresenter } from '$lib/area-protected';
	import { formatBytes, maxMediaUploadShortLabel } from '$lib/medias';
	import { createAccountMediaUppy } from '$lib/medias/utils/accountMediaUppy';
	import { authenticationRepository } from '$lib/user-auth';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { toast } from '$lib/ui/sonner';

	import MediaBox from '$lib/ui/components/media/MediaBox.svelte';
	import MediaLibraryToolbar from '$lib/ui/components/media/MediaLibraryToolbar.svelte';
	import MediaLibraryUploadOverlay from '$lib/ui/components/media/MediaLibraryUploadOverlay.svelte';
	import MediaSettings from '$lib/ui/components/media/MediaSettings.svelte';
	import MediaGenerationModal from '$lib/ui/components/media/MediaGenerationModal.svelte';
	import PaginationComposite from '$lib/ui/pagination/pagination-composite.svelte';

	interface MediaLibraryPageProps {
		data: PageData;
	}

	let { data }: MediaLibraryPageProps = $props();

	const ACCEPTED_MEDIA_TYPES = ['image/', 'video/'];

	type UploadPhase = 'idle' | 'encoding' | 'uploading';
	let uploadPhase = $state<UploadPhase>('idle');
	let barPercent = $state(0);
	let uploadDetailLine = $state('');
	let designOpen = $state(false);

	const p = protectedMediaPagePresenter as typeof protectedMediaPagePresenter &
		ProtectedMediaPagePresenterMediaSettingsVmPublic;

	const mediaItemsVm = $derived(p.mediaItemsVm);
	const loading = $derived(p.loading);
	const currentPage = $derived(p.pagination.currentPage);
	const totalPages = $derived(p.totalPages);
	const totalItems = $derived(p.totalItems);
	const itemsPerPage = $derived(p.pagination.itemsPerPage);
	const organizationId = $derived(p.organizationId);
	const uploadLimitLabel = maxMediaUploadShortLabel();
	const uploadBusy = $derived(uploadPhase !== 'idle');

	let dragOver = $state(false);
	let uppy = $state.raw<ReturnType<typeof createAccountMediaUppy> | null>(null);

	function isSupportedUpload(file: File): boolean {
		return ACCEPTED_MEDIA_TYPES.some((prefix) => file.type.startsWith(prefix));
	}

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

	function onDesignAdded(_items: PostMediaProgrammerModel[]): void {
		p.onDesignAdded();
	}

	onMount(() => {
		void p.loadMedia(1);

		const instance = createAccountMediaUppy({
			getAccessToken: () => authenticationRepository.getToken(),
			onUploadError: (err) => toast.error(err.message || 'Upload failed.'),
			getOrganizationId: () => workspaceSettingsPresenter.currentWorkspaceId ?? ''
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
				p.reloadFromFirstPage();
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
		p.syncWorkspaceList();
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
				onImported={() => void p.loadMedia(currentPage)}
			/>
		</div>

		<p class="text-base-content/75 mb-4 max-w-2xl text-sm">
			Drag files here or use <span class="font-medium text-base-content">Upload</span> above (maximum {uploadLimitLabel} per file).
		</p>

		<MediaBox
			{mediaItemsVm}
			{loading}
			{organizationId}
			{uploadLimitLabel}
			{uploadBusy}
			onQueueFiles={queueFilesForUpload}
			onSetDragOver={(v) => {
				dragOver = v;
			}}
			onOpenSettings={(mediaVm: MediaLibraryItemViewModel) => p.openMediaSettings(mediaVm)}
			onReload={() => p.loadMedia(currentPage)}
			deleteMedia={(mediaVm) => p.deleteLibraryItem(mediaVm)}
			{dragOver}
		/>
	</div>

	{#if totalItems > 0 && totalPages > 1}
		<PaginationComposite
			itemsPerPage={itemsPerPage}
			totalItems={totalItems}
			currentPage={currentPage}
			totalPages={totalPages}
			setItemsPerPage={p.setItemsPerPageAndReload.bind(p)}
			setCurrentPage={p.setCurrentPage.bind(p)}
			paginateFrontFF={p.paginateFrontFF.bind(p)}
			paginateBackFF={p.paginateBackFF.bind(p)}
			nameOfItems="media files"
			pageSizeOptions={[12, 24, 48, 96]}
		/>
	{/if}
</div>

<MediaGenerationModal
	stockPhotosVm={mediaLibraryMediaModalPresenter.stockPhotosVm}
	designTemplatesVm={mediaLibraryMediaModalPresenter.designTemplatesVm}
	fetchPolotnoTemplateListPage={mediaLibraryMediaModalPresenter.fetchPolotnoTemplateListPagePm.bind(
		mediaLibraryMediaModalPresenter
	)}
	backgroundPanelVm={mediaLibraryMediaModalPresenter.backgroundPanelVm}
	exportCanvasToMedia={mediaLibraryMediaModalPresenter.exportCanvasToMedia.bind(
		mediaLibraryMediaModalPresenter
	)}
	bind:open={designOpen}
	disabled={uploadBusy || !organizationId}
	uploadUid={organizationId}
	useMediaLabel="Save this for later"
	onAdd={onDesignAdded}
/>

<MediaSettings
	bind:open={p.settingsOpen}
	mediaVm={p.settingsMediaVm}
	organizationId={organizationId}
	uploadSimple={(args) => p.uploadMediaSimple(args)}
	saveInformation={(args) => p.saveMediaInformation(args)}
	onSaved={() => void p.loadMedia(currentPage)}
	onClose={() => p.clearSettingsMediaVm()}
/>
