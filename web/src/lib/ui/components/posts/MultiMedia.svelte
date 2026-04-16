<script lang="ts">
	import type { SocialPostMediaItem } from '$lib/posts/composerMedia.types';

	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { mediaItemsToPreviewUrls } from '$lib/posts/composerMedia.types';
	import BlobOrHrefImg from '$lib/ui/components/posts/BlobOrHrefImg.svelte';
	import { mediaRepository } from '$lib/core/index';
	import { toast } from '$lib/ui/sonner';

	type Props = {
		items?: SocialPostMediaItem[];
		disabled?: boolean;
		uploadUid: string;
	};

	let { items = $bindable([]), disabled = false, uploadUid }: Props = $props();

	let uploadBusy = $state(false);
	let dragOver = $state(false);

	const previewUrls = $derived(mediaItemsToPreviewUrls(items));

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
		if (!files?.length || disabled || uploadBusy) return;
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
					uploadBusy = false;
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
</script>

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
