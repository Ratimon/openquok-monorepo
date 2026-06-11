<script lang="ts">
	import type { YoutubeTagOption } from '$lib/ui/components/posts/providers/provider.types';

	import MediaLibraryModal from '$lib/ui/components/media/MediaLibraryModal.svelte';
	import YoutubeTags from '$lib/ui/components/posts/providers/youtube/YoutubeTags.svelte';

	type Props = {
		title?: string;
		type?: 'public' | 'private' | 'unlisted';
		selfDeclaredMadeForKids?: 'yes' | 'no';
		tags?: YoutubeTagOption[];
		thumbnail?: { path: string } | undefined;
		organizationId?: string | null;
		disabled?: boolean;
	};

	let {
		title = $bindable(''),
		type = $bindable<'public' | 'private' | 'unlisted'>('public'),
		selfDeclaredMadeForKids = $bindable<'yes' | 'no'>('no'),
		tags = $bindable<YoutubeTagOption[]>([]),
		thumbnail = $bindable<{ path: string } | undefined>(undefined),
		organizationId = null,
		disabled = false
	}: Props = $props();

	let mediaLibraryOpen = $state(false);
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
		<div class="text-xs font-medium text-base-content/70">Custom thumbnail (optional)</div>
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
			<button
				type="button"
				class="border-base-300 bg-base-100 hover:bg-base-200 rounded-md border px-3 py-2 text-sm"
				onclick={() => (mediaLibraryOpen = true)}
				{disabled}
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
	onAttach={(items) => {
		const first = items[0];
		if (first?.path) {
			thumbnail = { path: first.path };
		}
		mediaLibraryOpen = false;
	}}
/>
