<script lang="ts" module>
	type UploadKind = 'image' | 'svg' | 'gif' | 'video';

	export type UploadAsset = {
		id: string;
		kind: UploadKind;
		/** Object URL for the source file (Konva image layer). */
		src: string;
		/** Grid thumbnail (`src` for still assets; raster frame for video). */
		preview: string;
	};

	let cachedAssets: UploadAsset[] = [];

	function classifyFile(file: File): UploadKind | null {
		const t = file.type.toLowerCase();
		const name = file.name.toLowerCase();
		if (t.includes('svg') || name.endsWith('.svg')) return 'svg';
		if (t.includes('gif') || name.endsWith('.gif')) return 'gif';
		if (t.startsWith('image/')) return 'image';
		if (t.startsWith('video/')) return 'video';
		if (t.startsWith('audio/')) return null;
		if (/\.(png|jpe?g|webp|bmp|ico)$/i.test(name)) return 'image';
		return null;
	}
</script>

<script lang="ts">
	import type { KonvaCanvasApi } from '$lib/ui/canvas-editor/canvas/konvaCanvasApi';

	import { getVideoPreview } from '$lib/canvas/utils/video';

	import { icons } from '$data/icons';
	import Button from '$lib/ui/buttons/Button.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { ScrollArea } from '$lib/ui/scroll-area';

	interface Props {
		disabled?: boolean;
		canvasApi: KonvaCanvasApi | null;
	}

	let { disabled = false, canvasApi }: Props = $props();

	let uploadInput = $state.raw<HTMLInputElement | undefined>(undefined);
	let loading = $state(false);
	let assets = $state<UploadAsset[]>([...cachedAssets]);

	$effect(() => {
		cachedAssets = assets;
	});

	async function ingestFiles(fileList: File[] | FileList | null | undefined) {
		if (!fileList?.length) return;
		loading = true;
		try {
			const next: UploadAsset[] = [...assets];
			for (const file of Array.from(fileList)) {
				const kind = classifyFile(file);
				if (!kind) continue;
				const src = URL.createObjectURL(file);
				let preview = src;
				if (kind === 'video') {
					try {
						preview = await getVideoPreview(src);
					} catch {
						URL.revokeObjectURL(src);
						continue;
					}
				}
				next.push({
					id: crypto.randomUUID(),
					kind,
					src,
					preview
				});
			}
			assets = next;
		} finally {
			loading = false;
		}
	}

	function onFileInput(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		void ingestFiles(input.files);
		input.value = '';
	}

	function onDropUpload(e: DragEvent) {
		e.preventDefault();
		void ingestFiles(e.dataTransfer?.files);
	}

	function placeOnCanvas(asset: UploadAsset) {
		if (!canvasApi) return;
		if (asset.kind === 'video') {
			canvasApi.addImageFromUrl(asset.preview);
		} else {
			canvasApi.addImageFromUrl(asset.src);
		}
	}

	const busy = $derived(disabled || !canvasApi);
</script>

<div class="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden">
	<p class="text-base-content/70 shrink-0 text-center text-xs leading-snug">
		Upload your assets. Multiple files stay here so you can add them to the canvas when ready. Video is added
		as a still frame.
	</p>

	<input
		bind:this={uploadInput}
		type="file"
		multiple
		accept="image/*,video/*"
		class="hidden"
		onchange={onFileInput}
	/>

	<Button
		type="button"
		variant="primary"
		size="default"
		class="w-full shrink-0"
		disabled={busy || loading}
		onclick={() => uploadInput?.click()}
	>
		<AbstractIcon name={icons.SquarePlus.name} class="mr-2 size-4 shrink-0" width="16" height="16" />
		Upload from device
	</Button>

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="border-base-300 hover:border-primary/40 flex min-h-[120px] shrink-0 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-center text-sm transition-colors"
		ondragover={(e) => e.preventDefault()}
		ondrop={onDropUpload}
		onclick={() => uploadInput?.click()}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Enter' && uploadInput?.click()}
	>
		<AbstractIcon name={icons.SquarePlus.name} class="size-10 opacity-60" width="40" height="40" />
		<span class="text-base-content/70">Drop files here or click to browse</span>
	</div>

	{#if loading}
		<p class="text-base-content/60 shrink-0 text-center text-xs">
			Processing uploads…</p>
	{/if}

	{#if assets.length > 0}
		<p class="text-base-content/70 shrink-0 text-sm font-medium">
			Your uploads</p>
		<ScrollArea class="min-h-0 min-w-0 flex-1 basis-0" viewportClass="pr-0.5">
			<div class="grid min-w-0 grid-cols-2 gap-2 pb-1">
				{#each assets as asset (asset.id)}
					<button
						type="button"
						class="border-base-300 hover:border-primary/50 group relative aspect-[4/5] w-full min-w-0 overflow-hidden rounded-lg border transition-colors disabled:opacity-40"
						disabled={busy}
						title={asset.kind === 'video' ? 'Add still frame to canvas' : 'Add to canvas'}
						onclick={() => placeOnCanvas(asset)}
					>
						<img
							src={asset.preview}
							alt=""
							class="pointer-events-none h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
							draggable="false"
						/>
						{#if asset.kind === 'video'}
							<span
								class="bg-base-300/90 text-base-content absolute bottom-1 left-1 rounded px-1.5 py-0.5 text-[10px] font-medium"
							>
								Video
							</span>
						{/if}
					</button>
				{/each}
			</div>
		</ScrollArea>
	{/if}
</div>
