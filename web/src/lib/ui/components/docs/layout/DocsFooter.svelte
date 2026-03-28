<script lang="ts">
	import type { NavItem } from '$lib/docs/types';

	import { docsConfig } from '$lib/docs/constants';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	let { prev, next }: { prev?: NavItem; next?: NavItem } = $props();

	let scrollProgress = $state(0);

	function updateProgress() {
		const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
		scrollProgress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
	}
</script>

<svelte:window onscroll={updateProgress} />

<footer class="bg-base-100 border-base-300 sticky bottom-0 z-40 border-t">
	<div class="flex h-12 items-center justify-between px-4">
		<div class="flex-1">
			{#if prev}
				<a
					href={prev.href}
					class="text-base-content/70 hover:text-base-content inline-flex items-center gap-1 text-sm transition-colors"
				>
					<AbstractIcon name="ChevronLeft" class="size-4" width="16" height="16" />
					<span class="hidden sm:inline">{prev.title}</span>
					<span class="sm:hidden">Previous</span>
				</a>
			{/if}
		</div>
		<span class="text-base-content/60 text-xs">
			© {new Date().getFullYear()}
			{docsConfig.site.title}
		</span>
		<div class="flex flex-1 justify-end">
			{#if next}
				<a
					href={next.href}
					class="text-base-content/70 hover:text-base-content inline-flex items-center gap-1 text-sm transition-colors"
				>
					<span class="hidden sm:inline">{next.title}</span>
					<span class="sm:hidden">Next</span>
					<AbstractIcon name="ChevronRight" class="size-4" width="16" height="16" />
				</a>
			{/if}
		</div>
	</div>
	<div class="bg-base-200 h-1 w-full overflow-hidden">
		<div class="bg-primary h-full transition-[width] duration-150" style:width="{scrollProgress}%"></div>
	</div>
	<div class="h-2"></div>
</footer>
