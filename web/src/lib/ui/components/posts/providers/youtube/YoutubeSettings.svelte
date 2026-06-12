<script lang="ts">
	import type { YoutubeTagOption } from '$lib/ui/components/posts/providers/provider.types';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import MediaLibraryModal from '$lib/ui/components/media/MediaLibraryModal.svelte';
	import YoutubeTags from '$lib/ui/components/posts/providers/youtube/YoutubeTags.svelte';
	import { Dropzone } from '$lib/ui/dropzone';
	import { uploadSocialPostComposerMediaFiles } from '$lib/posts';
	import { toast } from '$lib/ui/sonner';

	const YOUTUBE_THUMBNAIL_MAX_BYTES = 2 * 1024 * 1024;

	type Props = {
		title?: string;
		type?: 'public' | 'private' | 'unlisted';
		selfDeclaredMadeForKids?: 'yes' | 'no';
		tags?: YoutubeTagOption[];
		thumbnail?: { path: string } | undefined;
		organizationId?: string | null;
		uploadUid?: string;
		disabled?: boolean;
	};

	let {
		title = $bindable(''),
		type = $bindable<'public' | 'private' | 'unlisted'>('public'),
		selfDeclaredMadeForKids = $bindable<'yes' | 'no'>('no'),
		tags = $bindable<YoutubeTagOption[]>([]),
		thumbnail = $bindable<{ path: string } | undefined>(undefined),
		organizationId = null,
		uploadUid = '',
		disabled = false
	}: Props = $props();

	let mediaLibraryOpen = $state(false);
	let uploadBusy = $state(false);
	let dropzoneFiles = $state<FileList | null>(null);

	function validateThumbnailFile(file: File): string | null {
		if (!file.type.toLowerCase().startsWith('image/')) {
			return 'Thumbnail must be an image file.';
		}
		if (file.size > YOUTUBE_THUMBNAIL_MAX_BYTES) {
			return 'Thumbnail must be 2 MB or smaller.';
		}
		return null;
	}

	async function ingestThumbnailFiles(files: FileList | null) {
		if (!files?.length || disabled || uploadBusy) return;
		const file = files[0];
		const validationError = validateThumbnailFile(file);
		if (validationError) {
			toast.error(validationError);
			return;
		}
		if (!uploadUid) {
			toast.error('Upload is not available. Try choosing from the media library.');
			return;
		}
		uploadBusy = true;
		try {
			const transfer = new DataTransfer();
			transfer.items.add(file);
			const batch = await uploadSocialPostComposerMediaFiles(transfer.files, uploadUid);
			if (!batch.ok) {
				toast.error(batch.message);
				return;
			}
			const first = batch.items[0];
			if (first?.path) {
				thumbnail = { path: first.path };
				toast.success('Thumbnail attached.');
			}
		} finally {
			uploadBusy = false;
			dropzoneFiles = null;
		}
	}
</script>

<div class="space-y-4">
	<div class="space-y-1">
		<label class="text-xs font-medium text-base-content/70" for="yt-title">Title</label>
		<input
			id="yt-title"
			type="text"
			maxlength={100}
			class="border-base-300 bg-base-100 w-full rounded-md border px-3 py-2 text-sm"
			placeholder="Video title (2–100 characters)"
			bind:value={title}
			{disabled}
		/>
	</div>

	<div class="space-y-1">
		<label class="text-xs font-medium text-base-content/70" for="yt-privacy">Privacy</label>
		<select
			id="yt-privacy"
			class="border-base-300 bg-base-100 w-full rounded-md border px-3 py-2 text-sm"
			bind:value={type}
			{disabled}
		>
			<option value="public">Public</option>
			<option value="unlisted">Unlisted</option>
			<option value="private">Private</option>
		</select>
	</div>

	<div class="space-y-1">
		<label class="text-xs font-medium text-base-content/70" for="yt-kids">Made for kids</label>
		<select
			id="yt-kids"
			class="border-base-300 bg-base-100 w-full rounded-md border px-3 py-2 text-sm"
			bind:value={selfDeclaredMadeForKids}
			{disabled}
		>
			<option value="no">No</option>
			<option value="yes">Yes</option>
		</select>
	</div>

	<YoutubeTags label="Tags" bind:value={tags} />

	<div class="space-y-2">
		<div class="text-xs font-medium text-base-content/70">Custom thumbnail (optional, max 2 MB)</div>
		{#if thumbnail?.path}
			<p class="text-xs text-base-content/60 break-all">{thumbnail.path}</p>
			<button
				type="button"
				class="text-xs text-error hover:underline"
				onclick={() => (thumbnail = undefined)}
				{disabled}
			>
				Remove thumbnail
			</button>
		{:else}
			<Dropzone
				accept="image/*"
				bind:files={dropzoneFiles}
				disabled={disabled || uploadBusy}
				class="border-primary/25 hover:border-primary/40 bg-base-200/50 h-36 min-h-32 cursor-pointer border-dashed disabled:cursor-not-allowed disabled:opacity-50"
				onChange={(e) => {
					const input = e.currentTarget as HTMLInputElement;
					void ingestThumbnailFiles(input.files);
					input.value = '';
				}}
				onDrop={(e) => {
					const list = e.dataTransfer?.files ?? null;
					void ingestThumbnailFiles(list);
				}}
			>
				<div class="text-base-content/80 pointer-events-none flex flex-col items-center gap-2 px-4 text-center">
					{#if uploadBusy}
						<span class="loading loading-spinner loading-md text-primary"></span>
						<span class="text-sm font-medium">Uploading…</span>
					{:else}
						<span class="relative inline-flex size-10 items-center justify-center text-primary">
							<AbstractIcon name={icons.Images.name} class="size-10" width="40" height="40" />
						</span>
						<div class="space-y-1">
							<p class="text-sm font-medium">Drag and drop a thumbnail here</p>
							<p class="text-base-content/60 text-xs">or click to browse (max 2 MB)</p>
						</div>
					{/if}
				</div>
			</Dropzone>
			<div class="flex items-center gap-3">
				<div class="bg-base-300 h-px flex-1"></div>
				<span class="text-base-content/50 text-xs">or</span>
				<div class="bg-base-300 h-px flex-1"></div>
			</div>
			<button
				type="button"
				class="border-base-300 bg-base-100 hover:bg-base-200 w-full rounded-md border px-3 py-2 text-sm"
				onclick={() => (mediaLibraryOpen = true)}
				disabled={disabled || uploadBusy}
			>
				Choose from media library
			</button>
		{/if}
	</div>
</div>

<MediaLibraryModal
	bind:open={mediaLibraryOpen}
	{organizationId}
	{disabled}
	mediaLocked={true}
	maxAttachBytes={YOUTUBE_THUMBNAIL_MAX_BYTES}
	onAttach={(items) => {
		const first = items[0];
		if (first?.path) {
			thumbnail = { path: first.path };
		}
		mediaLibraryOpen = false;
	}}
/>
