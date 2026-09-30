<script lang="ts">
	import { normalizeHttpUrlInput } from '$lib/utils/normalizeHttpUrlInput';

	type Props = {
		postType?: 'post' | 'story';
		url?: string;
	};

	let { postType = $bindable('post'), url = $bindable('') }: Props = $props();

	const showEmbeddedUrl = $derived(postType !== 'story');

	function normalizeEmbeddedUrlOnBlur() {
		const trimmed = url.trim();
		if (!trimmed) return;
		const normalized = normalizeHttpUrlInput(trimmed);
		if (normalized !== url) url = normalized;
	}
</script>

<div class="space-y-4">
	<div class="space-y-1">
		<label class="text-xs font-medium text-base-content/70" for="fb-post-type">
			Post Type
		</label>
		<select
			id="fb-post-type"
			class="border-base-300 bg-base-100 w-full rounded-md border px-3 py-2 text-sm"
			bind:value={postType}
		>
			<option value="post">Post</option>
			<option value="story">Story</option>
		</select>
		{#if postType === 'story'}
			<p class="text-xs text-base-content/50">
				Each attachment publishes as its own Story.
			</p>
		{/if}
	</div>

	{#if showEmbeddedUrl}
		<div class="space-y-1">
			<label class="text-xs font-medium text-base-content/70" for="fb-embedded-url">
				Embedded URL (only for text Post)
			</label>
			<input
				id="fb-embedded-url"
				type="text"
				class="border-base-300 bg-base-100 w-full rounded-md border px-3 py-2 text-sm"
				placeholder="https://example.com/article"
				bind:value={url}
				onblur={normalizeEmbeddedUrlOnBlur}
			/>
			<p class="text-xs text-base-content/50">
				Optional link preview for text-only posts. Ignored when photos or video are attached.
			</p>
		</div>
	{/if}
</div>
