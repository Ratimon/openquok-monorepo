<script lang="ts">
	import type { PageData } from './$types';
	import type { ProtectedMediaPagePresenterMediaSettingsVmPublic } from '$lib/area-protected';
	import type { MediaLibraryItemViewModel } from '$lib/medias/GetMedia.presenter.svelte';
	import type { PostMediaProgrammerModel } from '$lib/posts';

	import { onDestroy, onMount } from 'svelte';

	import { getMenuOptions, type IFileMenuOption } from '@svar-ui/svelte-filemanager';

	import { getRootPathAccount, mediaLibraryMediaModalPresenter, protectedMediaPagePresenter } from '$lib/area-protected';
	import { formatBytes, mediaUploadLimitsHint, normalizeMediaVirtualPath } from '$lib/medias';
	import { route, url } from '$lib/utils/path';
	import { createAccountMediaUppy } from '$lib/medias/utils/accountMediaUppy';
	import { validateFilesForMediaUpload } from '$lib/medias/utils/mediaUploadRestrictions';
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
	import StorageLimitUpgradeDialog from '$lib/ui/components/media/StorageLimitUpgradeDialog.svelte';
	import HomeAccountNoticeBanner from '$lib/ui/components/home/HomeAccountNoticeBanner.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import PaginationComposite from '$lib/ui/pagination/pagination-composite.svelte';

	interface MediaLibraryPageProps {
		data: PageData;
	}

	let { data }: MediaLibraryPageProps = $props();

	const accountBillingHref = $derived(url(`${route(getRootPathAccount())}/billing`));

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
	const uploadLimitLabel = mediaUploadLimitsHint();
	const uploadBusy = $derived(uploadPhase !== 'idle');
	const fileManagerMode = $derived(
		libraryLayout === 'gallery' ? 'cards' : libraryLayout
	);

	const storageQuotaBytes = $derived(drive.total >= 1 ? drive.total : null);
	const storageUsageLabel = $derived(
		storageQuotaBytes != null ? `${formatBytes(drive.used)} / ${formatBytes(storageQuotaBytes)}` : null
	);
	const showStorageLimitSection = $derived(storageQuotaBytes != null);
	const isStorageLimitFull = $derived(
		storageQuotaBytes != null && drive.used >= storageQuotaBytes
	);
	const showStorageUpgradeCta = $derived(isStorageLimitFull && Boolean(accountBillingHref));

	let storageUpgradeDialogOpen = $state(false);

	function openStorageUpgradeDialog() {
		storageUpgradeDialogOpen = true;
	}

	function tryMediaUpload(run: () => void) {
		if (isStorageLimitFull) {
			openStorageUpgradeDialog();
			return;
		}
		run();
	}

	let uppy = $state.raw<ReturnType<typeof createAccountMediaUppy> | null>(null);

	function isSupportedUpload(file: File): boolean {
		return ACCEPTED_MEDIA_TYPES.some((prefix) => file.type.startsWith(prefix));
	}

	function uploadSuccessToastMessage(fileCount: number, virtualPath: string | null | undefined): string {
		const destination = normalizeMediaVirtualPath(virtualPath);
		if (fileCount === 1) {
			return `Media uploaded to ${destination}.`;
		}
		return `${fileCount} files uploaded to ${destination}.`;
	}

	function queueFilesForUpload(fileList: FileList | null): void {
		tryMediaUpload(() => queueFilesForUploadInner(fileList));
	}

	function queueFilesForUploadInner(fileList: FileList | null): void {
		if (!fileList?.length || !uppy || uploadBusy) return;
		if (!organizationId) {
			toast.error('Select a workspace first.');
			return;
		}

		const supported = Array.from(fileList).filter(isSupportedUpload);
		if (!supported.length) {
			toast.error('Upload images or videos only.');
			return;
		}

		const files = validateFilesForMediaUpload(supported, (message) => toast.error(message));
		if (!files.length) {
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
		tryMediaUpload(() => p.onDesignAdded());
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
				const addedBytes = successful.reduce(
					(sum, file) => sum + (typeof file.size === 'number' ? file.size : 0),
					0
				);
				if (addedBytes > 0) {
					p.adjustDriveUsedBytes(addedBytes);
				}
				p.reloadFromFirstPage();
				const destinationPath =
					(successful[0]?.meta as { virtualPath?: string } | undefined)?.virtualPath ??
					(instance.getState().meta as { virtualPath?: string } | undefined)?.virtualPath ??
					p.uploadVirtualPath;
				toast.success(uploadSuccessToastMessage(ok, destinationPath));
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
					storageLimitFull={isStorageLimitFull}
					onStorageLimitBlocked={openStorageUpgradeDialog}
					onFilesSelected={queueFilesForUpload}
					onDesignClick={() => (designOpen = true)}
					onImported={() => p.reloadFromFirstPage()}
				/>
			</div>
		</div>

		{#if showStorageLimitSection && storageUsageLabel && organizationId}
			<div class="mb-5">
			<HomeAccountNoticeBanner
				iconName={isStorageLimitFull ? icons.Sparkles.name : icons.Info.name}
				tone={isStorageLimitFull ? 'upgrade' : 'neutral'}
				dismissible={false}
			>
				<p class="text-base-content/90">
					{#if isStorageLimitFull}
						This workspace has reached its media storage limit
						<span class="font-medium tabular-nums">({storageUsageLabel})</span>. Upgrade for more
						space, or delete files to free storage.
					{:else}
						Workspace media storage:
						<span class="font-medium tabular-nums">{storageUsageLabel}</span>
						used (per workspace on your plan).
					{/if}
				</p>
				{#snippet actions()}
					{#if showStorageUpgradeCta}
						<Button href={accountBillingHref} variant="secondary" size="sm" class="gap-1.5">
							<AbstractIcon name={icons.ArrowUp.name} class="size-4" width="16" height="16" />
							Upgrade plan
						</Button>
					{/if}
				{/snippet}
			</HomeAccountNoticeBanner>
			</div>
		{/if}

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
	disabled={uploadBusy || !organizationId || isStorageLimitFull}
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

<StorageLimitUpgradeDialog bind:open={storageUpgradeDialogOpen} upgradeHref={accountBillingHref} />
