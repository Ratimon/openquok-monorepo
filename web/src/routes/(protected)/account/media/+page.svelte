<script lang="ts">
	import type { PageData } from './$types';
	import type { ProtectedMediaPagePresenterMediaSettingsVmPublic } from '$lib/area-protected';
	import type { MediaLibraryItemViewModel } from '$lib/medias/GetMedia.presenter.svelte';
	import type { PostMediaProgrammerModel } from '$lib/posts';

	import { onDestroy, onMount } from 'svelte';

	import { getMenuOptions, type IFileMenuOption } from '@svar-ui/svelte-filemanager';

	import { mediaLibraryMediaModalPresenter, protectedMediaPagePresenter } from '$lib/area-protected';
	import { formatBytes, maxMediaUploadShortLabel } from '$lib/medias';
	import { createAccountMediaUppy } from '$lib/medias/utils/accountMediaUppy';
	import { authenticationRepository } from '$lib/user-auth';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { toast } from '$lib/ui/sonner';

	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import MediaFileManager from '$lib/ui/components/media/MediaFileManager.svelte';
	import MediaGallery from '$lib/ui/components/media/MediaGallery.svelte';
	import MediaFileManagerViewControls, {
		type MediaLibraryLayout
	} from '$lib/ui/components/media/MediaFileManagerViewControls.svelte';
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
	let libraryLayout = $state<MediaLibraryLayout>('cards');
	let dragOver = $state(false);

	const p = protectedMediaPagePresenter as typeof protectedMediaPagePresenter &
		ProtectedMediaPagePresenterMediaSettingsVmPublic;

	const fileManagerData = $derived(p.fileManagerData);
	const drive = $derived(p.drive);
	const loading = $derived(p.loading);
	const mediaItemsVm = $derived(p.mediaItemsVm);
	const currentPage = $derived(p.pagination.currentPage);
	const totalPages = $derived(p.totalPages);
	const totalItems = $derived(p.totalItems);
	const itemsPerPage = $derived(p.pagination.itemsPerPage);
	const organizationId = $derived(p.organizationId);
	const workspaceName = $derived(p.currentWorkspaceName);
	const uploadVirtualPath = $derived(p.uploadVirtualPath);
	const fileManagerApi = $derived(p.fileManagerApi);
	const uploadLimitLabel = maxMediaUploadShortLabel();
	const uploadBusy = $derived(uploadPhase !== 'idle');
	const fileManagerMode = $derived(
		libraryLayout === 'gallery' ? 'cards' : libraryLayout
	);

	let uppy = $state.raw<ReturnType<typeof createAccountMediaUppy> | null>(null);
	let sidebarFileInput = $state.raw<HTMLInputElement | null>(null);

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

	function buildMenuOptions(
		mode: Parameters<typeof p.buildMenuOptions>[1],
		item?: Parameters<typeof p.buildMenuOptions>[2]
	): IFileMenuOption[] {
		const defaults = getMenuOptions(mode).map((opt) => ({
			...opt,
			hotkey: opt.hotkey ?? ''
		})) as IFileMenuOption[];
		return p.buildMenuOptions(defaults, mode, item);
	}

	async function onDeleteFiles(ids: string[]) {
		const result = await p.handleDeleteFiles(ids);
		if (result.errors.length) {
			toast.error(result.errors[0]);
		}
		const total = result.filesDeleted + result.foldersDeleted;
		if (total === 0) {
			if (!result.errors.length) toast.error('Nothing was deleted.');
			return;
		}
		if (result.foldersDeleted && !result.filesDeleted) {
			toast.success(result.foldersDeleted === 1 ? 'Folder deleted.' : `${result.foldersDeleted} folders deleted.`);
		} else if (result.filesDeleted && !result.foldersDeleted) {
			toast.success(result.filesDeleted === 1 ? 'File deleted.' : `${result.filesDeleted} files deleted.`);
		} else {
			toast.success(`${total} items deleted.`);
		}
	}

	async function onCopyFiles(ids: string[], target: string): Promise<boolean> {
		const ok = await p.handleCopyFiles(ids, target);
		if (!ok) toast.error('Could not copy files.');
		else toast.success(ids.length === 1 ? 'File copied.' : `${ids.length} files copied.`);
		return ok;
	}

	async function onMoveFiles(ids: string[], target: string): Promise<boolean> {
		const ok = await p.handleMoveFiles(ids, target);
		if (!ok) toast.error('Could not move files.');
		return ok;
	}

	async function onRenameFile(id: string, name: string): Promise<boolean> {
		const ok = await p.handleRenameFile(id, name);
		if (!ok) toast.error('Could not rename file.');
		return ok;
	}

	function onOpenFile(id: string) {
		if (p.openSettingsForFileManagerId(id)) return;
	}

	function openSidebarFilePicker(): void {
		if (uploadBusy || !organizationId) return;
		sidebarFileInput?.click();
	}

	function onSidebarFileInputChange(e: Event): void {
		const input = e.currentTarget as HTMLInputElement;
		queueFilesForUpload(input.files);
		input.value = '';
	}

	async function onCreateFile(ev: {
		file?: { type?: string; name?: string; file?: File | Blob };
		parent?: string;
	}) {
		const file = ev?.file;
		if (!file) return;

		const blob = file.file;
		if (blob instanceof Blob) {
			const uploadFile =
				blob instanceof File
					? blob
					: new File([blob], file.name ?? 'upload', {
							type: blob.type || 'application/octet-stream'
						});
			const list = new DataTransfer();
			list.items.add(uploadFile);
			queueFilesForUpload(list.files);
			return;
		}

		if (file.type === 'folder') {
			const parent = ev.parent ?? uploadVirtualPath ?? fileManagerApi?.getState().panels?.[0]?.path;
			const ok = await p.createVirtualFolder(String(file.name ?? ''), String(parent ?? '/'));
			if (ok) toast.success('Folder created.');
			else toast.error('Could not create folder.');
			return;
		}

		if (file.type === 'file') {
			openSidebarFilePicker();
		}
	}

	onMount(() => {
		const instance = createAccountMediaUppy({
			getAccessToken: () => authenticationRepository.getToken(),
			onUploadError: (err) => toast.error(err.message || 'Upload failed.'),
			getOrganizationId: () => workspaceSettingsPresenter.currentWorkspaceId ?? '',
			getVirtualPath: () => protectedMediaPagePresenter.uploadVirtualPath
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
		uppy.setMeta({ organizationId, virtualPath: uploadVirtualPath });
	});

	$effect(() => {
		if (libraryLayout !== 'gallery' || !organizationId) return;
		void p.loadMedia(currentPage);
	});
</script>

<MediaLibraryUploadOverlay {uploadBusy} {uploadPhase} {barPercent} {uploadDetailLine} />

<div class="flex flex-col gap-5">
	<div class="rounded-[28px] border border-base-300/70 bg-base-100/70 p-5 shadow-sm backdrop-blur-sm sm:p-6">
		<div class="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
			<div>
				<div class="flex items-center gap-3">
					<AbstractIcon
						name={icons.Image.name}
						class="text-primary size-8 shrink-0"
						width="32"
						height="32"
					/>
					<div>
						<h1 class="text-2xl font-semibold text-base-content">Media Library</h1>
						<p class="text-sm text-base-content/65">{workspaceName}</p>
					</div>
				</div>
				<p class="mt-2 text-sm text-base-content/70">
					Browse folders, upload, and manage workspace media. Maximum {uploadLimitLabel} per file.
					{#if uploadVirtualPath && libraryLayout !== 'gallery'}
						<span class="text-base-content/55 block pt-1 text-xs">
							Uploads and designs save to
							<span class="font-medium text-base-content/80">{uploadVirtualPath}</span>
							(the folder you have open). You can move them to another folder later.
						</span>
					{/if}
				</p>
			</div>
			<div class="flex flex-wrap items-center justify-end gap-3">
				{#if organizationId}
					<MediaFileManagerViewControls
						layout={libraryLayout}
						onLayoutChange={(layout) => (libraryLayout = layout)}
						api={fileManagerApi}
					/>
				{/if}
				<MediaLibraryToolbar
					{organizationId}
					{uploadBusy}
					onFilesSelected={queueFilesForUpload}
					onDesignClick={() => (designOpen = true)}
					onImported={() => p.reloadFromFirstPage()}
				/>
			</div>
		</div>

		{#if !organizationId}
			<p class="text-base-content/70 rounded-xl border border-dashed border-base-300/80 bg-base-200/30 px-4 py-8 text-center text-sm">
				Select a workspace to manage media.
			</p>
		{:else if libraryLayout === 'gallery'}
			<MediaGallery
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
				onReload={() => void p.reloadFromFirstPage()}
				deleteMedia={(mediaVm) => p.deleteLibraryItem(mediaVm)}
				{dragOver}
			/>
			{#if totalPages > 1}
				<PaginationComposite
					class="mt-5"
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
		{:else}
			<input
				bind:this={sidebarFileInput}
				type="file"
				accept={ACCEPTED_MEDIA_TYPES.map((t) => `${t}*`).join(',')}
				multiple
				class="sr-only"
				aria-hidden="true"
				tabindex={-1}
				onchange={onSidebarFileInputChange}
			/>
			<MediaFileManager
				data={fileManagerData}
				{drive}
				mode={fileManagerMode}
				{loading}
				readonly={uploadBusy}
				menuOptions={buildMenuOptions}
				onInit={(api) => p.registerFileManagerApi(api)}
				onPathChange={() => p.onFileManagerPathChanged()}
				onDeleteFiles={onDeleteFiles}
				onCopyFiles={onCopyFiles}
				onMoveFiles={onMoveFiles}
				onRenameFile={onRenameFile}
				onOpenFile={onOpenFile}
				onCreateFile={onCreateFile}
			/>
		{/if}
	</div>
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
	onSaved={() => p.reloadFromFirstPage()}
	onClose={() => p.clearSettingsMediaVm()}
/>
