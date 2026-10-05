<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		main: Snippet;
		sidebar: Snippet;
		class?: string;
	};

	let { main, sidebar, class: className = '' }: Props = $props();
</script>

<div class="container mx-auto max-w-7xl px-4 {className}">
	<div
		class="lg:grid lg:grid-cols-[minmax(0,1fr)_min(100%,18.5rem)] lg:gap-10 xl:gap-12"
	>
		<div class="min-w-0">
			{@render main()}
		</div>

		<aside class="hidden lg:block lg:min-h-0 lg:self-stretch">
			<div
				class="sticky top-24 z-20 max-h-[calc(100dvh-6.5rem)] overflow-y-auto overscroll-contain"
			>
				{@render sidebar()}
			</div>
		</aside>
	</div>
</div>
