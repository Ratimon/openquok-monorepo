<script lang="ts">
	import { dev } from '$app/environment';
	import { onMount } from 'svelte';

	import type { BlogUpsertProgrammerModel } from '$lib/blog/index';

	type Props = {
		postId: string;
		trackBlogView: (postId: string) => Promise<BlogUpsertProgrammerModel>;
	};

	let { postId, trackBlogView }: Props = $props();

	onMount(() => {
		// console.log('[BlogViewPixel] onMount', { postId });

		if (!postId) return;
		void trackBlogView(postId).then((result) => {
			if (dev) {
				console.debug('[BlogViewPixel] trackBlogView', { postId, ...result });
			}
		});
	});
</script>

<!-- Invisible hook: records a view when mounted (client). -->
