<script lang="ts">
	import type { MediaLibraryItemProgrammerModel } from '$lib/media';
	import type { SocialPostMediaItem } from '$lib/posts/composerMedia.types';

	import { mediaRepository, publicUrlForMediaStorageKey } from '$lib/media';
	import { mediaItemsToPreviewUrls } from '$lib/posts/composerMedia.types';
	import { icons } from '$data/icon';
	import { toast } from '$lib/ui/sonner';

	import BlobOrHrefImg from '$lib/ui/components/posts/BlobOrHrefImg.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		item?: MediaLibraryItemProgrammerModel;
		onOpen?: (item: MediaLibraryItemProgrammerModel) => void;
		onDelete?: (item: MediaLibraryItemProgrammerModel) => void;
		onSettings?: (item: MediaLibraryItemProgrammerModel) => void;
		organizationId?: string;
		deleting?: boolean;
		items?: SocialPostMediaItem[];
		disabled?: boolean;
		uploadUid?: string;
	};

	let {
		item,
		onOpen,
		onDelete,
		onSettings,
		organizationId = '',
		deleting = false,
		items = $bindable([]),
		disabled = false,
		uploadUid = ''
	}: Props = $props();

	let previewUrl = $state('');
	let uploadBusy = $state(false);
	let dragOver = $state(false);

	const isLibraryMode = $derived(Boolean(item));
	const previewUrls = $derived(mediaItemsToPreviewUrls(items));
	const isImage = $derived(item?.kind === 'image');
	const isVideo = $derived(item?.kind === 'video');
	const isPreviewable = $derived(isImage || isVideo);
	/** Saved poster path: grid should show this image, not the first frame of the video file. */
	const videoUsesPosterImage = $derived(Boolean(isVideo && item?.thumbnail));
	const kindLabel = $derived(
		item?.kind === 'document'
			? 'PDF'
			: item?.kind === 'audio'
				? 'Audio'
				: item?.kind === 'other'
					? 'File'
					: item?.kind
						? item.kind.charAt(0).toUpperCase() + item.kind.slice(1)
						: ''
	);

	function removeAt(index: number) {
		items = items.filter((_, i) => i !== index);
	}

	function move(from: number, to: number) {
		if (to < 0 || to >= items.length) return;
		const next = [...items];
		const [row] = next.splice(from, 1);
		next.splice(to, 0, row);
		items = next;
	}

	async function uploadFiles(files: FileList | null) {
		if (!files?.length || disabled || uploadBusy || !uploadUid) return;
		const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
		if (!list.length) {
			toast.error('Add image files only.');
			return;
		}
		uploadBusy = true;
		const added: SocialPostMediaItem[] = [];
		try {
			for (const file of list) {
				const result = await mediaRepository.uploadMedia(file, uploadUid);
				if (result.success && result.data.filePath) {
					added.push({ id: crypto.randomUUID(), path: result.data.filePath, bucket: 'social_media' });
				} else {
					toast.error(result.message || 'Upload failed.');
					return;
				}
			}
			items = [...items, ...added];
			if (added.length) {
				toast.success(added.length === 1 ? 'Image attached.' : 'Images attached.');
			}
		} finally {
			uploadBusy = false;
		}
	}

	function onDropZoneDrop(e: DragEvent) {
		e.preventDefault();
		dragOver = false;
		if (disabled || uploadBusy) return;
		void uploadFiles(e.dataTransfer?.files ?? null);
	}

	$effect(() => {
		if (!item) {
			previewUrl = '';
			return;
		}

		if (item.kind === 'video' && item.thumbnail) {
			const raw = item.thumbnail.trim();
			const base =
				item.thumbnailPublicUrl?.trim()
					? item.thumbnailPublicUrl
					: raw.startsWith('http://') || raw.startsWith('https://')
						? raw
						: publicUrlForMediaStorageKey(raw);
			const sep = base.includes('?') ? '&' : '?';
			previewUrl =
				item.thumbnailTimestamp != null ? `${base}${sep}thumbTs=${item.thumbnailTimestamp}` : base;
			return;
		}

		previewUrl = item.publicUrl?.trim() ? item.publicUrl : publicUrlForMediaStorageKey(item.path);
	});
</script>

{#if isLibraryMode && item}
	<div class="group relative overflow-hidden rounded-lg border border-base-300/70 bg-base-100 shadow-sm">
		<button
			type="button"
			class="relative aspect-square w-full overflow-hidden bg-base-200 text-left"
			onclick={() => isPreviewable && onOpen?.(item)}
			disabled={!isPreviewable}
		>
			{#if isImage && previewUrl}
				<img src={previewUrl} alt={item.name} class="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]" loading="lazy" />
			{:else if isVideo && videoUsesPosterImage && previewUrl}
				<img
					src={previewUrl}
					alt={item.alt?.trim() || item.name}
					class="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
					loading="lazy"
				/>
				<div class="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/10">
					<div class="rounded-full bg-black/55 p-3 text-white">
						<AbstractIcon name={icons.ClapperBoard.name} class="size-5" width="20" height="20" />
					</div>
				</div>
			{:else if isVideo && previewUrl}
				<!-- svelte-ignore a11y_media_has_caption -->
				<video
					src={previewUrl}
					class="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
					muted
					playsinline
					preload="metadata"
				></video>
				<div class="absolute inset-0 flex items-center justify-center bg-black/10">
					<div class="rounded-full bg-black/55 p-3 text-white">
						<AbstractIcon name={icons.ClapperBoard.name} class="size-5" width="20" height="20" />
					</div>
				</div>
			{:else}
				<div class="flex h-full w-full flex-col items-center justify-center gap-3 px-4 text-base-content/65">
					<AbstractIcon
						name={item.kind === 'audio' ? icons.Activity.name : icons.FileText.name}
						class="size-10"
						width="40"
						height="40"
					/>
					<div class="text-xs font-medium uppercase tracking-[0.2em]">{kindLabel}</div>
				</div>
			{/if}

			<div
				class="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent px-2 py-2 text-white sm:px-2.5 sm:py-2.5"
			>
				<div class="truncate text-[11px] font-medium leading-tight sm:text-xs">{item.name}</div>
			</div>
		</button>

		<div class="absolute top-3 right-3 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
			{#if isPreviewable}
				<button
					type="button"
					class="flex h-9 w-9 items-center justify-center rounded-full bg-base-100/95 text-base-content shadow-sm"
					onclick={() => onOpen?.(item)}
					aria-label="Preview media"
				>
					<AbstractIcon name={icons.Eye.name} class="size-4" width="16" height="16" />
				</button>
			{/if}
			{#if onSettings}
				<button
					type="button"
					class="flex h-9 w-9 items-center justify-center rounded-full bg-base-100/95 text-base-content shadow-sm"
					onclick={(e) => {
						e.stopPropagation();
						onSettings(item);
					}}
					aria-label="Media details"
				>
					<AbstractIcon name={icons.Settings.name} class="size-4" width="16" height="16" />
				</button>
			{/if}
			<button
				type="button"
				class="flex h-9 w-9 items-center justify-center rounded-full bg-base-100/95 text-red-500 shadow-sm"
				onclick={() => onDelete?.(item)}
				disabled={deleting}
				aria-label="Delete media"
			>
				{#if deleting}
					<AbstractIcon name={icons.LoaderCircle.name} class="size-4 animate-spin" width="16" height="16" />
				{:else}
					<AbstractIcon name={icons.Trash.name} class="size-4" width="16" height="16" />
				{/if}
			</button>
		</div>
	</div>
{:else}
	<div class="flex flex-col gap-2">
		{#if items.length > 0}
			<div class="flex flex-wrap gap-2 px-0.5">
				{#each items as m, index (m.id)}
					<div
						class="border-base-300 bg-base-200/40 relative h-11 w-11 shrink-0 overflow-hidden rounded-md border"
					>
						<BlobOrHrefImg href={previewUrls[index]} alt="" class="h-full w-full object-cover" loading="lazy" />
						<div class="absolute top-0.5 left-0 flex flex-col gap-0.5">
							<button
								type="button"
								class="bg-base-100/90 text-base-content/80 hover:text-base-content flex h-5 w-5 items-center justify-center rounded-sm text-[10px] leading-none shadow-sm disabled:opacity-40"
								disabled={disabled || index === 0}
								onclick={() => move(index, index - 1)}
								aria-label="Move earlier"
							>
								<AbstractIcon name={icons.ChevronUp.name} class="size-3.5" width="14" height="14" />
							</button>
							<button
								type="button"
								class="bg-base-100/90 text-base-content/80 hover:text-base-content flex h-5 w-5 items-center justify-center rounded-sm text-[10px] leading-none shadow-sm disabled:opacity-40"
								disabled={disabled || index === items.length - 1}
								onclick={() => move(index, index + 1)}
								aria-label="Move later"
							>
								<AbstractIcon name={icons.ChevronDown.name} class="size-3.5" width="14" height="14" />
							</button>
						</div>
						<button
							type="button"
							class="bg-base-100/95 text-base-content/90 hover:bg-error/90 hover:text-error-content absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full shadow-sm"
							disabled={disabled}
							onclick={() => removeAt(index)}
							aria-label="Remove image"
						>
							<AbstractIcon name={icons.X2.name} class="size-3.5" width="14" height="14" />
						</button>
					</div>
				{/each}
			</div>
		{/if}

		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="border-base-300/80 text-base-content/50 flex min-h-[2.25rem] flex-wrap items-center gap-2 border-t pt-2 text-[11px]"
			ondragover={(e) => {
				e.preventDefault();
				if (!disabled) dragOver = true;
			}}
			ondragleave={() => (dragOver = false)}
			ondrop={onDropZoneDrop}
		>
			{#if dragOver}
				<span class="text-primary font-medium">Drop images here to attach</span>
			{:else}
				<span>Drag and drop images here, or use the icons on the editor.</span>
			{/if}
		</div>
	</div>
{/if}
