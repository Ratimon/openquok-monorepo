<script lang="ts">
	import type { MediaLibraryItemProgrammerModel } from '$lib/media';

	import { mediaRepository, publicUrlForMediaStorageKey } from '$lib/media';
	import { icons } from '$data/icon';
	import { toast } from '$lib/ui/sonner';

	import Button from '$lib/ui/buttons/Button.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import * as Dialog from '$lib/ui/dialog';

	type Props = {
		open?: boolean;
		item: MediaLibraryItemProgrammerModel | null;
		organizationId: string;
		onSaved?: () => void;
		onClose?: () => void;
	};

	let { open = $bindable(false), item, organizationId, onSaved, onClose }: Props = $props();

	let altText = $state('');
	let newThumbnailPath = $state<string | null>(null);
	/** From upload-simple `publicUrl` after capture (matches server; avoids wrong `/uploads` when using R2). */
	let newThumbnailPublicUrl = $state<string | null>(null);
	let newThumbnailTimestamp = $state<number | null>(null);
	/** User chose Clear; save should persist removal unless they capture a new frame. */
	let thumbnailExplicitlyCleared = $state(false);
	/** Browse vs in-editor (scrub + capture) for video posters. */
	let thumbnailEditorOpen = $state(false);
	let saving = $state(false);
	let capturing = $state(false);
	let initializedForId = $state('');

	let videoEl = $state.raw<HTMLVideoElement | null>(null);
	let canvasEl = $state.raw<HTMLCanvasElement | null>(null);
	let videoPreviewUrl = $state('');
	let thumbPreviewUrl = $state('');
	let durationSec = $state(0);
	let currentTimeSec = $state(0);
	let videoReady = $state(false);

	const isVideo = $derived(item?.kind === 'video');

	/** Cross-origin public video (e.g. R2) must use CORS mode or `canvas.drawImage` leaves the canvas tainted and `toBlob` throws. */
	const videoCrossOriginForCapture = $derived.by((): 'anonymous' | undefined => {
		const href = videoPreviewUrl;
		if (!href.trim() || href.startsWith('blob:')) return undefined;
		if (typeof window === 'undefined') return 'anonymous';
		try {
			const resolved = new URL(href, window.location.href);
			if (resolved.origin === window.location.origin) return undefined;
			return 'anonymous';
		} catch {
			return undefined;
		}
	});

	function thumbSourceHref(pathOrUrl: string | null | undefined): string {
		if (!pathOrUrl) return '';
		if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl;
		return publicUrlForMediaStorageKey(pathOrUrl);
	}

	function posterPreviewSrc(key: string): string {
		if (newThumbnailPath && key === newThumbnailPath && newThumbnailPublicUrl?.trim()) {
			return newThumbnailPublicUrl;
		}
		if (item?.thumbnail && key === item.thumbnail && item.thumbnailPublicUrl?.trim()) {
			return item.thumbnailPublicUrl;
		}
		return thumbSourceHref(key);
	}

	$effect(() => {
		if (!open) {
			initializedForId = '';
			thumbnailEditorOpen = false;
			return;
		}
		if (!item) return;
		if (item.id !== initializedForId) {
			initializedForId = item.id;
			altText = item.alt ?? '';
			newThumbnailPath = null;
			newThumbnailPublicUrl = null;
			newThumbnailTimestamp = null;
			thumbnailExplicitlyCleared = false;
			thumbnailEditorOpen = false;
		}
	});

	$effect(() => {
		if (!open || !item || !isVideo || !thumbnailEditorOpen) {
			videoPreviewUrl = '';
			durationSec = 0;
			currentTimeSec = 0;
			videoReady = false;
			return;
		}

		videoPreviewUrl = item.publicUrl?.trim() ? item.publicUrl : publicUrlForMediaStorageKey(item.path);
	});

	$effect(() => {
		if (!open || !item) {
			thumbPreviewUrl = '';
			return;
		}
		const key = thumbnailExplicitlyCleared ? null : (newThumbnailPath ?? item.thumbnail ?? null);
		if (!key) {
			thumbPreviewUrl = '';
			return;
		}
		thumbPreviewUrl = posterPreviewSrc(key);
	});

	function onVideoMeta(): void {
		const v = videoEl;
		if (!v) return;
		durationSec = Number.isFinite(v.duration) ? v.duration : 0;
		videoReady = true;
	}

	function onVideoTime(): void {
		const v = videoEl;
		if (!v) return;
		currentTimeSec = v.currentTime;
	}

	function seekVideo(t: number): void {
		const v = videoEl;
		if (!v) return;
		v.currentTime = t;
		currentTimeSec = t;
	}

	function formatTime(seconds: number): string {
		const s = Math.max(0, seconds);
		const m = Math.floor(s / 60);
		const r = Math.floor(s % 60);
		return `${m}:${r.toString().padStart(2, '0')}`;
	}

	async function captureFrame(): Promise<void> {
		const v = videoEl;
		const c = canvasEl;
		if (!v || !c || !item || !organizationId) {
			toast.error('Video is not ready yet.');
			return;
		}
		capturing = true;
		try {
			c.width = v.videoWidth || 640;
			c.height = v.videoHeight || 360;
			const ctx = c.getContext('2d');
			if (!ctx) {
				toast.error('Could not read the video frame.');
				return;
			}
			ctx.drawImage(v, 0, 0, c.width, c.height);
			let blob: Blob | null = null;
			try {
				blob = await new Promise<Blob | null>((resolve) =>
					c.toBlob((b) => resolve(b), 'image/jpeg', 0.82)
				);
			} catch (e) {
				if (e instanceof DOMException && e.name === 'SecurityError') {
					toast.error(
						'Cannot export this frame: the video is cross-origin without CORS. Add a CORS rule on your object storage allowing GET from this site (e.g. R2 bucket → CORS: expose your app origin). Then reload and try again.'
					);
					return;
				}
				throw e;
			}
			if (!blob) {
				toast.error('Could not encode the frame.');
				return;
			}
			const up = await mediaRepository.uploadMediaSimple({
				organizationId,
				file: blob,
				filename: 'thumbnail.jpg',
				preventSave: true
			});
			if (!up.success) {
				toast.error(up.message);
				return;
			}
			newThumbnailPath = up.path;
			newThumbnailPublicUrl =
				up.publicUrl?.trim() ? up.publicUrl : publicUrlForMediaStorageKey(up.path);
			newThumbnailTimestamp = Math.round(currentTimeSec * 1000);
			thumbnailExplicitlyCleared = false;
			thumbnailEditorOpen = false;
			toast.success('Thumbnail frame captured. Save to apply.');
		} finally {
			capturing = false;
		}
	}

	function openThumbnailEditor(): void {
		thumbnailEditorOpen = true;
	}

	function closeThumbnailEditor(): void {
		thumbnailEditorOpen = false;
	}

	function clearThumbnail(): void {
		newThumbnailPath = null;
		newThumbnailPublicUrl = null;
		newThumbnailTimestamp = null;
		thumbnailExplicitlyCleared = true;
		thumbnailEditorOpen = false;
	}

	async function save(): Promise<void> {
		if (!item || !organizationId) return;
		saving = true;
		try {
			let thumbOut: string | null;
			let tsOut: number | null;
			if (!isVideo) {
				thumbOut = item.thumbnail ?? null;
				tsOut = null;
			} else if (thumbnailExplicitlyCleared && !newThumbnailPath) {
				thumbOut = null;
				tsOut = null;
			} else {
				thumbOut = newThumbnailPath ?? item.thumbnail ?? null;
				tsOut =
					thumbOut === null
						? null
						: newThumbnailTimestamp !== null
							? newThumbnailTimestamp
							: (item.thumbnailTimestamp ?? null);
			}
			const result = await mediaRepository.saveMediaInformation({
				organizationId,
				id: item.id,
				alt: altText.trim() || null,
				thumbnail: thumbOut,
				thumbnailTimestamp: tsOut
			});
			if (!result.success) {
				toast.error(result.message);
				return;
			}
			toast.success('Media details saved.');
			open = false;
			onSaved?.();
			onClose?.();
		} finally {
			saving = false;
		}
	}

	function close(): void {
		if (saving) return;
		open = false;
		onClose?.();
	}
</script>

<Dialog.Root
	bind:open
	onOpenChange={(o) => {
		if (!o) onClose?.();
	}}
>
	<Dialog.Content class="max-h-[min(90vh,720px)] w-[min(96vw,32rem)] max-w-[min(96vw,32rem)] overflow-y-auto">
		{#if item}
			<Dialog.Header>
				<Dialog.Title class="flex items-center gap-2">
					<AbstractIcon name={icons.Settings.name} class="size-5" width="20" height="20" />
					Media details
				</Dialog.Title>
				<Dialog.Description class="text-base-content/75 text-sm">
					Accessibility and optional video poster frame.
				</Dialog.Description>
			</Dialog.Header>

			<div class="mt-4 flex flex-col gap-4">
				<div class="flex flex-col gap-1.5">
					<label class="text-sm font-medium text-base-content" for="media-alt-{item.id}">Alt text</label>
					<input
						id="media-alt-{item.id}"
						type="text"
						class="border-base-300 bg-base-100 focus:ring-primary/30 rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
						placeholder="Describe this asset for screen readers"
						bind:value={altText}
						maxlength={2000}
					/>
				</div>

				{#if isVideo}
					<div class="flex flex-col gap-3">
						<div class="text-sm font-medium text-base-content">Video poster</div>

						{#if !thumbnailEditorOpen}
							{#if thumbPreviewUrl}
								<div class="flex flex-col gap-1.5">
									<span class="text-xs text-base-content/70">Current thumbnail</span>
									<img
										src={thumbPreviewUrl}
										alt=""
										class="border-base-300 max-h-56 w-full rounded-lg border object-contain"
									/>
								</div>
							{:else if thumbnailExplicitlyCleared}
								<p class="text-sm text-base-content/60">
									Poster will be removed when you save. You can still create a new one before saving.
								</p>
							{:else}
								<p class="text-sm text-base-content/60">No poster yet — pick a frame from the video.</p>
							{/if}

							<div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
								<Button type="button" variant="secondary" disabled={saving} onclick={openThumbnailEditor}>
									<AbstractIcon name={icons.Image.name} class="size-4" width="16" height="16" />
									{(newThumbnailPath || item.thumbnail) && !thumbnailExplicitlyCleared
										? 'Edit thumbnail'
										: 'Create thumbnail'}
								</Button>
								{#if (newThumbnailPath || item.thumbnail) && !thumbnailExplicitlyCleared}
									<Button type="button" variant="red" disabled={saving} onclick={clearThumbnail}>
										Clear thumbnail
									</Button>
								{/if}
							</div>
						{:else}
							<div class="flex flex-col gap-3">
								<button
									type="button"
									class="text-base-content/80 hover:text-base-content inline-flex items-center gap-2 self-start text-sm font-medium transition-colors"
									onclick={closeThumbnailEditor}
								>
									<AbstractIcon name={icons.ArrowLeft.name} class="size-4" width="16" height="16" />
									Back
								</button>

								{#if videoPreviewUrl}
									<!-- svelte-ignore a11y_media_has_caption -->
									<video
										bind:this={videoEl}
										src={videoPreviewUrl}
										crossorigin={videoCrossOriginForCapture ?? undefined}
										class="bg-base-200 max-h-48 w-full rounded-lg object-contain"
										muted
										playsinline
										preload="metadata"
										onloadedmetadata={onVideoMeta}
										ontimeupdate={onVideoTime}
									></video>
								{:else}
									<div class="bg-base-200 text-base-content/60 flex min-h-32 items-center justify-center rounded-lg text-sm">
										Loading video…
									</div>
								{/if}
								<canvas bind:this={canvasEl} class="hidden"></canvas>

								{#if videoReady && durationSec > 0}
									<label class="text-xs text-base-content/70" for="media-thumb-scrub-{item.id}">
										Choose frame ({formatTime(currentTimeSec)} / {formatTime(durationSec)})
									</label>
									<input
										id="media-thumb-scrub-{item.id}"
										type="range"
										min={0}
										max={durationSec}
										step="0.05"
										value={currentTimeSec}
										class="range range-sm range-primary w-full"
										oninput={(e) => seekVideo(Number((e.currentTarget as HTMLInputElement).value))}
									/>
								{/if}

								<Button
									type="button"
									variant="secondary"
									disabled={capturing || !videoReady || !videoPreviewUrl}
									onclick={() => void captureFrame()}
								>
									{#if capturing}
										<AbstractIcon name={icons.LoaderCircle.name} class="size-4 animate-spin" width="16" height="16" />
									{:else}
										<AbstractIcon name={icons.Image.name} class="size-4" width="16" height="16" />
									{/if}
									Use current frame as thumbnail
								</Button>

								{#if thumbPreviewUrl}
									<div class="text-xs font-medium text-base-content/80">Preview</div>
									<img src={thumbPreviewUrl} alt="" class="border-base-300 max-h-40 rounded-lg border object-contain" />
								{/if}
							</div>
						{/if}
					</div>
				{/if}
			</div>

			{#if !isVideo || !thumbnailEditorOpen}
			<Dialog.Footer class="mt-6 gap-2 sm:justify-end">
				<Button type="button" variant="ghost" disabled={saving} onclick={close}>Cancel</Button>
				<Button type="button" variant="primary" disabled={saving} onclick={() => void save()}>
					{#if saving}
						<AbstractIcon name={icons.LoaderCircle.name} class="size-4 animate-spin" width="16" height="16" />
					{:else}
						<AbstractIcon name={icons.Save.name} class="size-4" width="16" height="16" />
					{/if}
					Save
				</Button>
			</Dialog.Footer>
			{/if}
		{/if}
	</Dialog.Content>
</Dialog.Root>
