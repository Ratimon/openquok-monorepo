<script lang="ts">
	import type { PublicBlogMutationResultViewModel } from '$lib/area-public/PublicBlogBySlugPage.presenter.svelte';

	import { dev } from '$app/environment';
	import { onMount } from 'svelte';

	type Props = {
		postId: string;
		trackBlogView: (postId: string) => Promise<PublicBlogMutationResultViewModel>;
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