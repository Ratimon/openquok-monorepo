<script lang="ts">
	import InstagramTags from '$lib/ui/components/launches/providers/instagram/InstagramTags.svelte';

	type Props = {
		postType?: 'post' | 'story';
		collaborators?: string[];
		trialReel?: boolean;
	};

	let {
		postType = $bindable('post'),
		collaborators = $bindable([]),
		trialReel = $bindable(false)
	}: Props = $props();

	const showCollaborators = $derived(postType !== 'story');
</script>

<div class="space-y-4">
	<div class="space-y-1">
		<label class="text-xs font-medium text-base-content/70" for="ig-post-type">Post Type</label>
		<select
			id="ig-post-type"
			class="border-base-300 bg-base-100 w-full rounded-md border px-3 py-2 text-sm"
			bind:value={postType}
		>
			<option value="post">Post / Reel</option>
			<option value="story">Story</option>
		</select>
	</div>

	{#if showCollaborators}
		<InstagramTags
			label="Collaborators (max 3) - accounts can't be private"
			bind:value={collaborators}
			maxTags={3}
			placeholder="Add a tag"
		/>
	{/if}

	<label class="flex items-center gap-2 text-sm text-base-content/80">
		<input type="checkbox" class="checkbox checkbox-primary" bind:checked={trialReel} />
		Trial Reel (share only to non-followers first)
	</label>

	{#if trialReel}
		<p class="text-xs text-base-content/50">
			Trial Reel options are not fully implemented yet (UI only).
		</p>
	{/if}
</div>
