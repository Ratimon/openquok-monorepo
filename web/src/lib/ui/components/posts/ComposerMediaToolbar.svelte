<script lang="ts">
	import type { SocialPostMediaItem } from '$lib/posts/composerMedia.types';

	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import PictureGeneration from '$lib/ui/components/posts/PictureGeneration.svelte';
	import { mediaRepository } from '$lib/media';
	import { toast } from '$lib/ui/sonner';

	type Props = {
		items?: SocialPostMediaItem[];
		disabled?: boolean;
		uploadUid: string;
		class?: string;
	};

	let { items = $bindable([]), disabled = false, uploadUid, class: className = '' }: Props = $props();

	let fileInput = $state.raw<HTMLInputElement | undefined>(undefined);
	let uploadBusy = $state(false);
	let designOpen = $state(false);

	const iconBtn =
		'border-base-300/90 bg-base-200/45 text-base-content/85 hover:bg-base-300/55 hover:text-base-content focus-visible:ring-primary/40 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border shadow-sm backdrop-blur-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-35';

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

	function onFileChange(e: Event) {
		const t = e.currentTarget as HTMLInputElement;
		void uploadFiles(t.files);
		t.value = '';
	}

	function onAddFromDesign(added: SocialPostMediaItem[]) {
		if (added.length) {
			items = [...items, ...added];
		}
	}
</script>

<div
	class="border-base-300/80 bg-base-100/90 flex items-center gap-1 rounded-xl border p-1 shadow-md backdrop-blur-md {className}"
	role="toolbar"
	aria-label="Post media"
>
	<input
		bind:this={fileInput}
		type="file"
		accept="image/*"
		multiple
		class="hidden"
		onchange={onFileChange}
	/>
	<!-- 1: add images from disk -->
	<button
		type="button"
		class={iconBtn}
		disabled={disabled || uploadBusy}
		onclick={() => fileInput?.click()}
		aria-label="Add images from your device"
		title="Add images"
	>
		{#if uploadBusy}
			<span class="loading loading-spinner loading-sm text-primary"></span>
		{:else}
			<span class="relative inline-flex size-6 items-center justify-center">
				<AbstractIcon name={icons.Image.name} class="size-6" width="24" height="24" />
				<span
					class="bg-primary text-primary-content ring-base-100 absolute -right-1 -bottom-1 flex size-3.5 items-center justify-center rounded-full ring-2"
					aria-hidden="true"
				>
					<AbstractIcon name={icons.Plus.name} class="size-2.5" width="10" height="10" />
				</span>
			</span>
		{/if}
	</button>
	<!-- 2: design / canvas modal -->
	<button
		type="button"
		class={iconBtn}
		disabled={disabled || uploadBusy}
		onclick={() => (designOpen = true)}
		aria-label="Open design editor"
		title="Design media"
	>
		<span class="relative inline-flex size-6 items-center justify-center">
			<AbstractIcon name={icons.Image.name} class="size-6" width="24" height="24" />
			<span class="absolute -right-0.5 -bottom-0.5 flex size-3.5 items-center justify-center rounded-sm bg-base-100/95 shadow-sm ring-1 ring-base-300/80" aria-hidden="true">
				<AbstractIcon name={icons.Pencil.name} class="size-3" width="12" height="12" />
			</span>
		</span>
	</button>
	<!-- 3–4: parity placeholders (not wired yet) -->
	<button type="button" class={iconBtn} disabled aria-label="AI image (coming soon)" title="Coming soon">
		<AbstractIcon name={icons.Sparkles.name} class="size-5" width="20" height="20" />
	</button>
	<button type="button" class={iconBtn} disabled aria-label="Video (coming soon)" title="Coming soon">
		<span class="relative inline-flex size-6 items-center justify-center">
			<AbstractIcon name={icons.ClapperBoard.name} class="size-5" width="20" height="20" />
			<span
				class="bg-primary text-primary-content ring-base-100 absolute -right-1 -bottom-1 flex size-3.5 items-center justify-center rounded-full ring-2"
				aria-hidden="true"
			>
				<AbstractIcon name={icons.Plus.name} class="size-2.5" width="10" height="10" />
			</span>
		</span>
	</button>
</div>

<PictureGeneration bind:open={designOpen} disabled={disabled || uploadBusy} {uploadUid} onAdd={onAddFromDesign} />
