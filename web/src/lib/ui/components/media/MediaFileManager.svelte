<script lang="ts">
	import type { IApi, IEntity, IFileMenuOption, IParsedEntity, TContextMenuType } from '@svar-ui/svelte-filemanager';
	import type { MediaFileManagerDriveVm } from '$lib/area-protected/ProtectedMediaPage.presenter.svelte';
	import type { MediaLibraryLayout } from '$lib/ui/components/media/MediaFileManagerViewControls.svelte';

	import { mount, onDestroy, tick, unmount } from 'svelte';

	import { mediaFileManagerDisplayNameFromId } from 'openquok-common';

	import { Filemanager, Willow } from '@svar-ui/svelte-filemanager';

	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	interface MediaFileManagerProps {
		data: IEntity[];
		drive: MediaFileManagerDriveVm;
		mode?: Exclude<MediaLibraryLayout, 'gallery'>;
		loading?: boolean;
		readonly?: boolean;
		onInit?: (api: IApi) => void;
		menuOptions?: (mode: TContextMenuType, item?: IParsedEntity) => IFileMenuOption[];
		onPathChange?: () => void;
		onDeleteFiles?: (ids: string[]) => void | Promise<void>;
		onCopyFiles?: (ids: string[], target: string) => void | Promise<boolean>;
		onMoveFiles?: (ids: string[], target: string) => void | Promise<boolean>;
		onRenameFile?: (id: string, name: string) => void | Promise<boolean>;
		onOpenFile?: (id: string) => void;
	}

	let {
		data = [],
		drive,
		mode = 'cards',
		loading = false,
		readonly = false,
		onInit,
		menuOptions,
		onPathChange,
		onDeleteFiles,
		onCopyFiles,
		onMoveFiles,
		onRenameFile,
		onOpenFile
	}: MediaFileManagerProps = $props();

	let fmApi = $state<IApi | null>(null);
	let hostEl = $state<HTMLDivElement | null>(null);

	const EMPTY_PREVIEW_SLOT = 'data-media-empty-preview';
	const CARD_FOLDER_SLOT = 'data-media-card-folder-icon';
	let emptyPreviewCleanup: (() => void) | null = null;
	const cardFolderCleanups = new Map<Element, () => void>();

	function teardownEmptyPreview(): void {
		emptyPreviewCleanup?.();
		emptyPreviewCleanup = null;
	}

	function teardownCardFolderIcons(): void {
		for (const cleanup of cardFolderCleanups.values()) cleanup();
		cardFolderCleanups.clear();
	}

	function teardownDecorations(): void {
		teardownEmptyPreview();
		teardownCardFolderIcons();
	}

	function mountFolderIcon(
		target: HTMLElement,
		className: string,
		size: string
	): () => void {
		const slot = document.createElement('div');
		slot.setAttribute(CARD_FOLDER_SLOT, '');
		slot.className = className;
		target.appendChild(slot);

		const mounted = mount(AbstractIcon, {
			target: slot,
			props: {
				name: icons.FolderInput.name,
				class: 'shrink-0',
				width: size,
				height: size
			}
		});

		return () => {
			unmount(mounted);
			slot.remove();
		};
	}

	async function syncEmptyPreview(): Promise<void> {
		await tick();
		if (!hostEl) return;

		const wrapper = hostEl.querySelector('.wx-no-info-wrapper');
		if (!wrapper) {
			teardownEmptyPreview();
			return;
		}

		if (wrapper.querySelector(`[${EMPTY_PREVIEW_SLOT}]`)) return;

		const slot = document.createElement('div');
		slot.setAttribute(EMPTY_PREVIEW_SLOT, '');
		slot.className =
			'pointer-events-none flex min-h-[120px] items-center justify-center text-base-content/35';
		wrapper.insertBefore(slot, wrapper.firstChild);

		const mounted = mount(AbstractIcon, {
			target: slot,
			props: {
				name: icons.MousePointerClickIcon.name,
				class: 'size-[120px]',
				width: '120',
				height: '120'
			}
		});

		emptyPreviewCleanup = () => {
			unmount(mounted);
			slot.remove();
		};
	}

	function scheduleEmptyPreviewSync(): void {
		void syncEmptyPreview();
	}

	async function syncFolderIcons(): Promise<void> {
		await tick();
		if (!hostEl) {
			teardownCardFolderIcons();
			return;
		}

		const activeTargets = new Set<Element>();
		const folderIconTargets: Array<{ selector: string; className: string; size: string }> = [
			{
				selector: '.wx-info .wx-preview .wx-icon-wrapper:has(i.wxi-folder)',
				className:
					'pointer-events-none flex min-h-[120px] flex-1 items-center justify-center text-primary/35',
				size: '96'
			}
		];

		if (fmApi?.getState().mode === 'cards') {
			folderIconTargets.unshift({
				selector: '.wx-cards .wx-item:has(.wx-folder-name) .wx-preview',
				className:
					'pointer-events-none flex flex-1 items-center justify-center text-primary/35',
				size: '72'
			});
		}

		for (const { selector, className, size } of folderIconTargets) {
			for (const target of hostEl.querySelectorAll(selector)) {
				activeTargets.add(target);
				if (target.querySelector(`[${CARD_FOLDER_SLOT}]`)) continue;

				cardFolderCleanups.set(
					target,
					mountFolderIcon(target as HTMLElement, className, size)
				);
			}
		}

		for (const [target, cleanup] of cardFolderCleanups) {
			if (!activeTargets.has(target)) {
				cleanup();
				cardFolderCleanups.delete(target);
			}
		}
	}

	function scheduleDecorationSync(): void {
		scheduleEmptyPreviewSync();
		void syncFolderIcons();
	}

	function displayNameForEntity(row: IEntity): string {
		if (typeof row.displayName === 'string' && row.displayName.trim()) {
			return row.displayName.trim();
		}
		return mediaFileManagerDisplayNameFromId(String(row.id ?? ''));
	}

	function applyTreeDisplayNames(api: IApi, rows: IEntity[]): void {
		const tree = api.getState().data;
		let changed = false;

		for (const row of rows) {
			if (row.type !== 'file') continue;
			const displayName = displayNameForEntity(row);
			if (!displayName) continue;

			const node = tree.byId(row.id);
			if (node && node.name !== displayName) {
				tree.update(row.id, { name: displayName });
				changed = true;
			}
		}

		if (changed) {
			api.getStores().data.setState({ data: tree });
		}
	}

	function wireApi(api: IApi) {
		fmApi = api;
		api.intercept('create-file', (ev: { file?: { type?: string } }) => {
			if (ev?.file?.type === 'folder') return false;
		});

		api.on('set-path', () => {
			onPathChange?.();
			scheduleDecorationSync();
		});

		api.on('delete-files', async (ev: { ids?: string[] }) => {
			const ids = ev?.ids ?? [];
			if (ids.length) await onDeleteFiles?.(ids);
		});

		// Block SVAR's client-side copy/move: ids use `{folder}/{mediaId}__{name}`, not `parent/name.ext`.
		api.intercept('copy-files', async (ev: { ids?: string[]; target?: string }) => {
			const ids = ev?.ids ?? [];
			const target = ev?.target ?? '';
			if (ids.length && target) {
				await onCopyFiles?.(ids, target);
			}
			return false;
		});

		api.intercept('move-files', async (ev: { ids?: string[]; target?: string }) => {
			const ids = ev?.ids ?? [];
			const target = ev?.target ?? '';
			if (ids.length && target) {
				await onMoveFiles?.(ids, target);
			}
			return false;
		});

		// Block SVAR's built-in rename: it rewrites ids as `parent/name.ext`, which does not match
		// our `…/{mediaId}__{displayName}` ids and leaves stale selection after we reload the tree.
		api.intercept('rename-file', async (ev: { id?: string; name?: string }) => {
			const id = ev?.id ?? '';
			const name = ev?.name ?? '';
			if (!id || !name) return false;
			await onRenameFile?.(id, name);
			return false;
		});

		api.on('open-file', (ev: { id?: string }) => {
			const id = ev?.id ?? '';
			if (id) onOpenFile?.(id);
		});

		api.on('download-file', (ev: { id?: string }) => {
			const file = api.getFile(ev?.id ?? '');
			const url = (file as { publicUrl?: string } | null)?.publicUrl;
			if (url && typeof document !== 'undefined') {
				const a = document.createElement('a');
				a.href = url;
				a.target = '_blank';
				a.rel = 'noopener noreferrer';
				a.download = '';
				document.body.appendChild(a);
				a.click();
				a.remove();
			}
		});

		api.on('select-file', scheduleDecorationSync);
		api.on('show-preview', scheduleDecorationSync);
		api.on('set-mode', scheduleDecorationSync);

		onInit?.(api);
		applyTreeDisplayNames(api, data);
		scheduleDecorationSync();
	}

	$effect(() => {
		const api = fmApi;
		const rows = data;
		if (!api || !rows.length) return;
		applyTreeDisplayNames(api, rows);
	});

	$effect(() => {
		fmApi;
		data;
		mode;
		scheduleDecorationSync();
	});

	onDestroy(() => {
		teardownDecorations();
	});

	function previewUrl(file: IParsedEntity & { publicUrl?: string; kind?: string }, _w: number, _h: number) {
		if (file.type !== 'file') return null;
		const url = file.publicUrl;
		if (!url) return null;
		if (file.kind === 'image' || file.kind === 'video') return url;
		return null;
	}
</script>

<div
	bind:this={hostEl}
	class="media-file-manager-host relative min-h-[min(72vh,720px)] overflow-hidden"
	aria-busy={loading}
>
	{#if loading}
		<div
			class="bg-base-100/60 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[1px]"
			role="status"
		>
			<span class="loading loading-spinner loading-lg text-primary"></span>
		</div>
	{/if}

	<Willow fonts={false}>
		<Filemanager
			{data}
			{drive}
			{mode}
			preview={true}
			{readonly}
			{menuOptions}
			previews={previewUrl}
			init={wireApi}
		/>
	</Willow>
</div>

<style>
	/*
	  SVAR Willow ships fixed light greys/blues. This app themes via `html[data-theme]` (DaisyUI),
	  so bridge File Manager tokens to semantic colors (same approach as dashboard SVAR grids).
	*/
	.media-file-manager-host :global(.wx-willow-theme) {
		--wx-font-family: inherit;
		color: var(--color-base-content);

		--wx-color-primary: var(--color-primary);
		--wx-color-primary-selected: color-mix(in oklab, var(--color-primary) 24%, var(--color-base-100));
		--wx-color-primary-font: var(--color-primary-content);
		--wx-color-secondary-font: var(--color-primary);
		--wx-color-secondary-border: var(--color-primary);
		--wx-color-secondary-border-disabled: color-mix(in oklab, var(--color-base-content) 28%, transparent);
		--wx-color-secondary-hover: color-mix(in oklab, var(--color-primary) 12%, transparent);

		--wx-color-font: var(--color-base-content);
		--wx-color-font-alt: color-mix(in oklab, var(--color-base-content) 58%, transparent);
		--wx-color-font-disabled: color-mix(in oklab, var(--color-base-content) 36%, transparent);
		--wx-color-link: var(--color-primary);

		--wx-background: var(--color-base-100);
		--wx-background-alt: var(--color-base-200);
		--wx-background-hover: color-mix(in oklab, var(--color-base-content) 8%, var(--color-base-200));
		--wx-color-disabled: var(--color-base-200);
		--wx-color-disabled-alt: color-mix(in oklab, var(--color-base-content) 10%, var(--color-base-200));

		--wx-icon-color: color-mix(in oklab, var(--color-base-content) 52%, transparent);
		--wx-border: 1px solid color-mix(in oklab, var(--color-base-content) 14%, transparent);
		--wx-border-medium: 1px solid color-mix(in oklab, var(--color-base-content) 12%, var(--color-base-300));
		--wx-border-radius: 0.5rem;
		--wx-radius-major: 0.75rem;
		--wx-box-shadow: none;
		--wx-shadow-light: none;
		--wx-shadow-medium: none;

		--wx-input-font-color: var(--color-base-content);
		--wx-input-background: var(--color-base-100);
		--wx-input-border: 1px solid color-mix(in oklab, var(--color-base-content) 16%, transparent);
		--wx-input-border-focus: 1px solid var(--color-primary);
		--wx-input-placeholder-color: color-mix(in oklab, var(--color-base-content) 48%, transparent);

		--wx-button-font-color: var(--color-base-content);
		--wx-button-background: var(--color-base-200);
		--wx-button-pressed: color-mix(in oklab, var(--color-base-content) 14%, var(--color-base-300));
		--wx-button-primary-pressed: color-mix(in oklab, var(--color-primary) 82%, black);
		--wx-button-box-shadow: none;
		--wx-button-primary-box-shadow: none;

		--wx-segmented-background: var(--color-base-200);
		--wx-segmented-background-hover: color-mix(in oklab, var(--color-base-content) 8%, var(--color-base-200));

		--wx-fm-background: transparent;
		--wx-fm-box-shadow: none;
		--wx-fm-select-background: color-mix(in oklab, var(--color-primary) 20%, var(--color-base-100));
		--wx-fm-grid-border: var(--wx-border);
		--wx-fm-grid-header-color: color-mix(in oklab, var(--color-base-content) 6%, var(--color-base-100));
		--wx-fm-button-font-color: color-mix(in oklab, var(--color-base-content) 55%, transparent);
		--wx-fm-progress-bar-color: color-mix(in oklab, var(--color-base-content) 12%, var(--color-base-200));
		--wx-fm-toolbar-height: 3.25rem;

		/* Modals (delete confirm, rename prompt): match DaisyUI semantic colors */
		--wx-modal-header-font-color: var(--color-base-content);
		--wx-modal-background: var(--color-base-100);
		--wx-modal-border: 1px solid color-mix(in oklab, var(--color-base-content) 14%, transparent);
		--wx-modal-backdrop: color-mix(in oklab, var(--color-base-content) 40%, transparent);
		--wx-color-danger: rgb(239 68 68);
	}

	.media-file-manager-host :global(.wx-filemanager) {
		min-height: min(72vh, 720px);
		background: transparent;
	}

	.media-file-manager-host :global(.wx-toolbar .wx-right) {
		visibility: hidden;
		pointer-events: none;
	}

	.media-file-manager-host :global(.wx-sidebar .wx-wrapper),
	.media-file-manager-host :global(.wx-toolbar),
	.media-file-manager-host :global(.wx-breadcrumbs),
	.media-file-manager-host :global(.wx-content-wrapper),
	.media-file-manager-host :global(.wx-info .wx-preview),
	.media-file-manager-host :global(.wx-info .wx-info-panel),
	.media-file-manager-host :global(.wx-info .wx-no-info-panel) {
		border: 1px solid color-mix(in oklab, var(--color-base-content) 12%, transparent);
		box-shadow: none;
	}

	.media-file-manager-host :global(.wx-sidebar .wx-wrapper),
	.media-file-manager-host :global(.wx-content-wrapper),
	.media-file-manager-host :global(.wx-info .wx-preview),
	.media-file-manager-host :global(.wx-info .wx-info-panel),
	.media-file-manager-host :global(.wx-info .wx-no-info-panel) {
		border-radius: var(--wx-radius-major);
		background-color: var(--color-base-100);
	}

	.media-file-manager-host :global(.wx-toolbar),
	.media-file-manager-host :global(.wx-breadcrumbs) {
		border-radius: var(--wx-radius-major) var(--wx-radius-major) 0 0;
	}

	.media-file-manager-host :global(.wx-toolbar .wx-name),
	.media-file-manager-host :global(.wx-breadcrumbs .wx-item),
	.media-file-manager-host :global(.wx-folder .wx-name),
	.media-file-manager-host :global(.wx-cards .wx-item .wx-name),
	.media-file-manager-host :global(.wx-info .wx-title),
	.media-file-manager-host :global(.wx-info .wx-list .wx-name),
	.media-file-manager-host :global(.wx-info .wx-list .wx-value),
	.media-file-manager-host :global(.wx-drive p) {
		color: var(--color-base-content);
	}

	.media-file-manager-host :global(.wx-cards .wx-item) {
		background-color: var(--color-base-100);
		border: 1px solid color-mix(in oklab, var(--color-base-content) 10%, transparent);
		box-shadow: none;
	}

	.media-file-manager-host :global(.wx-cards .wx-item.wx-selected) {
		outline: 2px solid var(--color-primary);
		outline-offset: 0;
	}

	.media-file-manager-host :global(.wx-cards .wx-item .wx-type) {
		color: color-mix(in oklab, var(--color-base-content) 55%, transparent);
	}

	.media-file-manager-host :global(.wx-cards .wx-item:has(.wx-folder-name) .wx-preview) {
		background: color-mix(in oklab, var(--color-primary) 6%, var(--color-base-200));
	}

	.media-file-manager-host :global(.wx-cards .wx-item.wx-selected:has(.wx-folder-name) .wx-preview) {
		background: color-mix(in oklab, var(--color-primary) 12%, var(--color-base-200));
	}

	.media-file-manager-host :global(.wx-cards .wx-item:has(.wx-folder-name) .wx-preview > i) {
		display: none;
	}

	.media-file-manager-host :global(.wx-not-found-text),
	.media-file-manager-host :global(.wx-no-info) {
		color: color-mix(in oklab, var(--color-base-content) 62%, transparent);
	}

	.media-file-manager-host :global(.wx-no-info .wx-icon-wrapper) {
		display: none;
	}

	.media-file-manager-host :global(.wx-back) {
		color: var(--color-primary);
	}

	.media-file-manager-host :global(.wx-content-wrapper) {
		margin-top: 0.5rem;
	}

	.media-file-manager-host :global(.wx-info) {
		display: flex;
		min-height: 0;
	}

	/* SVAR uses fixed 60/40 heights + extra padding/margins; switch to flex so metadata is not clipped. */
	.media-file-manager-host :global(.wx-info > .wx-wrapper) {
		display: flex;
		flex-direction: column;
		min-height: 0;
		height: 100%;
		padding-bottom: 0;
		overflow-y: auto;
	}

	.media-file-manager-host :global(.wx-info .wx-preview) {
		flex: 0 1 auto;
		height: auto;
		min-height: 9rem;
		max-height: min(48%, 16rem);
		margin-bottom: 0.625rem;
	}

	.media-file-manager-host :global(.wx-info .wx-preview:has(.wx-icon-wrapper i.wxi-folder)) {
		min-height: 8rem;
		max-height: 12rem;
	}

	.media-file-manager-host :global(.wx-info .wx-info-panel) {
		flex: 0 0 auto;
		height: auto;
		min-height: fit-content;
	}

	.media-file-manager-host :global(.wx-info .wx-list) {
		max-height: none;
		overflow: visible;
	}

	.media-file-manager-host :global(.wx-info .wx-list .wx-value) {
		overflow-wrap: anywhere;
	}

	.media-file-manager-host :global(.wx-info .wx-preview .wx-icon-wrapper) {
		background: color-mix(in oklab, var(--color-primary) 6%, var(--color-base-200));
	}

	.media-file-manager-host :global(.wx-info .wx-preview .wx-icon-wrapper > i.wxi-folder) {
		display: none;
	}

	/* Sidebar tree: leaf folders use a placeholder; parents use a chevron — same column width */
	.media-file-manager-host :global(.wx-sidebar .wx-tree .wx-toggle),
	.media-file-manager-host :global(.wx-sidebar .wx-tree .wx-toggle-placeholder) {
		width: 1.5rem;
		min-width: 1.5rem;
		max-width: 1.5rem;
		flex-shrink: 0;
		margin-right: 0 !important;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
	}

	.media-file-manager-host :global(.wx-sidebar .wx-tree .wx-toggle) {
		font-size: 1.5rem;
		line-height: 1;
	}

	.media-file-manager-host :global(.wx-modal .wx-header) {
		color: var(--color-base-content);
	}

	.media-file-manager-host :global(.wx-modal .wx-list li) {
		color: var(--color-base-content);
	}

	/* Delete confirm only (modal with file list): OK matches Button variant="red" */
	.media-file-manager-host :global(.wx-modal:has(.wx-list) .wx-button.wx-primary) {
		background-color: color-mix(in oklab, rgb(239 68 68) 10%, transparent);
		border: 1px solid color-mix(in oklab, rgb(239 68 68) 20%, transparent);
		color: rgb(220 38 38);
		box-shadow: none;
	}

	.media-file-manager-host :global(.wx-modal:has(.wx-list) .wx-button.wx-primary:hover:not(:disabled)) {
		background-image: none;
		background-color: color-mix(in oklab, rgb(239 68 68) 20%, transparent);
	}

	.media-file-manager-host :global(.wx-modal:has(.wx-list) .wx-button.wx-primary.wx-pressed:not(:disabled)),
	.media-file-manager-host
		:global(.wx-modal:has(.wx-list) .wx-button.wx-primary.wx-pressed:hover:not(:disabled)) {
		background-color: color-mix(in oklab, rgb(239 68 68) 28%, transparent);
		box-shadow: none;
	}
</style>
