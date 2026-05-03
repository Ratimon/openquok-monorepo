<script lang="ts">
	import type { MediaDeleteViewModel, MediaLibraryItemViewModel } from '$lib/medias/GetMedia.presenter.svelte';

	import { formatBytes, publicUrlForMediaStorageKey } from '$lib/medias';
	import { icons } from '$data/icons';
	import { toast } from '$lib/ui/sonner';

	import MultiMedia from '$lib/ui/components/media/MultiMedia.svelte';
	import { buttonVariants } from '$lib/ui/buttons/Button.svelte';
	import { Dropzone } from '$lib/ui/dropzone';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { cn } from '$lib/ui/helpers/common';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Dialog from '$lib/ui/dialog';

	type Props = {
		mediaItemsVm: MediaLibraryItemViewModel[];
		loading: boolean;
		organizationId: string;
		dragOver: boolean;
		/** Shown in the empty-state dropzone copy (e.g. "1 GB"). */
		uploadLimitLabel: string;
		/** Disables the empty-state file input while uploads run. */
		uploadBusy?: boolean;
		onQueueFiles: (files: FileList | null) => void;
		onSetDragOver: (v: boolean) => void;
		onOpenSettings: (mediaVm: MediaLibraryItemViewModel) => void;
		onReload: () => void | Promise<void>;
		deleteMedia: (mediaVm: MediaLibraryItemViewModel) => Promise<MediaDeleteViewModel>;
	};

	let {
		mediaItemsVm,
		loading,
		organizationId,
		dragOver,
		uploadLimitLabel,
		uploadBusy = false,
		onQueueFiles,
		onSetDragOver,
		onOpenSettings,
		onReload,
		deleteMedia
	}: Props = $props();

	const hasItems = $derived(mediaItemsVm.length > 0);

	let emptyDropzoneFiles = $state<FileList | null>(null);

	function handleEmptyDropzoneChange(): void {
		if (!emptyDropzoneFiles?.length) return;
		onQueueFiles(emptyDropzoneFiles);
		emptyDropzoneFiles = null;
	}

	function handleEmptyDropzoneDrop(event: DragEvent): void {
		onSetDragOver(false);
		const fromTransfer = event.dataTransfer?.files?.length ? event.dataTransfer.files : null;
		onQueueFiles(fromTransfer ?? emptyDropzoneFiles);
		emptyDropzoneFiles = null;
	}

	let deleteConfirmOpen = $state(false);
	let deleteTarget = $state<MediaLibraryItemViewModel | null>(null);
	let deletingPath = $state<string | null>(null);

	let previewOpen = $state(false);
	let previewItem = $state<MediaLibraryItemViewModel | null>(null);
	let previewUrl = $state('');

	function deleteConfirmationCopy(mediaVm: MediaLibraryItemViewModel): string {
		if (mediaVm.kind === 'video') return 'Are you sure you want to delete this video?';
		if (mediaVm.kind === 'image') return 'Are you sure you want to delete this image?';
		return 'Are you sure you want to delete this file?';
	}

	function openDeleteConfirm(mediaVm: MediaLibraryItemViewModel): void {
		deleteTarget = mediaVm;
		deleteConfirmOpen = true;
	}

	function closeDeleteConfirm(): void {
		if (deletingPath) return;
		deleteConfirmOpen = false;
		deleteTarget = null;
	}

	async function confirmDelete(): Promise<void> {
		const mediaVm = deleteTarget;
		if (!mediaVm) return;

		deletingPath = mediaVm.path;
		try {
			if (!organizationId) {
				toast.error('Select a workspace first.');
				return;
			}
			const result = await deleteMedia(mediaVm);
			if (!result.success) {
				toast.error(result.message || 'Could not delete media.');
				return;
			}
			deleteConfirmOpen = false;
			deleteTarget = null;
			await onReload();
			toast.success('Media deleted.');
		} catch {
			toast.error('Could not delete media.');
		} finally {
			deletingPath = null;
		}
	}

	function openPreview(mediaVm: MediaLibraryItemViewModel): void {
		previewItem = mediaVm;
		previewOpen = true;
	}

	$effect(() => {
		if (!previewOpen) {
			previewItem = null;
			previewUrl = '';
			return;
		}
		if (!previewItem) return;

		previewUrl =
			previewItem.publicUrl?.trim() ? previewItem.publicUrl : publicUrlForMediaStorageKey(previewItem.path);
	});
</script>

<div>
	{#if hasItems}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class={`rounded-3xl border-2 border-dashed p-3 transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-base-300/70 bg-base-200/20'}`}
			ondragover={(event) => {
				event.preventDefault();
				onSetDragOver(true);
			}}
			ondragleave={() => onSetDragOver(false)}
			ondrop={(event) => {
				event.preventDefault();
				onSetDragOver(false);
				onQueueFiles(event.dataTransfer?.files ?? null);
			}}
		>
			<div
				class="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
			>
				{#each mediaItemsVm as mediaVm (mediaVm.id)}
					<MultiMedia
						{mediaVm}
						{organizationId}
						onOpen={openPreview}
						onDelete={openDeleteConfirm}
						onSettings={onOpenSettings}
						deleting={deletingPath === mediaVm.path}
					/>
				{/each}
			</div>
		</div>
	{:else}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class={cn(
				'flex min-h-[520px] flex-col rounded-[28px] border-2 border-dashed text-center transition-colors',
				dragOver ? 'border-primary bg-primary/5' : 'border-base-300/70 bg-base-200/20'
			)}
			role="presentation"
			ondragleave={(event) => {
				const next = event.relatedTarget as Node | null;
				if (next && event.currentTarget.contains(next)) return;
				onSetDragOver(false);
			}}
		>
			<Dropzone
				id="media-library-empty-dropzone"
				bind:files={emptyDropzoneFiles}
				multiple
				accept="image/*,video/*"
				disabled={uploadBusy}
				class={cn(
					'flex min-h-[500px] w-full flex-1 cursor-pointer flex-col items-center justify-center gap-4 !h-auto !max-h-none rounded-[26px] border-0 !bg-transparent px-6 py-12 shadow-none hover:!bg-transparent'
				)}
				onDragOver={(event) => {
					event.preventDefault();
					onSetDragOver(true);
				}}
				onDrop={handleEmptyDropzoneDrop}
				onChange={handleEmptyDropzoneChange}
			>
				<AbstractIcon name={icons.Image.name} width="64" height="64" class="text-base-content/50" />
				{#if !uploadBusy}
					<h3 class="text-xl font-bold tracking-tight text-base-content">
						No media uploaded yet</h3>
					<p class="max-w-md text-sm text-base-content/60">
						Get started by uploading images or videos, or drag and drop files here. Maximum {uploadLimitLabel} per
						file.
					</p>
					<span
						class={cn(
							buttonVariants({ variant: 'primary', size: 'default' }),
							'mt-1 inline-flex items-center gap-2'
						)}
					>
						<AbstractIcon name={icons.Image.name} width="16" height="16" class="size-4" />
						Drag and click to upload
					</span>
				{:else}
					<p class="text-sm text-base-content/60">
						Upload in progress…</p>
				{/if}
			</Dropzone>
		</div>
	{/if}

	{#if loading}
		<div class="flex items-center justify-center py-10 text-base-content/65">
			<AbstractIcon name={icons.LoaderCircle.name} class="mr-2 size-4 animate-spin" width="16" height="16" />
			Loading media...
		</div>
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
						<div>
							No preview available for this file type.</div>
					</div>
				{/if}
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
