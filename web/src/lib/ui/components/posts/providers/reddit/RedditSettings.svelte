<script lang="ts">
	import ProviderSubredditInput from '$lib/ui/components/posts/providers/ProviderSubredditInput.svelte';
	import { REDDIT_TITLE_MAX_LENGTH } from '$lib/ui/components/posts/providers/reddit/reddit.provider';

	type Props = {
		subreddit?: string;
		title?: string;
		disabled?: boolean;
	};

	let { subreddit = $bindable(''), title = $bindable(''), disabled = false }: Props = $props();
</script>

<div class="space-y-4">
	<div class="space-y-1">
		<label class="text-xs font-medium text-base-content/70" for="reddit-subreddit"
			>Community or profile</label
		>
		<ProviderSubredditInput id="reddit-subreddit" bind:value={subreddit} {disabled} />
		<p class="text-xs text-base-content/50">
			Optional for copy-only posts.
		</p>
	</div>

	<div class="space-y-1">
		<label class="text-xs font-medium text-base-content/70" for="reddit-title">Title</label>
		<input
			id="reddit-title"
			type="text"
			class="border-base-300 bg-base-100 w-full rounded-md border px-3 py-2 text-sm"
			placeholder="Post title"
			maxlength={REDDIT_TITLE_MAX_LENGTH}
			bind:value={title}
			{disabled}
		/>
		<p class="text-xs text-base-content/50">
			Optional for copy-only posts. Post body and links
			come from the post editor caption (including the toolbar link button). Up to
			{REDDIT_TITLE_MAX_LENGTH} characters.
		</p>
	</div>
</div>
